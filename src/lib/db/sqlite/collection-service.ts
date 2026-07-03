import { FAQ_SEED_VERSION } from "@/lib/faq-data";
import type { FaqItem } from "@/lib/faq-data";
import { getAppDb, syncAppDbWrites } from "../app-db";
import {
  ALL_COLLECTION_KEYS,
  defaultMeta,
  getDefaultCollectionData,
  type MetaCollection,
} from "../seed-data";
import type { CollectionKey } from "../constants";

function collectionExists(key: CollectionKey): boolean {
  const db = getAppDb();
  const row = db
    .prepare(`SELECT collection_key FROM data_collections WHERE collection_key = ?`)
    .get(key) as { collection_key: string } | undefined;
  return Boolean(row);
}

function ensureDbSeededSync(): void {
  const db = getAppDb();
  const count = db.prepare(`SELECT COUNT(*) AS count FROM data_collections`).get() as {
    count: number;
  };

  if (count.count === 0) {
    const insert = db.prepare(`
      INSERT INTO data_collections (collection_key, data_json, updated_at)
      VALUES (?, ?, datetime('now'))
    `);

    for (const key of ALL_COLLECTION_KEYS) {
      insert.run(key, JSON.stringify(getDefaultCollectionData(key)));
    }
  }
}

export function readCollectionSync<T>(key: CollectionKey): T {
  ensureDbSeededSync();
  const db = getAppDb();

  if (key === "faq") {
    const meta = readCollectionSync<MetaCollection>("meta");
    if (meta.faqSeedVersion !== FAQ_SEED_VERSION) {
      const seeded = getDefaultCollectionData("faq") as FaqItem[];
      writeCollectionSync("faq", seeded);
      writeCollectionSync("meta", { ...meta, faqSeedVersion: FAQ_SEED_VERSION });
      return seeded as T;
    }
  }

  const row = db
    .prepare(`SELECT data_json FROM data_collections WHERE collection_key = ?`)
    .get(key) as { data_json: string } | undefined;

  if (!row) {
    const fallback = getDefaultCollectionData(key);
    writeCollectionSync(key, fallback);
    return fallback as T;
  }

  return JSON.parse(row.data_json) as T;
}

export function writeCollectionSync<T>(key: CollectionKey, data: T): void {
  ensureDbSeededSync();
  const db = getAppDb();

  db.prepare(
    `
    INSERT INTO data_collections (collection_key, data_json, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(collection_key) DO UPDATE SET
      data_json = excluded.data_json,
      updated_at = excluded.updated_at
  `
  ).run(key, JSON.stringify(data));
  syncAppDbWrites();

  if (key === "faq") {
    const meta = readCollectionSync<MetaCollection>("meta");
    writeCollectionSync("meta", { ...defaultMeta, ...meta, faqSeedVersion: FAQ_SEED_VERSION });
  }
}

export function hasCollectionSync(key: CollectionKey): boolean {
  ensureDbSeededSync();
  return collectionExists(key);
}

export async function readCollectionSqlite<T>(key: CollectionKey): Promise<T> {
  return readCollectionSync<T>(key);
}

export async function writeCollectionSqlite<T>(key: CollectionKey, data: T): Promise<void> {
  writeCollectionSync(key, data);
}

export async function ensureDbSeededSqlite(): Promise<void> {
  ensureDbSeededSync();
}

export async function hasCollectionSqlite(key: CollectionKey): Promise<boolean> {
  return hasCollectionSync(key);
}
