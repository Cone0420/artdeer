import { connectSupabasePg } from "./supabase-pg.mjs";

const client = await connectSupabasePg();
const result = await client.query(
  `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
);
console.log("public tables:", result.rows.map((row) => row.tablename).join(", ") || "(none)");
await client.end();
