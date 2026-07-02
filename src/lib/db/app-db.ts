import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { compareSync, hashSync } from "bcryptjs";
import Database from "better-sqlite3";
import { APP_DB_DIR, APP_DB_FILE } from "./constants";
import { getRuntimeDbPath, getRuntimeUploadsDir } from "./db-path";

export { getDbPathDiagnostics } from "./db-path";
export type { DbPathDiagnostics } from "./db-path";

const globalForDb = globalThis as typeof globalThis & {
  __artdearAppDb?: Database.Database;
  __artdearAppDbPath?: string;
};

function migrateVisitorsTable(db: Database.Database) {
  const columns = db.prepare("PRAGMA table_info(visitors)").all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));

  if (!names.has("entered_at")) {
    db.exec(`ALTER TABLE visitors ADD COLUMN entered_at TEXT`);
    db.exec(`UPDATE visitors SET entered_at = visited_at WHERE entered_at IS NULL`);
  }
  if (!names.has("left_at")) {
    db.exec(`ALTER TABLE visitors ADD COLUMN left_at TEXT`);
  }
  if (!names.has("duration_seconds")) {
    db.exec(`ALTER TABLE visitors ADD COLUMN duration_seconds INTEGER`);
  }
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('super_admin', 'admin')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username
      ON admin_users(username);

    CREATE TABLE IF NOT EXISTS data_collections (
      collection_key TEXT PRIMARY KEY,
      data_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media_files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_hash TEXT NOT NULL,
      session_id TEXT NOT NULL,
      user_agent TEXT,
      visited_at TEXT NOT NULL DEFAULT (datetime('now')),
      entered_at TEXT,
      left_at TEXT,
      duration_seconds INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_visitors_session_visited
      ON visitors(session_id, visited_at DESC);

    CREATE INDEX IF NOT EXISTS idx_visitors_visited_at
      ON visitors(visited_at DESC);

    CREATE INDEX IF NOT EXISTS idx_visitors_entered_at
      ON visitors(entered_at DESC);

    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      path TEXT,
      session_id TEXT NOT NULL,
      ip_hash TEXT,
      user_agent TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
      ON analytics_events(event_type, created_at DESC);
  `);

  migrateVisitorsTable(db);
}

function seedDefaultAdminUser(db: Database.Database) {
  const row = db.prepare("SELECT COUNT(*) AS count FROM admin_users").get() as { count: number };
  if (row.count > 0) return;

  db.prepare(
    `INSERT INTO admin_users (id, username, password_hash, display_name, role, is_active)
     VALUES (?, ?, ?, ?, ?, 1)`
  ).run(
    randomUUID(),
    "admin",
    hashSync("artdeer2024", 12),
    "최고 관리자",
    "super_admin"
  );
}

export function getAppDbPath(): string {
  if (globalForDb.__artdearAppDbPath) {
    return globalForDb.__artdearAppDbPath;
  }

  const dbPath = getRuntimeDbPath();
  globalForDb.__artdearAppDbPath = dbPath;
  return dbPath;
}

export function closeAppDbConnection(): void {
  if (!globalForDb.__artdearAppDb) return;
  try {
    globalForDb.__artdearAppDb.pragma("wal_checkpoint(PASSIVE)");
    globalForDb.__artdearAppDb.close();
  } catch {
    // Ignore close errors during hot reload.
  }
  globalForDb.__artdearAppDb = undefined;
}

export function syncAppDbWrites(): void {
  if (!globalForDb.__artdearAppDb) return;
  globalForDb.__artdearAppDb.pragma("wal_checkpoint(PASSIVE)");
}

export function getUploadsDir(): string {
  const uploadsDir = getRuntimeUploadsDir();
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

export function getAppDb(): Database.Database {
  const dbPath = getAppDbPath();

  if (globalForDb.__artdearAppDb) {
    return globalForDb.__artdearAppDb;
  }

  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  getUploadsDir();

  const db = new Database(dbPath);
  db.pragma(process.env.VERCEL === "1" ? "journal_mode = DELETE" : "journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initializeSchema(db);
  seedDefaultAdminUser(db);

  globalForDb.__artdearAppDb = db;
  return db;
}
