import { isSupabaseConfigured } from "@/lib/supabase/env";

export function useSupabaseDatabase(): boolean {
  return isSupabaseConfigured();
}
