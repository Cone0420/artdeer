import path from "path";
import { randomUUID } from "crypto";
import {
  getSupabaseAdmin,
  getSupabaseStorageBucketName,
} from "@/lib/supabase/server";

export type MediaRecord = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export function toMediaUrl(id: string) {
  return `/api/media/${id}`;
}

export function isMediaUrl(value: string | null | undefined) {
  return !!value && value.startsWith("/api/media/");
}

export function getMediaIdFromUrl(value: string) {
  return value.replace(/^\/api\/media\//, "");
}

export async function saveMediaFile(
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<MediaRecord> {
  const supabase = getSupabaseAdmin();
  const id = randomUUID();
  const ext = path.extname(originalName) || mimeToExt(mimeType);
  const storagePath = `${id}${ext}`;
  const bucket = getSupabaseStorageBucketName();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("media_files")
    .insert({
      id,
      storage_path: storagePath,
      mime_type: mimeType,
      size_bytes: buffer.byteLength,
    })
    .select("id, storage_path, mime_type, size_bytes, created_at")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    filename: data.storage_path,
    mimeType: data.mime_type,
    sizeBytes: data.size_bytes,
    createdAt: data.created_at,
  };
}

export async function getMediaFilenameFromUrl(
  value: string | null | undefined
): Promise<string | null> {
  if (!value || !isMediaUrl(value)) return null;

  const supabase = getSupabaseAdmin();
  const id = getMediaIdFromUrl(value);
  const { data, error } = await supabase
    .from("media_files")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data?.storage_path ?? null;
}

export async function getMediaFile(
  id: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("media_files")
    .select("storage_path, mime_type")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const bucket = getSupabaseStorageBucketName();
  const { data: fileData, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(data.storage_path);

  if (downloadError || !fileData) return null;

  const buffer = Buffer.from(await fileData.arrayBuffer());
  return { buffer, mimeType: data.mime_type };
}

export async function deleteMediaFile(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("media_files")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return false;

  const bucket = getSupabaseStorageBucketName();
  await supabase.storage.from(bucket).remove([data.storage_path]);

  const { error: deleteError } = await supabase.from("media_files").delete().eq("id", id);
  if (deleteError) throw deleteError;

  return true;
}

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
