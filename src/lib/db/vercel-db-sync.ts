import fs from "fs";
import os from "os";
import path from "path";
import Database from "better-sqlite3";
import { closeAppDbConnection } from "./app-db";
import { getBundledDbPath, getVercelRuntimeDbPath, isVercelRuntime } from "./db-path";

type PortfolioRow = { id: string };

function resolveReadableDbPath(sourcePath: string): string {
  if (!fs.existsSync(sourcePath)) return sourcePath;
  if (!isVercelRuntime()) return sourcePath;

  const tmpPath = path.join(os.tmpdir(), `artdear-read-${path.basename(sourcePath)}`);
  fs.copyFileSync(sourcePath, tmpPath);
  return tmpPath;
}

function openReadonlyDatabase(dbPath: string): Database.Database {
  const readablePath = resolveReadableDbPath(dbPath);
  const db = new Database(readablePath, { readonly: true, fileMustExist: true });
  db.pragma("journal_mode = DELETE");
  return db;
}

function readPortfolioItems(dbPath: string): PortfolioRow[] {
  if (!fs.existsSync(dbPath)) return [];

  const db = openReadonlyDatabase(dbPath);
  try {
    const row = db
      .prepare(`SELECT data_json FROM data_collections WHERE collection_key = 'portfolio'`)
      .get() as { data_json: string } | undefined;

    if (!row) return [];
    const items = JSON.parse(row.data_json) as PortfolioRow[];
    return Array.isArray(items) ? items : [];
  } finally {
    db.close();
  }
}

function writePortfolioItems(dbPath: string, items: PortfolioRow[]): void {
  const db = new Database(dbPath);
  try {
    db.pragma("journal_mode = DELETE");
    db.exec(`
      CREATE TABLE IF NOT EXISTS data_collections (
        collection_key TEXT PRIMARY KEY,
        data_json TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    db.prepare(
      `
      INSERT INTO data_collections (collection_key, data_json, updated_at)
      VALUES ('portfolio', ?, datetime('now'))
      ON CONFLICT(collection_key) DO UPDATE SET
        data_json = excluded.data_json,
        updated_at = excluded.updated_at
    `
    ).run(JSON.stringify(items));
  } finally {
    db.close();
  }
}

function copyBundledDbToRuntime(bundledPath: string, runtimePath: string): void {
  closeAppDbConnection();
  const readableBundled = resolveReadableDbPath(bundledPath);
  fs.copyFileSync(readableBundled, runtimePath);
}

function mergePortfolioItems<T extends PortfolioRow>(runtimeItems: T[], bundledItems: T[]): T[] {
  const seen = new Set(runtimeItems.map((item) => item.id));
  const merged = [...runtimeItems];

  for (const item of bundledItems) {
    if (!seen.has(item.id)) {
      merged.push(item);
      seen.add(item.id);
    }
  }

  return merged;
}

export function getPortfolioIdsFromDbPath(dbPath: string): string[] {
  return readPortfolioItems(dbPath).map((item) => item.id);
}

export function mergeBundledPortfolioIntoRuntime(): {
  merged: boolean;
  runtimeIds: string[];
  bundledIds: string[];
} {
  if (!isVercelRuntime()) {
    return { merged: false, runtimeIds: [], bundledIds: [] };
  }

  const bundledPath = getBundledDbPath();
  const runtimePath = getVercelRuntimeDbPath();

  if (!fs.existsSync(bundledPath)) {
    return {
      merged: false,
      runtimeIds: getPortfolioIdsFromDbPath(runtimePath),
      bundledIds: [],
    };
  }

  if (!fs.existsSync(runtimePath)) {
    copyBundledDbToRuntime(bundledPath, runtimePath);
    const ids = getPortfolioIdsFromDbPath(runtimePath);
    return { merged: true, runtimeIds: ids, bundledIds: ids };
  }

  const bundledItems = readPortfolioItems(bundledPath);
  const runtimeItems = readPortfolioItems(runtimePath);
  const bundledIds = bundledItems.map((item) => item.id);
  const runtimeIds = runtimeItems.map((item) => item.id);

  const bundledIdSet = new Set(bundledIds);
  const missingInRuntime = bundledIds.some((id) => !runtimeIds.includes(id));
  const hasStaleRuntimeOnly =
    runtimeIds.length > 0 && bundledIds.length > 0 && !runtimeIds.some((id) => bundledIdSet.has(id));

  if (!missingInRuntime && !hasStaleRuntimeOnly) {
    return { merged: false, runtimeIds, bundledIds };
  }

  closeAppDbConnection();

  if (runtimeItems.length === 0 && bundledItems.length > 0) {
    copyBundledDbToRuntime(bundledPath, runtimePath);
    return { merged: true, runtimeIds: bundledIds, bundledIds };
  }

  const mergedItems = mergePortfolioItems(runtimeItems, bundledItems);
  writePortfolioItems(runtimePath, mergedItems);

  return {
    merged: true,
    runtimeIds: mergedItems.map((item) => item.id),
    bundledIds,
  };
}

export function ensurePortfolioIdInRuntimeDb(targetId: string): {
  found: boolean;
  runtimeIds: string[];
  bundledIds: string[];
} {
  const sync = mergeBundledPortfolioIntoRuntime();
  const runtimeIds = sync.runtimeIds.length
    ? sync.runtimeIds
    : getPortfolioIdsFromDbPath(getVercelRuntimeDbPath());
  const bundledIds = sync.bundledIds.length
    ? sync.bundledIds
    : getPortfolioIdsFromDbPath(getBundledDbPath());

  return {
    found: runtimeIds.includes(targetId),
    runtimeIds,
    bundledIds,
  };
}

export function getPortfolioDeleteDiagnostics(targetId: string): {
  requestedId: string;
  runtimeDbPath: string;
  bundledDbPath: string;
  runtimeIds: string[];
  bundledIds: string[];
  foundAfterMerge: boolean;
} {
  const resolution = ensurePortfolioIdInRuntimeDb(targetId);

  return {
    requestedId: targetId,
    runtimeDbPath: getVercelRuntimeDbPath(),
    bundledDbPath: getBundledDbPath(),
    runtimeIds: resolution.runtimeIds,
    bundledIds: resolution.bundledIds,
    foundAfterMerge: resolution.found,
  };
}
