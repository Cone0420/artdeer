import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dbPath = path.join(process.cwd(), "data", "artdear.db");

if (!fs.existsSync(dbPath)) {
  console.log("[prepare-sqlite] data/artdear.db not found, skipping");
  process.exit(0);
}

const db = new Database(dbPath);
try {
  db.pragma("wal_checkpoint(FULL)");
  db.pragma("journal_mode = DELETE");
} finally {
  db.close();
}

for (const suffix of ["-wal", "-shm"]) {
  const sidecar = `${dbPath}${suffix}`;
  if (fs.existsSync(sidecar)) {
    fs.unlinkSync(sidecar);
  }
}

console.log("[prepare-sqlite] artdear.db checkpointed to DELETE journal mode for serverless deploy");
