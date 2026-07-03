import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { loadProjectEnv } from "./load-env.mjs";
import { connectSupabasePg, reloadPostgrestSchema } from "./supabase-pg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const schemaPath = path.join(rootDir, "supabase", "migrations", "001_initial_schema.sql");

loadProjectEnv();

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name} in .env.supabase or .env.local`);
  return value;
}

function getProjectRef(supabaseUrl) {
  const hostname = new URL(supabaseUrl).hostname;
  return hostname.split(".")[0];
}

function getDatabaseUrlCandidates() {
  if (process.env.SUPABASE_DB_URL?.trim()) {
    return [process.env.SUPABASE_DB_URL.trim()];
  }

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!password) return [];

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const ref = getProjectRef(supabaseUrl);
  const encoded = encodeURIComponent(password);

  return [
    `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${encoded}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  ];
}

async function connectDatabase() {
  const candidates = getDatabaseUrlCandidates();
  if (candidates.length === 0) return null;

  let lastError = null;
  for (const connectionString of candidates) {
    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });

    try {
      await client.connect();
      console.log("[setup-supabase] Connected via PostgreSQL pool/direct");
      return client;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Could not connect to Supabase PostgreSQL");
}

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT to_regclass($1) AS regclass`,
    [`public.${tableName}`]
  );
  return Boolean(result.rows[0]?.regclass);
}

async function applySchema(client) {
  try {
    const sql = fs.readFileSync(schemaPath, "utf8");
    const statements = sql
      .split(";")
      .map((part) => part.trim())
      .filter((part) => part && !part.startsWith("--"));

    for (const statement of statements) {
      await client.query(statement);
    }

    console.log("[setup-supabase] Ensured schema from 001_initial_schema.sql");
    await reloadPostgrestSchema(client);
    console.log("[setup-supabase] Requested PostgREST schema reload");
  } finally {
    await client.end();
  }
}

async function ensureStorageBucket(supabase, bucket) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw new Error(`listBuckets failed: ${listError.message}`);

  if (buckets?.some((entry) => entry.name === bucket)) {
    console.log(`[setup-supabase] Storage bucket "${bucket}" already exists`);
    return;
  }

  const { error } = await supabase.storage.createBucket(bucket, { public: true });
  if (error) throw new Error(`createBucket failed: ${error.message}`);
  console.log(`[setup-supabase] Created public storage bucket "${bucket}"`);
}

async function verifyConnection(supabase) {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const { error } = await supabase.from("data_collections").select("collection_key").limit(1);
    if (!error) return;
    if (attempt === 6) {
      console.warn(`[setup-supabase] REST schema check pending: ${error.message}`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "media";

  console.log("[setup-supabase] Project:", supabaseUrl);

  const dbClient = await connectDatabase();
  if (!dbClient) {
    console.error(
      "Missing database connection for schema setup.\n" +
        "Add SUPABASE_DB_PASSWORD or SUPABASE_DB_URL to .env.supabase"
    );
    process.exit(1);
  }

  await applySchema(dbClient);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await verifyConnection(supabase);
  await ensureStorageBucket(supabase, bucket);

  console.log("[setup-supabase] Schema + storage ready.");
  console.log("[setup-supabase] Next: npm run migrate-to-supabase");
}

main().catch((error) => {
  console.error("[setup-supabase]", error.message ?? error);
  process.exit(1);
});
