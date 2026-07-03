import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

export function loadProjectEnv() {
  for (const fileName of [".env", ".env.local", ".env.supabase"]) {
    loadEnvFile(path.join(rootDir, fileName));
  }
}

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

    if (value.includes(`${key}=`)) {
      value = value.slice(value.lastIndexOf(`${key}=`) + key.length + 1);
    }

    if (!(key in process.env) || filePath.endsWith(".env.supabase")) {
      process.env[key] = value;
    }
  }
}
