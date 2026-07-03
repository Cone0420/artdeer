import pg from "pg";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const password = process.env.SUPABASE_DB_PASSWORD;
const connectionString = `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`;

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const result = await client.query(
  `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
);
console.log("public tables:", result.rows.map((row) => row.tablename).join(", ") || "(none)");
await client.query(`NOTIFY pgrst, 'reload schema'`);
console.log("PostgREST schema reload requested");
await client.end();
