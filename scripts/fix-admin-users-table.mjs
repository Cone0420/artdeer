import { connectSupabasePg, reloadPostgrestSchema } from "./supabase-pg.mjs";

const client = await connectSupabasePg();

await client.query(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
  );
`);

await reloadPostgrestSchema(client);
console.log("admin_users table ensured");
await client.end();
