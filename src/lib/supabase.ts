import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _initAttempted = false;

/**
 * Get the Supabase client. Returns null if env vars are missing.
 * Safe to call at build time — won't crash.
 */
export function getSupabase(): SupabaseClient | null {
  if (_initAttempted) return _client;
  _initAttempted = true;

  // Strip surrounding quotes (Vercel CLI sometimes stores them literally)
  const strip = (s: string) => s.replace(/^["']|["']$/g, "").trim();

  const url = strip(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "");
  const key = strip(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "");

  if (!url || !key) return null;

  try {
    _client = createClient(url, key);
  } catch (e) {
    console.warn("[supabase] Failed to create client:", e);
  }
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}
