import { ClipSuggestion, TranscriptSegment } from "./types";
import { findClipsWithProvider, getActiveProvider, ApiKeyConfig } from "./ai-provider";

const MAX_CLIP = parseInt(process.env.MAX_CLIP_DURATION || "60", 10);

export async function findBestClips(
  transcript: TranscriptSegment[],
  videoDuration: number,
  videoTitle: string,
  config?: ApiKeyConfig
): Promise<ClipSuggestion[]> {
  if (getActiveProvider(config) !== "none") {
    try {
      return await findClipsWithProvider(
        transcript,
        videoDuration,
        videoTitle,
        MAX_CLIP,
        config
      );
    } catch (err) {
      console.log("[ai-clips] AI failed, falling back to heuristics:", err);
    }
  }
  return findClipsHeuristic(transcript, videoDuration);
}

function findClipsHeuristic(
  transcript: TranscriptSegment[],
  videoDuration: number
): ClipSuggestion[] {
  if (transcript.length === 0) {
    return generateEvenClips(videoDuration);
  }

  const windowSize = Math.min(MAX_CLIP, 45);
  const scored: ClipSuggestion[] = [];

  for (let i = 0; i < transcript.length; i++) {
    const start = transcript[i].start;
    let end = start + windowSize;
    let text = "";
    let j = i;

    while (j < transcript.length && transcript[j].end <= end) {
      text += transcript[j].text + " ";
      j++;
    }

    if (j > i) {
      end = Math.min(transcript[j - 1].end + 1, videoDuration);
    }

    const duration = end - start;
    if (duration < 15 || duration > MAX_CLIP + 5) continue;

    const score = scoreSegment(text, i === 0);
    scored.push({
      id: `clip-${scored.length + 1}`,
      title: generateTitle(text),
      description: generateDescription(text),
      hashtags: generateHashtags(text),
      start,
      end,
      score,
      reason: getReason(text, score),
      transcript: text.trim().slice(0, 200),
    });
  }

  scored.sort((a, b) => b.score - a.score);

  const selected: ClipSuggestion[] = [];
  for (const clip of scored) {
    const overlaps = selected.some(
      (s) => !(clip.end <= s.start || clip.start >= s.end)
    );
    if (!overlaps) {
      selected.push(clip);
    }
  }

  if (selected.length === 0) {
    return generateEvenClips(videoDuration);
  }

  return selected;
}

function scoreSegment(text: string, isFirst: boolean): number {
  let score = 50;
  if (isFirst) score += 15;
  if (text.includes("?")) score += 10;
  if (text.includes("!")) score += 8;
  if (/\b(secret|never|always|best|worst|important|mistake|truth|hack|tip)\b/i.test(text))
    score += 12;
  if (/\b(you|your)\b/i.test(text)) score += 5;
  if (text.length > 100) score += 5;
  if (text.length > 200) score += 5;
  if (/\b(\d+%|\$\d+|million|billion)\b/i.test(text)) score += 8;
  if (/\b(how to|why|what if|imagine|story)\b/i.test(text)) score += 7;
  return Math.min(98, score);
}

function generateTitle(text: string): string {
  const words = text.trim().split(/\s+/).slice(0, 8).join(" ");
  return words.length > 40 ? words.slice(0, 40) + "..." : words || "Highlight Clip";
}

function generateDescription(text: string): string {
  const words = text.trim().split(/\s+/).slice(0, 20).join(" ");
  return words.length > 120 ? words.slice(0, 120) + "..." : words || "A viral moment from this video";
}

function generateHashtags(text: string): string[] {
  const base = ["#viral", "#shorts", "#reels", "#fyp"];
  const textLower = text.toLowerCase();
  const extra: string[] = [];

  if (/\b(business|money|startup|entrepreneur|invest|profit|revenue|cr|crore|lakh)\b/i.test(textLower)) {
    extra.push("#business", "#money", "#entrepreneur", "#startup");
  }
  if (/\b(motiv|inspir|success|mindset|goal|hustle|grind|dream)\b/i.test(textLower)) {
    extra.push("#motivation", "#mindset", "#success");
  }
  if (/\b(tech|ai|coding|programming|software|app|digital)\b/i.test(textLower)) {
    extra.push("#tech", "#ai", "#technology");
  }
  if (/\b(health|fitness|diet|workout|gym|weight|exercise)\b/i.test(textLower)) {
    extra.push("#health", "#fitness", "#wellness");
  }
  if (/\b(funny|meme|laugh|joke|hilarious|comedy|roast)\b/i.test(textLower)) {
    extra.push("#funny", "#comedy", "#memes");
  }
  if (/\b(story|journey|life|struggle|failed|success|came back)\b/i.test(textLower)) {
    extra.push("#story", "#life", "#journey");
  }
  if (/\b(trick|hack|tip|secret|hidden|nobody tells|you don.t know)\b/i.test(textLower)) {
    extra.push("#tips", "#hacks", "#secrets");
  }

  // Always add #india for Hindi content
  if (/\b(india|hindi|rupee|crore|lakh|shark tank)\b/i.test(textLower)) {
    extra.push("#india");
  }

  return Array.from(new Set([...extra.slice(0, 4), ...base])).slice(0, 8);
}

function getReason(text: string, score: number): string {
  if (score >= 85) return "High engagement potential — strong hook detected";
  if (text.includes("?")) return "Question hook — drives curiosity";
  if (text.includes("!")) return "Emotional peak — high energy moment";
  return "Strong content segment with good pacing";
}

function generateEvenClips(videoDuration: number): ClipSuggestion[] {
  const clipLen = Math.min(45, MAX_CLIP);
  const count = Math.min(8, Math.max(3, Math.floor(videoDuration / (clipLen + 10))));
  const clips: ClipSuggestion[] = [];

  for (let i = 0; i < count; i++) {
    const start = i * (videoDuration / count);
    const end = Math.min(start + clipLen, videoDuration);
    clips.push({
      id: `clip-${i + 1}`,
      title: `Clip ${i + 1}`,
      description: `Segment from the video`,
      hashtags: ["#viral", "#shorts", "#reels", "#fyp"],
      start,
      end,
      score: 70,
      reason: "Evenly distributed segment",
      transcript: "",
    });
  }

  return clips;
}
