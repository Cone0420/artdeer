export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;

  if (process.env.VERCEL === "1") {
    const hasSupabase = Boolean(
      (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL)?.trim() &&
        (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY)?.trim()
    );

    if (!hasSupabase) {
      console.error(
        "[artdeer] Vercel deployment is missing Supabase credentials. " +
          "SQLite writes are disabled in production. " +
          "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then redeploy."
      );
      return;
    }

    console.info("[artdeer] Database provider: supabase");
  }
}
