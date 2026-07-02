import { deleteMedia, uploadMediaFile } from "@/lib/api/data-client";

export const LOCAL_IMAGE_STORAGE_KEY = "artdear-local-images";
export const LOCAL_IMAGE_PREFIX = "local-image://";
export const MEDIA_URL_PREFIX = "/api/media/";

type StoredImage = {
  data: string;
  mime: string;
};

const blobUrlCache = new Map<string, string>();

function loadStore(): Record<string, StoredImage> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(LOCAL_IMAGE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredImage>) : {};
  } catch {
    return {};
  }
}

function persistStore(store: Record<string, StoredImage>) {
  localStorage.setItem(LOCAL_IMAGE_STORAGE_KEY, JSON.stringify(store));
}

export function isLocalImageRef(value: string | null | undefined): boolean {
  return !!value && value.startsWith(LOCAL_IMAGE_PREFIX);
}

export function isMediaUrl(value: string | null | undefined): boolean {
  return !!value && value.startsWith(MEDIA_URL_PREFIX);
}

export function isStoredImageRef(value: string | null | undefined): boolean {
  return isLocalImageRef(value) || isMediaUrl(value);
}

export function getLocalImageId(ref: string) {
  return ref.slice(LOCAL_IMAGE_PREFIX.length);
}

export function toLocalImageRef(id: string) {
  return `${LOCAL_IMAGE_PREFIX}${id}`;
}

export function revokeObjectUrl(id: string) {
  const cached = blobUrlCache.get(id);
  if (cached) {
    URL.revokeObjectURL(cached);
    blobUrlCache.delete(id);
  }
}

export function getObjectUrl(id: string): string {
  if (typeof window === "undefined") return "";

  const cached = blobUrlCache.get(id);
  if (cached) return cached;

  const entry = loadStore()[id];
  if (!entry) return "";

  const binary = atob(entry.data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const blob = new Blob([bytes], { type: entry.mime });
  const url = URL.createObjectURL(blob);
  blobUrlCache.set(id, url);
  return url;
}

export function resolveImageSrc(value: string | null | undefined): string {
  if (!value) return "";
  if (isMediaUrl(value)) return value;
  if (isLocalImageRef(value)) return getObjectUrl(getLocalImageId(value));
  return value;
}

export function isBlobOrDataImage(value: string | null | undefined) {
  if (!value) return false;
  if (isLocalImageRef(value)) return true;
  return value.startsWith("blob:") || value.startsWith("data:");
}

export async function saveImageFromFile(file: File): Promise<string> {
  return uploadMediaFile(file);
}

export async function deleteStoredImage(ref: string | null | undefined) {
  if (!ref) return;

  if (isMediaUrl(ref)) {
    await deleteMedia(ref);
    return;
  }

  if (!isLocalImageRef(ref)) return;

  const id = getLocalImageId(ref);
  revokeObjectUrl(id);

  const store = loadStore();
  delete store[id];
  persistStore(store);
}

/** @deprecated use deleteStoredImage */
export function deleteLocalImage(ref: string | null | undefined) {
  void deleteStoredImage(ref);
}
