import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { discordReviews } from "./discord-reviews-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const dbPath = path.join(rootDir, "data", "artdear.db");

function parseReviewDate(date) {
  const [datePart] = date.trim().split(/\s+/);
  const [year, month, day] = datePart.split(".").map((part) => Number(part.trim()));
  if (!year || !month || !day) return 0;
  return new Date(year, month - 1, day).getTime();
}

function sortReviewsByNewest(items) {
  return [...items].sort((a, b) => {
    const dateDiff = parseReviewDate(b.date) - parseReviewDate(a.date);
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function dedupeKey(nickname, text) {
  return `${nickname.trim()}::${text.trim()}`;
}

function dateToCreatedAt(date, sequence) {
  const [year, month, day] = date.split(".").map(Number);
  const base = new Date(year, month - 1, day, 12, 0, 0);
  base.setSeconds(sequence);
  return base.toISOString();
}

function ensureDbSeeded(db) {
  const count = db.prepare(`SELECT COUNT(*) AS count FROM data_collections`).get().count;
  if (count > 0) return;

  const seedPath = path.join(rootDir, "src", "lib", "db", "seed-data.ts");
  console.warn("DB is empty. Run the app once to seed, or reviews will be imported standalone.");
}

function readReviews(db) {
  const row = db
    .prepare(`SELECT data_json FROM data_collections WHERE collection_key = ?`)
    .get("reviews");

  if (!row) return [];
  return JSON.parse(row.data_json);
}

function writeReviews(db, items) {
  db.prepare(
    `
    INSERT INTO data_collections (collection_key, data_json, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(collection_key) DO UPDATE SET
      data_json = excluded.data_json,
      updated_at = excluded.updated_at
  `
  ).run("reviews", JSON.stringify(items));
}

function main() {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS data_collections (
      collection_key TEXT PRIMARY KEY,
      data_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  ensureDbSeeded(db);

  const existing = readReviews(db);
  const existingKeys = new Set(existing.map((item) => dedupeKey(item.nickname ?? "", item.text ?? "")));

  let added = 0;
  let skipped = 0;
  const next = [...existing];
  const dateCounters = new Map();

  for (const review of discordReviews) {
    const key = dedupeKey(review.nickname, review.text);
    if (existingKeys.has(key)) {
      skipped += 1;
      continue;
    }

    const seq = (dateCounters.get(review.date) ?? 0) + 1;
    dateCounters.set(review.date, seq);

    const id = `discord-${review.date.replace(/\./g, "")}-${String(seq).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6)}`;

    next.push({
      id,
      nickname: review.nickname,
      text: review.text,
      date: review.date,
      createdAt: dateToCreatedAt(review.date, seq),
      rating: 5,
      visible: true,
    });

    existingKeys.add(key);
    added += 1;
  }

  const sorted = sortReviewsByNewest(next);
  writeReviews(db, sorted);
  db.close();

  console.log(`Discord reviews import complete.`);
  console.log(`  Added: ${added}`);
  console.log(`  Skipped (duplicate): ${skipped}`);
  console.log(`  Total in DB: ${sorted.length}`);
}

main();
