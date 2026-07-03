import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadProjectEnv } from "./load-env.mjs";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const keys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DB_PASSWORD",
];

loadProjectEnv();

const file = process.argv[2] ?? path.join(rootDir, ".env.supabase");
if (!fs.existsSync(file)) {
  console.log("missing file:", file);
  process.exit(1);
}

const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
for (const key of keys) {
  const line = lines.find((entry) => entry.startsWith(`${key}=`));
  let value = (line?.slice(key.length + 1) ?? "").trim();
  if (value.includes(`${key}=`)) {
    value = value.slice(value.lastIndexOf(`${key}=`) + key.length + 1);
  }
  const validUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(value);
  const validKey =
    (value.startsWith("eyJ") && value.length > 100) ||
    value.startsWith("sb_publishable_") ||
    value.startsWith("sb_secret_");
  const status =
    key.includes("URL") ? (validUrl ? "valid URL" : "EMPTY or bad URL") :
    key.includes("PASSWORD") ? (value.length > 0 ? "set" : "EMPTY") :
    validKey ? "valid key" : "EMPTY or bad key";
  console.log(`${key}: ${status}`);
}
