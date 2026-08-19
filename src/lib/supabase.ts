import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) return null;

  try {
    _client = createClient(supabaseUrl, supabaseKey);
    return _client;
  } catch {
    return null;
  }
}

// Lazy singleton — won't crash at import time
export function getSupabase(): SupabaseClient | null {
  return getSupabaseClient();
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

// For backward compatibility: `import { supabase } from "./supabase"`
// This is a lazy getter that creates the client on first use
export const supabase = {
  get from() {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase not configured — set SUPABASE_URL and SUPABASE_ANON_KEY");
    return client.from.bind(client);
  },
  get auth() {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase not configured");
    return client.auth;
  },
} as unknown as SupabaseClient;
