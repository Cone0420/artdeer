import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const schemaPath = path.join(rootDir, "supabase", "migrations", "001_initial_schema.sql");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name} in .env.local`);
  return value;
}

function getProjectRef(supabaseUrl) {
  const hostname = new URL(supabaseUrl).hostname;
  return hostname.split(".")[0];
}

function getDatabaseUrl() {
  if (process.env.SUPABASE_DB_URL?.trim()) {
    return process.env.SUPABASE_DB_URL.trim();
  }

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!password) return null;

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const ref = getProjectRef(supabaseUrl);
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT to_regclass($1) AS regclass`,
    [`public.${tableName}`]
  );
  return Boolean(result.rows[0]?.regclass);
}

async function applySchema(databaseUrl) {
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const hasCollections = await tableExists(client, "data_collections");
    if (hasCollections) {
      console.log("[setup-supabase] Schema already exists, skipping SQL migration");
      return;
    }

    const sql = fs.readFileSync(schemaPath, "utf8");
    const statements = sql
      .split(";")
      .map((part) => part.trim())
      .filter((part) => part && !part.startsWith("--"));

    for (const statement of statements) {
      await client.query(statement);
    }

    console.log("[setup-supabase] Applied schema from 001_initial_schema.sql");
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
  const { error } = await supabase.from("data_collections").select("collection_key").limit(1);
  if (error) throw new Error(`Supabase connection check failed: ${error.message}`);
}

async function main() {
  loadEnvFile(path.join(rootDir, ".env.local"));
  loadEnvFile(path.join(rootDir, ".env"));

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "media";

  console.log("[setup-supabase] Project:", supabaseUrl);

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.error(
      "Missing database connection for schema setup.\n" +
        "Add one of these to .env.local:\n" +
        "  SUPABASE_DB_URL=postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres\n" +
        "  SUPABASE_DB_PASSWORD=<project database password from Supabase dashboard>"
    );
    process.exit(1);
  }

  await applySchema(databaseUrl);

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
