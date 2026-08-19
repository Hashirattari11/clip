import { supabase } from "./supabase";
import { compare, hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  apiKey: string;
  provider: string;
  browser: string;
  credits: number;
  createdAt: string;
}

interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

// ─── User CRUD (Supabase) ───

export async function createUser(
  email: string,
  name: string,
  password: string
): Promise<Omit<User, "passwordHash">> {
  if (!supabase) throw new Error("Database not configured");

  // Check if email exists
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("Email already registered");

  const id = uuidv4();
  const passwordHash = await hash(password, 12);

  const { error } = await supabase.from("users").insert({
    id,
    email: email.toLowerCase().trim(),
    name: name.trim(),
    password_hash: passwordHash,
    api_key: "",
    provider: "gemini",
    browser: "chrome",
    credits: 100,
    created_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  return {
    id,
    email: email.toLowerCase().trim(),
    name: name.trim(),
    apiKey: "",
    provider: "gemini",
    browser: "chrome",
    credits: 100,
    createdAt: new Date().toISOString(),
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<Omit<User, "passwordHash">> {
  const user = await getUserByEmail(email);
  if (!user) throw new Error("Invalid email or password");

  const valid = await compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  const { passwordHash: _, ...safe } = user;
  return safe;
}

export async function getUserById(id: string): Promise<User | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    passwordHash: data.password_hash,
    apiKey: data.api_key || "",
    provider: data.provider || "gemini",
    browser: data.browser || "chrome",
    credits: data.credits ?? 100,
    createdAt: data.created_at,
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    passwordHash: data.password_hash,
    apiKey: data.api_key || "",
    provider: data.provider || "gemini",
    browser: data.browser || "chrome",
    credits: data.credits ?? 100,
    createdAt: data.created_at,
  };
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  if (!supabase) return null;

  const dbUpdates: Record<string, unknown> = {};
  if (updates.apiKey !== undefined) dbUpdates.api_key = updates.apiKey;
  if (updates.provider !== undefined) dbUpdates.provider = updates.provider;
  if (updates.browser !== undefined) dbUpdates.browser = updates.browser;
  if (updates.credits !== undefined) dbUpdates.credits = updates.credits;
  if (updates.name !== undefined) dbUpdates.name = updates.name;

  const { error } = await supabase
    .from("users")
    .update(dbUpdates)
    .eq("id", id);

  if (error) {
    console.log("[auth] updateUser failed:", error.message);
    return null;
  }

  return getUserById(id);
}

// ─── Sessions (Supabase) ───

export async function createSession(userId: string): Promise<string> {
  if (!supabase) throw new Error("Database not configured");

  const token = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Clean expired sessions first
  await supabase
    .from("sessions")
    .delete()
    .lt("expires_at", now.toISOString());

  const { error } = await supabase.from("sessions").insert({
    token,
    user_id: userId,
    created_at: now.toISOString(),
    expires_at: expiresAt,
  });

  if (error) throw new Error(error.message);
  return token;
}

export async function getSessionUser(token: string): Promise<Omit<User, "passwordHash"> | null> {
  if (!supabase) return null;

  // Find session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("token", token)
    .single();

  if (sessionError || !session) return null;

  // Check expiry
  if (new Date(session.expires_at) < new Date()) {
    await supabase.from("sessions").delete().eq("token", token);
    return null;
  }

  // Get user
  const user = await getUserById(session.user_id);
  if (!user) return null;

  const { passwordHash: _, ...safe } = user;
  return safe;
}

export async function deleteSession(token: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("sessions").delete().eq("token", token);
}

// ─── Cookie helpers (unchanged) ───

const COOKIE_NAME = "clipspark_session";

export function setSessionCookie(token: string): string {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

// ─── Credits (Supabase) ───

export async function getCredits(userId: string): Promise<number> {
  const user = await getUserById(userId);
  return user?.credits ?? 0;
}

export async function deductCredit(userId: string, amount: number = 1): Promise<{ success: boolean; remaining: number }> {
  if (!supabase) return { success: false, remaining: 0 };

  const user = await getUserById(userId);
  if (!user) return { success: false, remaining: 0 };
  if (user.credits < amount) return { success: false, remaining: user.credits };

  const newCredits = user.credits - amount;
  const { error } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", userId);

  if (error) return { success: false, remaining: user.credits };
  return { success: true, remaining: newCredits };
}

export async function addCredits(userId: string, amount: number): Promise<number> {
  if (!supabase) return 0;

  const user = await getUserById(userId);
  if (!user) return 0;

  const newCredits = user.credits + amount;
  const { error } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", userId);

  if (error) return user.credits;
  return newCredits;
}
