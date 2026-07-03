import pg from "pg";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function getProjectRef() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  return new URL(supabaseUrl).hostname.split(".")[0];
}

export function getDatabaseUrlCandidates() {
  if (process.env.SUPABASE_DB_URL?.trim()) {
    return [process.env.SUPABASE_DB_URL.trim()];
  }

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!password) return [];

  const ref = getProjectRef();
  const encoded = encodeURIComponent(password);

  return [
    `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  ];
}

export async function connectSupabasePg() {
  const candidates = getDatabaseUrlCandidates();
  if (candidates.length === 0) {
    throw new Error("Missing SUPABASE_DB_PASSWORD or SUPABASE_DB_URL");
  }

  let lastError = null;
  for (const connectionString of candidates) {
    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });

    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Could not connect to Supabase PostgreSQL");
}

export async function reloadPostgrestSchema(client) {
  await client.query(`NOTIFY pgrst, 'reload schema'`);
}
