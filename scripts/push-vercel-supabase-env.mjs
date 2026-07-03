import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const REQUIRED_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const OPTIONAL_VARS = ["SUPABASE_STORAGE_BUCKET", "ADMIN_DEFAULT_PASSWORD"];

function loadEnvFile(filePath) {
  const values = {};
  if (!fs.existsSync(filePath)) return values;

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
    values[key] = value;
  }
  return values;
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
  const envLocal = loadEnvFile(path.join(rootDir, ".env.local"));
  const envFile = loadEnvFile(path.join(rootDir, ".env"));
  const merged = { ...envFile, ...envLocal, ...process.env };

  const missing = REQUIRED_VARS.filter((key) => !merged[key]?.trim());
  if (missing.length > 0) {
    console.error(
      "Missing Supabase credentials. Add these to .env.local first:\n" +
        missing.map((key) => `  ${key}=...`).join("\n") +
        "\n\nSetup steps:\n" +
        "  1. Create a Supabase project at https://supabase.com/dashboard\n" +
        "  2. Run supabase/migrations/001_initial_schema.sql in SQL Editor\n" +
        "  3. Create a public Storage bucket named \"media\"\n" +
        "  4. Copy Project URL + service_role key into .env.local\n" +
        "  5. npm run migrate-to-supabase\n" +
        "  6. npm run push-vercel-env"
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
