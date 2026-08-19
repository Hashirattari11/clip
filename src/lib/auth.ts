import fs from "fs";
import path from "path";
import { compare, hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const USERS_DIR = path.join(process.cwd(), "data", "users");
const SESSIONS_FILE = path.join(process.cwd(), "data", "sessions.json");

function ensureDirs() {
  if (!fs.existsSync(USERS_DIR)) fs.mkdirSync(USERS_DIR, { recursive: true });
  if (!fs.existsSync(path.join(process.cwd(), "data")))
    fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
}

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

// ─── User CRUD ───

export async function createUser(
  email: string,
  name: string,
  password: string
): Promise<Omit<User, "passwordHash">> {
  ensureDirs();

  // Check if email exists
  const existing = getUserByEmail(email);
  if (existing) throw new Error("Email already registered");

  const id = uuidv4();
  const passwordHash = await hash(password, 12);

  const user: User = {
    id,
    email: email.toLowerCase().trim(),
    name: name.trim(),
    passwordHash,
    apiKey: "",
    provider: "gemini",
    browser: "chrome",
    credits: 100,
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(USERS_DIR, `${id}.json`),
    JSON.stringify(user, null, 2)
  );

  const { passwordHash: _, ...safe } = user;
  return safe;
}

export async function loginUser(
  email: string,
  password: string
): Promise<Omit<User, "passwordHash">> {
  const user = getUserByEmail(email);
  if (!user) throw new Error("Invalid email or password");

  const valid = await compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  const { passwordHash: _, ...safe } = user;
  return safe;
}

export function getUserById(id: string): User | null {
  ensureDirs();
  const file = path.join(USERS_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as User;
}

export function getUserByEmail(email: string): User | null {
  ensureDirs();
  const files = fs.readdirSync(USERS_DIR).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    const user = JSON.parse(
      fs.readFileSync(path.join(USERS_DIR, f), "utf-8")
    ) as User;
    if (user.email === email.toLowerCase().trim()) return user;
  }
  return null;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const user = getUserById(id);
  if (!user) return null;
  const updated = { ...user, ...updates };
  fs.writeFileSync(
    path.join(USERS_DIR, `${id}.json`),
    JSON.stringify(updated, null, 2)
  );
  return updated;
}

// ─── Sessions ───

function getSessions(): Session[] {
  ensureDirs();
  if (!fs.existsSync(SESSIONS_FILE)) return [];
  return JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf-8")) as Session[];
}

function saveSessions(sessions: Session[]) {
  ensureDirs();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

export function createSession(userId: string): string {
  const token = uuidv4();
  const sessions = getSessions();

  // Clean expired sessions
  const now = new Date();
  const cleaned = sessions.filter((s) => new Date(s.expiresAt) > now);

  cleaned.push({
    token,
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  });

  saveSessions(cleaned);
  return token;
}

export function getSessionUser(token: string): Omit<User, "passwordHash"> | null {
  const sessions = getSessions();
  const session = sessions.find((s) => s.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    // expired
    saveSessions(sessions.filter((s) => s.token !== token));
    return null;
  }
  const user = getUserById(session.userId);
  if (!user) return null;
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export function deleteSession(token: string) {
  const sessions = getSessions();
  saveSessions(sessions.filter((s) => s.token !== token));
}

// ─── Cookie helpers ───

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

// ─── Credits ───

export function getCredits(userId: string): number {
  const user = getUserById(userId);
  return user?.credits ?? 0;
}

export function deductCredit(userId: string, amount: number = 1): { success: boolean; remaining: number } {
  const user = getUserById(userId);
  if (!user) return { success: false, remaining: 0 };
  if (user.credits < amount) return { success: false, remaining: user.credits };
  const updated = { ...user, credits: user.credits - amount };
  fs.writeFileSync(
    path.join(USERS_DIR, `${userId}.json`),
    JSON.stringify(updated, null, 2)
  );
  return { success: true, remaining: updated.credits };
}

export function addCredits(userId: string, amount: number): number {
  const user = getUserById(userId);
  if (!user) return 0;
  const updated = { ...user, credits: user.credits + amount };
  fs.writeFileSync(
    path.join(USERS_DIR, `${userId}.json`),
    JSON.stringify(updated, null, 2)
  );
  return updated.credits;
}
