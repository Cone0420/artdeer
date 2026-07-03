import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { loadProjectEnv } from "./load-env.mjs";
import { connectSupabasePg, reloadPostgrestSchema } from "./supabase-pg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const dbPath = path.join(rootDir, "data", "artdear.db");
const uploadsDir = path.join(rootDir, "data", "uploads");

loadProjectEnv();

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function chunk(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "media";

if (!fs.existsSync(dbPath)) {
  console.error(`SQLite database not found: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath, { readonly: true });
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function pgColumnValue(column, value) {
  if (column === "data_json" || column === "metadata") {
    return JSON.stringify(value);
  }
  return value;
}

async function upsertRowsPg(client, table, rows, conflictColumn) {
  if (rows.length === 0) return;

  for (const row of rows) {
    const columns = Object.keys(row);
    const values = columns.map((_, index) => `$${index + 1}`);
    const updates = columns
      .filter((column) => column !== conflictColumn)
      .map((column) => `${column} = EXCLUDED.${column}`)
      .join(", ");

    const sql = `
      INSERT INTO ${table} (${columns.join(", ")})
      VALUES (${values.join(", ")})
      ON CONFLICT (${conflictColumn}) DO UPDATE SET ${updates}
    `;

    await client.query(sql, columns.map((column) => pgColumnValue(column, row[column])));
  }
}

async function upsertRows(table, rows, onConflict) {
  if (rows.length === 0) return;

  try {
    const pgClient = await connectSupabasePg();
    try {
      await upsertRowsPg(pgClient, table, rows, onConflict);
      await reloadPostgrestSchema(pgClient);
      return;
    } finally {
      await pgClient.end();
    }
  } catch (error) {
    console.warn(`[migrate] PostgreSQL upsert failed for ${table}, trying REST:`, error.message);
  }

  for (const batch of chunk(rows, 100)) {
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) throw new Error(`${table} upsert failed: ${error.message}`);
  }
}

async function migrateAdminUsers() {
  const rows = db
    .prepare(
      `SELECT id, username, password_hash, display_name, role, is_active, created_at, last_login_at
       FROM admin_users`
    )
    .all();

  const payload = rows.map((row) => ({
    id: row.id,
    username: row.username,
    password_hash: row.password_hash,
    display_name: row.display_name,
    role: row.role,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    last_login_at: row.last_login_at,
  }));

  await upsertRows("admin_users", payload, "username");
  console.log(`Migrated admin_users: ${payload.length}`);
}

async function migrateCollections() {
  const rows = db
    .prepare(`SELECT collection_key, data_json, updated_at FROM data_collections`)
    .all();

  const payload = rows.map((row) => ({
    collection_key: row.collection_key,
    data_json: JSON.parse(row.data_json),
    updated_at: row.updated_at,
  }));

  await upsertRows("data_collections", payload, "collection_key");
  console.log(`Migrated data_collections: ${payload.length}`);
}

async function migrateMediaFiles() {
  const rows = db
    .prepare(`SELECT id, filename, mime_type, size_bytes, created_at FROM media_files`)
    .all();

  let uploaded = 0;
  let skipped = 0;

  for (const row of rows) {
    const storagePath = row.filename;
    const localPath = path.join(uploadsDir, row.filename);

    if (!fs.existsSync(localPath)) {
      console.warn(`Missing upload file, skipping media ${row.id}: ${localPath}`);
      skipped += 1;
      continue;
    }

    const buffer = fs.readFileSync(localPath);
    const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
      contentType: row.mime_type,
      upsert: true,
    });

    if (uploadError) {
      throw new Error(`Storage upload failed for ${row.id}: ${uploadError.message}`);
    }

    const { error: insertError } = await supabase.from("media_files").upsert(
      {
        id: row.id,
        storage_path: storagePath,
        mime_type: row.mime_type,
        size_bytes: row.size_bytes,
        created_at: row.created_at,
      },
      { onConflict: "id" }
    );

    if (insertError) {
      const pgClient = await connectSupabasePg();
      try {
        await pgClient.query(
          `
          INSERT INTO media_files (id, storage_path, mime_type, size_bytes, created_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            storage_path = EXCLUDED.storage_path,
            mime_type = EXCLUDED.mime_type,
            size_bytes = EXCLUDED.size_bytes,
            created_at = EXCLUDED.created_at
        `,
          [row.id, storagePath, row.mime_type, row.size_bytes, row.created_at]
        );
      } finally {
        await pgClient.end();
      }
    }

    uploaded += 1;
  }

  console.log(`Migrated media_files: ${uploaded} uploaded, ${skipped} skipped`);
}

async function migrateVisitors() {
  const rows = db
    .prepare(
      `SELECT ip_hash, session_id, user_agent, visited_at, entered_at, left_at, duration_seconds
       FROM visitors`
    )
    .all();

  const payload = rows.map((row) => ({
    ip_hash: row.ip_hash,
    session_id: row.session_id,
    user_agent: row.user_agent,
    visited_at: row.visited_at,
    entered_at: row.entered_at,
    left_at: row.left_at,
    duration_seconds: row.duration_seconds,
  }));

  for (const batch of chunk(payload, 200)) {
    const { error } = await supabase.from("visitors").insert(batch);
    if (error) throw new Error(`visitors insert failed: ${error.message}`);
  }

  console.log(`Migrated visitors: ${payload.length}`);
}

async function migrateAnalyticsEvents() {
  const rows = db
    .prepare(
      `SELECT event_type, path, session_id, ip_hash, user_agent, metadata, created_at
       FROM analytics_events`
    )
    .all();

  const payload = rows.map((row) => ({
    event_type: row.event_type,
    path: row.path,
    session_id: row.session_id,
    ip_hash: row.ip_hash,
    user_agent: row.user_agent,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    created_at: row.created_at,
  }));

  for (const batch of chunk(payload, 200)) {
    const { error } = await supabase.from("analytics_events").insert(batch);
    if (error) throw new Error(`analytics_events insert failed: ${error.message}`);
  }

  console.log(`Migrated analytics_events: ${payload.length}`);
}

async function ensureStorageBucket(supabase, bucket) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.warn(`Could not list storage buckets: ${listError.message}`);
    return;
  }

  if (buckets?.some((entry) => entry.name === bucket)) {
    console.log(`Storage bucket "${bucket}" already exists`);
    return;
  }

  const { error } = await supabase.storage.createBucket(bucket, { public: true });
  if (error) {
    console.warn(
      `Could not create storage bucket "${bucket}" automatically: ${error.message}. Create it manually in Supabase Dashboard.`
    );
    return;
  }

  console.log(`Created storage bucket "${bucket}"`);
}

async function main() {
  console.log("Starting SQLite → Supabase migration");
  console.log(`SQLite: ${dbPath}`);
  console.log(`Supabase: ${supabaseUrl}`);
  console.log(`Storage bucket: ${bucket}`);

  await ensureStorageBucket(supabase, bucket);

  await migrateAdminUsers();
  await migrateCollections();
  await migrateMediaFiles();

  const includeAnalytics = process.argv.includes("--with-analytics");
  if (includeAnalytics) {
    await migrateVisitors();
    await migrateAnalyticsEvents();
  } else {
    console.log("Skipped visitors/analytics (pass --with-analytics to include them)");
  }

  console.log("Migration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
