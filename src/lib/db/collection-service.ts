import { unstable_noStore as noStore } from "next/cache";
import { FAQ_SEED_VERSION } from "@/lib/faq-data";
import type { FaqItem } from "@/lib/faq-data";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { assertVercelDatabase, useSupabaseDatabase } from "./provider";
import {
  ensureDbSeededSqlite,
  hasCollectionSqlite,
  readCollectionSqlite,
  writeCollectionSqlite,
} from "./sqlite/collection-service";
import {
  ALL_COLLECTION_KEYS,
  defaultMeta,
  getDefaultCollectionData,
  type MetaCollection,
} from "./seed-data";
import type { CollectionKey } from "./constants";

async function collectionExistsSupabase(key: CollectionKey): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("data_collections")
    .select("collection_key")
    .eq("collection_key", key)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function ensureDbSeededSupabase(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("data_collections")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  if ((count ?? 0) > 0) return;

  const rows = ALL_COLLECTION_KEYS.map((key) => ({
    collection_key: key,
    data_json: getDefaultCollectionData(key),
  }));

  const { error: insertError } = await supabase.from("data_collections").insert(rows);
  if (insertError) throw insertError;
}

async function readCollectionSupabase<T>(key: CollectionKey): Promise<T> {
  await ensureDbSeededSupabase();
  const supabase = getSupabaseAdmin();

  if (key === "faq") {
    const meta = await readCollectionSupabase<MetaCollection>("meta");
    if (meta.faqSeedVersion !== FAQ_SEED_VERSION) {
      const seeded = getDefaultCollectionData("faq") as FaqItem[];
      await writeCollectionSupabase("faq", seeded);
      await writeCollectionSupabase("meta", { ...meta, faqSeedVersion: FAQ_SEED_VERSION });
      return seeded as T;
    }
  }

  const { data, error } = await supabase
    .from("data_collections")
    .select("data_json")
    .eq("collection_key", key)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const fallback = getDefaultCollectionData(key);
    await writeCollectionSupabase(key, fallback);
    return fallback as T;
  }

  return data.data_json as T;
}

async function writeCollectionSupabase<T>(key: CollectionKey, data: T): Promise<void> {
  await ensureDbSeededSupabase();
  const supabase = getSupabaseAdmin();
  const payload = JSON.parse(JSON.stringify(data));

  const { error } = await supabase.from("data_collections").upsert(
    {
      collection_key: key,
      data_json: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "collection_key" }
  );

  if (error) {
    throw new Error(`writeCollection(${key}): ${error.message}`);
  }

  if (key === "faq") {
    const meta = await readCollectionSupabase<MetaCollection>("meta");
    await writeCollectionSupabase("meta", { ...defaultMeta, ...meta, faqSeedVersion: FAQ_SEED_VERSION });
  }
}

export async function ensureDbSeeded(): Promise<void> {
  if (useSupabaseDatabase()) {
    await ensureDbSeededSupabase();
    return;
  }
  await ensureDbSeededSqlite();
}

export async function readCollection<T>(key: CollectionKey): Promise<T> {
  noStore();
  assertVercelDatabase(`readCollection(${key})`);

  if (useSupabaseDatabase()) {
    return readCollectionSupabase<T>(key);
  }
  return readCollectionSqlite<T>(key);
}

export async function writeCollection<T>(key: CollectionKey, data: T): Promise<void> {
  noStore();
  assertVercelDatabase(`writeCollection(${key})`);

  if (useSupabaseDatabase()) {
    await writeCollectionSupabase(key, data);
    return;
  }
  await writeCollectionSqlite(key, data);
}

export async function hasCollection(key: CollectionKey): Promise<boolean> {
  if (useSupabaseDatabase()) {
    await ensureDbSeededSupabase();
    return collectionExistsSupabase(key);
  }
  return hasCollectionSqlite(key);
}
