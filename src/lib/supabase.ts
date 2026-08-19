import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;

  // Strip surrounding quotes that Vercel CLI sometimes stores literally
  const strip = (s: string) => s.replace(/^["']|["']$/g, "").trim();

  const supabaseUrl = strip(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "");
  const supabaseKey = strip(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "");

  if (!supabaseUrl || !supabaseKey) return null;

  try {
    _client = createClient(supabaseUrl, supabaseKey);
    return _client;
  } catch {
    return null;
  }
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) return undefined;
    const value = (client as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") return value.bind(client);
    return value;
  },
});

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}
