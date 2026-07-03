import fs from "fs";
import os from "os";
import path from "path";
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

  // On warm Vercel instances keep the writable /tmp database so admin writes persist.
  if (isVercelRuntime()) return;

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
