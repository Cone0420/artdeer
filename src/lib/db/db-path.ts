import fs from "fs";
import os from "os";
import path from "path";
import Database from "better-sqlite3";
import { APP_DB_DIR, APP_DB_FILE } from "./constants";
import { getProjectRoot, resolveProjectPath } from "./project-root";

export type DbPathDiagnostics = {
  projectRoot: string;
  cwd: string;
  bundledDbPath: string;
  runtimeDbPath: string;
  bundledDbExists: boolean;
  runtimeDbExists: boolean;
  isVercel: boolean;
  vercelEnv: string | null;
  artdearProjectRootEnv: string | null;
};

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

export function getBundledDbPath(): string {
  return resolveProjectPath(APP_DB_DIR, APP_DB_FILE);
}

function getVercelRuntimeDbPath(): string {
  return path.join(os.tmpdir(), APP_DB_FILE);
}

function syncBundledDbToRuntime(bundledPath: string, runtimePath: string): void {
  if (!fs.existsSync(bundledPath)) return;

  if (!fs.existsSync(runtimePath)) {
    fs.copyFileSync(bundledPath, runtimePath);
    return;
  }

  if (isVercelRuntime()) {
    try {
      const bundledDb = new Database(bundledPath, { readonly: true, fileMustExist: true });
      const runtimeDb = new Database(runtimePath, { readonly: true, fileMustExist: true });

      const bundledPortfolio = bundledDb
        .prepare(`SELECT data_json FROM data_collections WHERE collection_key = 'portfolio'`)
        .get() as { data_json: string } | undefined;
      const runtimePortfolio = runtimeDb
        .prepare(`SELECT data_json FROM data_collections WHERE collection_key = 'portfolio'`)
        .get() as { data_json: string } | undefined;

      bundledDb.close();
      runtimeDb.close();

      const bundledCount = bundledPortfolio ? JSON.parse(bundledPortfolio.data_json).length : 0;
      const runtimeCount = runtimePortfolio ? JSON.parse(runtimePortfolio.data_json).length : 0;

      if (runtimeCount === 0 && bundledCount > 0) {
        fs.copyFileSync(bundledPath, runtimePath);
      }
    } catch {
      fs.copyFileSync(bundledPath, runtimePath);
    }
    return;
  }

  const bundledStat = fs.statSync(bundledPath);
  const runtimeStat = fs.statSync(runtimePath);

  if (bundledStat.size !== runtimeStat.size || bundledStat.mtimeMs > runtimeStat.mtimeMs) {
    fs.copyFileSync(bundledPath, runtimePath);
  }
}

export function getRuntimeDbPath(): string {
  const bundledPath = getBundledDbPath();

  if (!isVercelRuntime()) {
    return bundledPath;
  }

  const runtimePath = getVercelRuntimeDbPath();
  syncBundledDbToRuntime(bundledPath, runtimePath);
  return runtimePath;
}

export function getDbPathDiagnostics(): DbPathDiagnostics {
  const bundledDbPath = getBundledDbPath();
  const runtimeDbPath = getRuntimeDbPath();

  return {
    projectRoot: getProjectRoot(),
    cwd: process.cwd(),
    bundledDbPath,
    runtimeDbPath,
    bundledDbExists: fs.existsSync(bundledDbPath),
    runtimeDbExists: fs.existsSync(runtimeDbPath),
    isVercel: isVercelRuntime(),
    vercelEnv: process.env.VERCEL_ENV ?? null,
    artdearProjectRootEnv: process.env.ARTDEAR_PROJECT_ROOT ?? null,
  };
}

export function getRuntimeUploadsDir(): string {
  if (!isVercelRuntime()) {
    return resolveProjectPath(APP_DB_DIR, "uploads");
  }

  return path.join(os.tmpdir(), "artdear-uploads");
}
