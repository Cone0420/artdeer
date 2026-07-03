import { isSupabaseConfigured } from "@/lib/supabase/env";

export function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

/**
 * Production (Vercel) must use Supabase — SQLite /tmp writes are ephemeral and unreliable.
 * Local dev may use SQLite when Supabase env vars are not set.
 */
export function useSupabaseDatabase(): boolean {
  if (isVercelRuntime()) {
    return isSupabaseConfigured();
  }
  return isSupabaseConfigured();
}

export function getDatabaseProvider(): "supabase" | "sqlite" {
  return useSupabaseDatabase() ? "supabase" : "sqlite";
}

export function assertWritableDatabase(operation: string): void {
  if (isVercelRuntime() && !isSupabaseConfigured()) {
    throw new Error(
      `${operation}: Vercel requires Supabase for writes. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables, run supabase/migrations/001_initial_schema.sql, create a public "media" storage bucket, then npm run migrate-to-supabase.`
    );
  }
}
