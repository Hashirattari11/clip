import fs from "fs";
import path from "path";
import { ClipSuggestion, TranscriptSegment } from "./types";

export type AIProvider = "gemini" | "openai" | "none";

export interface ApiKeyConfig {
  apiKey?: string;
  provider?: string;
  browser?: string;
  userId?: string;
}

function getSettingsKey(): string | undefined {
  try {
    const settingsFile = path.join(process.cwd(), "data", "settings.json");
    if (fs.existsSync(settingsFile)) {
      const settings = JSON.parse(fs.readFileSync(settingsFile, "utf-8"));
      return settings.apiKey || undefined;
    }
  } catch {}
  return undefined;
}

function getSettingsProvider(): string | undefined {
  try {
    const settingsFile = path.join(process.cwd(), "data", "settings.json");
    if (fs.existsSync(settingsFile)) {
      const settings = JSON.parse(fs.readFileSync(settingsFile, "utf-8"));
      return settings.provider || undefined;
    }
  } catch {}
  return undefined;
}

function getUserKey(userId: string): { apiKey?: string; provider?: string; browser?: string } {
  try {
    const userFile = path.join(process.cwd(), "data", "users", `${userId}.json`);
    if (fs.existsSync(userFile)) {
      const user = JSON.parse(fs.readFileSync(userFile, "utf-8"));
      return { apiKey: user.apiKey || undefined, provider: user.provider, browser: user.browser };
    }
  } catch {}
  return {};
}

export function getActiveProvider(config?: ApiKeyConfig): AIProvider {
  // Priority: config from request > user DB > settings.json > env vars
  const userDb = config?.userId ? getUserKey(config.userId) : {};
  const preferred = config?.provider || userDb.provider || getSettingsProvider() || process.env.AI_PROVIDER?.toLowerCase();

  const geminiKey = config?.apiKey || userDb.apiKey || getSettingsKey() || process.env.GEMINI_API_KEY;
  const openaiKey = config?.apiKey || userDb.apiKey || getSettingsKey() || process.env.OPENAI_API_KEY;

  if (config?.apiKey && config?.provider) {
    return config.provider as AIProvider;
  }

  if (preferred === "gemini" && geminiKey) return "gemini";
  if (preferred === "openai" && openaiKey) return "openai";

  if (geminiKey) return "gemini";
  if (openaiKey) return "openai";
  return "none";
}

export function hasTranscriptionProvider(config?: ApiKeyConfig): boolean {
  return getActiveProvider(config) !== "none";
}

function getKeyForProvider(provider: AIProvider, config?: ApiKeyConfig): string | undefined {
  // Config from request takes priority
  if (config?.apiKey) return config.apiKey;
  // Then user DB
  if (config?.userId) {
    const userDb = getUserKey(config.userId);
    if (userDb.apiKey) return userDb.apiKey;
  }
  // Then settings.json
  const settingsKey = getSettingsKey();
  if (settingsKey) return settingsKey;
  // Then env vars
  if (provider === "gemini") return process.env.GEMINI_API_KEY;
  if (provider === "openai") return process.env.OPENAI_API_KEY;
  return undefined;
}

function parseJsonFromAI(text: string): unknown {
  // Log raw response for debugging
  console.log("[parseJson] Raw AI response length:", text.length);
  console.log("[parseJson] First 500 chars:", text.slice(0, 500));

  // Clean up markdown code blocks
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch { /* continue */ }

  // Remove any text before first { or [
  const firstBrace = cleaned.search(/[\[{]/);
  if (firstBrace > 0) {
    cleaned = cleaned.slice(firstBrace);
  }

  // Remove any text after last } or ]
  const lastBrace = cleaned.lastIndexOf("}");
  const lastBracket = cleaned.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);
  if (end >= 0 && end < cleaned.length - 1) {
    cleaned = cleaned.slice(0, end + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch { /* continue */ }

  // Fix common JSON issues
  let fixed = cleaned
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/\n/g, " ")
    .replace(/\t/g, " ")
    .replace(/\r/g, "")
    .replace(/\\'/g, "'");

  try {
    return JSON.parse(fixed);
  } catch { /* continue */ }

  // Try extracting JSON array
  const arrayMatch = fixed.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try { return JSON.parse(arrayMatch[0]); } catch { /* continue */ }
  }

  // Try extracting JSON object
  const objectMatch = fixed.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try { return JSON.parse(objectMatch[0]); } catch { /* continue */ }
  }

  // Last resort: regex fallback
  const clipPattern = /"title"\s*:\s*"([^"]*)"[^}]*"start"\s*:\s*([\d.]+)[^}]*"end"\s*:\s*([\d.]+)/g;
  const fallbackClips: Omit<ClipSuggestion, "id">[] = [];
  let match;
  while ((match = clipPattern.exec(fixed)) !== null) {
    fallbackClips.push({
      title: match[1] || "Clip",
      description: "A viral moment from this video",
      hashtags: ["#viral", "#shorts", "#reels", "#fyp"],
      start: parseFloat(match[2]),
      end: parseFloat(match[3]),
      score: 80,
      reason: "AI-detected viral moment",
      transcript: "",
    });
  }

  if (fallbackClips.length > 0) {
    console.log(`[parseJson] Regex fallback found ${fallbackClips.length} clips`);
    return { clips: fallbackClips };
  }

  console.error("[parseJson] All parsing failed. Cleaned text:", fixed.slice(0, 1000));
  throw new Error("AI returned invalid JSON — check server logs for raw response");
}

export async function findClipsWithProvider(
  transcript: TranscriptSegment[],
  videoDuration: number,
  videoTitle: string,
  maxClipDuration: number,
  config?: ApiKeyConfig
): Promise<ClipSuggestion[]> {
  const provider = getActiveProvider(config);
  if (provider === "none") {
    throw new Error("No AI provider configured");
  }

  const condensed = transcript
    .map((s) => `[${s.start.toFixed(1)}s-${s.end.toFixed(1)}s] ${s.text}`)
    .join("\n");

  const prompt = `You are a viral short-form video expert. Analyze this transcript from "${videoTitle}" (${videoDuration}s total).

Find ALL moments worth turning into viral short clips (TikTok/YouTube Shorts/Reels). 
- Each clip should be ${Math.min(30, maxClipDuration)}-${maxClipDuration} seconds.
- Find AS MANY viral moments as exist — could be 3, 5, 8, 10, or more. Do NOT limit to any fixed number.
- Only include moments with HIGH viral potential. Skip boring/repetitive parts.
- Clips must NOT overlap in time.

Look for: hooks, surprising statements, emotional peaks, actionable tips, funny moments, strong opinions, story climaxes, hot takes, controversy, satisfying conclusions.

Transcript:
${condensed.slice(0, 15000)}

Respond ONLY with valid JSON in this exact format:
{"clips":[{"title":"catchy short title (max 50 chars)","description":"engaging description for social media caption (1-2 sentences)","hashtags":["#hashtag1","#hashtag2","#hashtag3","#hashtag4","#hashtag5"],"start":0.0,"end":45.0,"score":95,"reason":"why this is viral","transcript":"key quote from the clip"}]}

IMPORTANT: 
- title must be catchy and under 50 characters
- description must be 1-2 sentences suitable for a social media caption
- hashtags: generate 5-8 relevant hashtags for maximum reach (mix of broad + niche, include trending formats like #viral #fyp #shorts #reels)
- score should reflect true viral potential (1-100)
- Include ALL clips with score >= 70, skip anything below`;

  const raw =
    provider === "gemini"
      ? await callGemini(prompt, config)
      : await callOpenAI(prompt, config);

  let parsed: unknown;
  try {
    parsed = parseJsonFromAI(raw);
  } catch {
    // Retry with a simpler prompt if first parse fails
    console.log("[ai-clips] First parse failed, retrying with simpler prompt...");
    const retryPrompt = `Analyze this transcript from "${videoTitle}" (${videoDuration}s). Find ALL viral short clips. No fixed number — find every moment worth clipping.

Transcript:
${condensed.slice(0, 8000)}

Return ONLY this JSON format, nothing else:
{"clips":[{"title":"short title (max 50 chars)","description":"social media caption (1-2 sentences)","hashtags":["#hashtag1","#hashtag2","#hashtag3","#hashtag4","#hashtag5"],"start":0.0,"end":45.0,"score":95,"reason":"why viral","transcript":"quote"}]}`;

    const retryRaw =
      provider === "gemini"
        ? await callGemini(retryPrompt, config)
        : await callOpenAI(retryPrompt, config);
    try {
      parsed = parseJsonFromAI(retryRaw);
    } catch {
      throw new Error("AI could not analyze the transcript. Please try again — this usually works on retry.");
    }
  }

  const typed = parsed as
    | { clips?: Omit<ClipSuggestion, "id">[] }
    | Omit<ClipSuggestion, "id">[];

  const items = Array.isArray(typed) ? typed : typed.clips || [];

  return items.map((c, i) => ({
    ...c,
    id: `clip-${i + 1}`,
    description: c.description || "A viral moment from this video",
    start: Math.max(0, c.start),
    end: Math.min(videoDuration, c.end),
    score: Math.min(100, Math.max(0, c.score || 80)),
  }));
}

export async function transcribeWithProvider(
  audioPath: string,
  config?: ApiKeyConfig
): Promise<TranscriptSegment[]> {
  const provider = getActiveProvider(config);
  if (provider === "none") {
    throw new Error("No AI provider configured for transcription");
  }

  if (provider === "gemini") {
    return transcribeWithGemini(audioPath, config);
  }
  return transcribeWithOpenAI(audioPath, config);
}

async function callGemini(prompt: string, config?: ApiKeyConfig): Promise<string> {
  const apiKey = getKeyForProvider("gemini", config);
  if (!apiKey) throw new Error("Gemini API key not found");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  });

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("404") || msg.includes("not found") || msg.includes("not available")) {
      throw new Error("AI model is currently unavailable. Please try again later.");
    }
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
      throw new Error("Gemini API rate limit reached. Please wait a minute and try again.");
    }
    if (msg.includes("401") || msg.includes("API_KEY_INVALID") || msg.includes("invalid key")) {
      throw new Error("Your Gemini API key is invalid. Please check your key in Settings.");
    }
    if (msg.includes("SAFETY") || msg.includes("blocked")) {
      throw new Error("AI response was blocked by safety filters. Please try a different video.");
    }
    throw new Error(`Gemini error: ${msg.slice(0, 200)}`);
  }
}

async function callOpenAI(prompt: string, config?: ApiKeyConfig): Promise<string> {
  const apiKey = getKeyForProvider("openai", config);
  if (!apiKey) throw new Error("OpenAI API key not found");

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });
    return response.choices[0]?.message?.content || "{}";
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("429") || msg.includes("rate_limit")) {
      throw new Error("OpenAI API rate limit reached. Please wait and try again.");
    }
    if (msg.includes("401") || msg.includes("invalid")) {
      throw new Error("Your OpenAI API key is invalid. Please check your key in Settings.");
    }
    throw new Error(`OpenAI error: ${msg.slice(0, 200)}`);
  }
}

async function transcribeWithGemini(audioPath: string, config?: ApiKeyConfig): Promise<TranscriptSegment[]> {
  const apiKey = getKeyForProvider("gemini", config);
  if (!apiKey) throw new Error("Gemini API key not found");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const audioData = fs.readFileSync(audioPath);
  const ext = audioPath.toLowerCase().endsWith(".mp3") ? "mp3" : "wav";

  let text: string;
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: ext === "mp3" ? "audio/mp3" : "audio/wav",
          data: audioData.toString("base64"),
        },
      },
      {
        text: `Transcribe this audio. Return JSON only:
{"segments":[{"start":0.0,"end":5.2,"text":"spoken words"}]}
Use start/end in seconds. Split into natural speech segments.`,
      },
    ]);
    text = result.response.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Gemini API rate limit reached. Please wait a minute and try again.");
    }
    if (msg.includes("401") || msg.includes("API_KEY_INVALID")) {
      throw new Error("Your Gemini API key is invalid. Please check Settings.");
    }
    throw new Error(`AI transcription failed: ${msg.slice(0, 200)}`);
  }

  const parsed = parseJsonFromAI(text) as {
    segments?: { start: number; end: number; text: string }[];
  };

  const segments = parsed.segments || [];
  return segments.map((s) => ({
    start: s.start,
    end: s.end,
    text: s.text.trim(),
  }));
}

async function transcribeWithOpenAI(audioPath: string, config?: ApiKeyConfig): Promise<TranscriptSegment[]> {
  const apiKey = getKeyForProvider("openai", config);
  if (!apiKey) throw new Error("OpenAI API key not found");

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    const segments =
      (transcription as unknown as {
        segments?: { start: number; end: number; text: string }[];
      }).segments || [];

    return segments.map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    }));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("429") || msg.includes("rate_limit")) {
      throw new Error("OpenAI API rate limit reached. Please wait and try again.");
    }
    if (msg.includes("401") || msg.includes("invalid")) {
      throw new Error("Your OpenAI API key is invalid. Please check Settings.");
    }
    throw new Error(`Transcription failed: ${msg.slice(0, 200)}`);
  }
}
