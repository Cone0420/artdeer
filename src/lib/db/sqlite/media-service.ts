import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getAppDb, getUploadsDir } from "../app-db";

export type MediaRecord = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

function mimeToExt(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/png":
    default:
      return ".png";
  }
}

export function saveMediaFileSqlite(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): MediaRecord {
  const db = getAppDb();
  const id = randomUUID();
  const ext = path.extname(originalName) || mimeToExt(mimeType);
  const filename = `${id}${ext}`;
  const filePath = path.join(getUploadsDir(), filename);

  fs.writeFileSync(filePath, buffer);

  db.prepare(
    `
    INSERT INTO media_files (id, filename, mime_type, size_bytes, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `
  ).run(id, filename, mimeType, buffer.byteLength);

  const row = db
    .prepare(`SELECT id, filename, mime_type, size_bytes, created_at FROM media_files WHERE id = ?`)
    .get(id) as {
    id: string;
    filename: string;
    mime_type: string;
    size_bytes: number;
    created_at: string;
  };

  return {
    id: row.id,
    filename: row.filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
  };
}

export function getMediaFilenameFromUrlSqlite(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/api/media/")) return null;

  const db = getAppDb();
  const id = value.replace(/^\/api\/media\//, "");
  const row = db
    .prepare(`SELECT filename FROM media_files WHERE id = ?`)
    .get(id) as { filename: string } | undefined;

  return row?.filename ?? null;
}

export function getMediaFileSqlite(id: string): { buffer: Buffer; mimeType: string } | null {
  const db = getAppDb();
  const row = db
    .prepare(`SELECT filename, mime_type FROM media_files WHERE id = ?`)
    .get(id) as { filename: string; mime_type: string } | undefined;

  if (!row) return null;

  const filePath = path.join(getUploadsDir(), row.filename);
  if (!fs.existsSync(filePath)) return null;

  return {
    buffer: fs.readFileSync(filePath),
    mimeType: row.mime_type,
  };
}

export function deleteMediaFileSqlite(id: string): boolean {
  const db = getAppDb();
  const row = db
    .prepare(`SELECT filename FROM media_files WHERE id = ?`)
    .get(id) as { filename: string } | undefined;

  if (!row) return false;

  const filePath = path.join(getUploadsDir(), row.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  db.prepare(`DELETE FROM media_files WHERE id = ?`).run(id);
  return true;
}
