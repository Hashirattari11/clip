import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;
let _initialized = false;

function getClient(): SupabaseClient | null {
  // Only initialize once (avoid build-time issues)
  if (_initialized) return _client;
  _initialized = true;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (supabaseUrl && supabaseKey) {
    try {
      new URL(supabaseUrl); // Validate URL format
      _client = createClient(supabaseUrl, supabaseKey);
    } catch {
      console.warn("[supabase] Invalid SUPABASE_URL:", supabaseUrl);
    }
  }

  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    if (!client) return undefined;
    const value = (client as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export function isSupabaseConfigured(): boolean {
  return getClient() !== null;
}
