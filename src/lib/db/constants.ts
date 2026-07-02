export const APP_DB_DIR = "data";
export const APP_DB_FILE = "artdear.db";
export const UPLOADS_DIR = "uploads";

export const PUBLIC_COLLECTIONS = [
  "settings",
  "categories",
  "portfolio",
  "reviews",
  "faq",
  "price",
] as const;

export const ADMIN_COLLECTIONS = ["works", "meta"] as const;

export type PublicCollectionKey = (typeof PUBLIC_COLLECTIONS)[number];
export type AdminCollectionKey = (typeof ADMIN_COLLECTIONS)[number];
export type CollectionKey = PublicCollectionKey | AdminCollectionKey;
