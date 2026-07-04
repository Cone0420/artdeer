import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { loadProjectEnv } from "./load-env.mjs";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const OPTIONAL_VARS = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "ADMIN_DEFAULT_PASSWORD",
  "NEXT_PUBLIC_SITE_URL",
  "GOOGLE_SITE_VERIFICATION",
  "NAVER_SITE_VERIFICATION",
];

function readEnvValues() {
  loadProjectEnv();
  const merged = { ...process.env };
  for (const fileName of [".env", ".env.local", ".env.supabase"]) {
    const filePath = path.join(rootDir, fileName);
    if (!fs.existsSync(filePath)) continue;
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
      merged[key] = value;
    }
  }
  return merged;
}

function addVercelEnv(name, value, environment) {
  console.log(`Adding Vercel env: ${name} (${environment})`);
  execSync(`npx vercel env add ${name} ${environment} --force`, {
    cwd: rootDir,
    input: value,
    stdio: ["pipe", "inherit", "inherit"],
    env: process.env,
  });
}

function main() {
  const merged = readEnvValues();

  const missing = REQUIRED_VARS.filter((key) => !merged[key]?.trim());
  if (missing.length > 0) {
    console.error(
      "Missing Supabase credentials in .env.supabase:\n" +
        missing.map((key) => `  ${key}=...`).join("\n")
    );
    process.exit(1);
  }

  for (const environment of ["production", "preview", "development"]) {
    for (const key of REQUIRED_VARS) {
      addVercelEnv(key, merged[key].trim(), environment);
    }
    for (const key of OPTIONAL_VARS) {
      const value = merged[key]?.trim();
      if (value) addVercelEnv(key, value, environment);
    }
  }

  console.log("Vercel Supabase environment variables updated.");
  console.log("Redeploy artdeer on Vercel to apply changes.");
}

main();
