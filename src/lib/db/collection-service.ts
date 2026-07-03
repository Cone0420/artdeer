import { FAQ_SEED_VERSION } from "@/lib/faq-data";
import type { FaqItem } from "@/lib/faq-data";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  ALL_COLLECTION_KEYS,
  defaultMeta,
  getDefaultCollectionData,
  type MetaCollection,
} from "./seed-data";
import type { CollectionKey } from "./constants";

async function collectionExists(key: CollectionKey): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("data_collections")
    .select("collection_key")
    .eq("collection_key", key)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function ensureDbSeeded(): Promise<void> {
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

export async function readCollection<T>(key: CollectionKey): Promise<T> {
  await ensureDbSeeded();
  const supabase = getSupabaseAdmin();

  if (key === "faq") {
    const meta = await readCollection<MetaCollection>("meta");
    if (meta.faqSeedVersion !== FAQ_SEED_VERSION) {
      const seeded = getDefaultCollectionData("faq") as FaqItem[];
      await writeCollection("faq", seeded);
      await writeCollection("meta", { ...meta, faqSeedVersion: FAQ_SEED_VERSION });
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
    await writeCollection(key, fallback);
    return fallback as T;
  }

  return data.data_json as T;
}

export async function writeCollection<T>(key: CollectionKey, data: T): Promise<void> {
  await ensureDbSeeded();
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
    const meta = await readCollection<MetaCollection>("meta");
    await writeCollection("meta", { ...defaultMeta, ...meta, faqSeedVersion: FAQ_SEED_VERSION });
  }
}

export async function hasCollection(key: CollectionKey): Promise<boolean> {
  await ensureDbSeeded();
  return collectionExists(key);
}
