import {
  normalizeFeatures,
  priceCategoryIds,
  seedPriceSettings,
  type PriceListItem,
  type PriceSettings,
  type PriceSettingsInput,
} from "@/lib/price-data";
import { getCategories } from "@/lib/categories-store";
import { fetchCollection, saveCollection } from "@/lib/api/data-client";

export const PRICE_STORAGE_KEY = "artdear-price-items";
export const PRICE_UPDATED_EVENT = "artdear-price-updated";

type LegacyPriceItem = {
  id?: string;
  categoryId?: string;
  title?: string;
  price?: string;
  description?: string;
  features?: string[];
  buttonsEnabled?: boolean;
};

function resolveFeatures(raw: LegacyPriceItem | undefined, fallback: PriceSettings): string[] {
  const fromFeatures = normalizeFeatures(raw?.features);
  if (fromFeatures.length > 0) return fromFeatures;

  const fromDescription = normalizeFeatures(raw?.description);
  if (fromDescription.length > 0) return fromDescription;

  return fallback.features;
}

async function settingsForCategory(
  categoryId: string,
  raw?: LegacyPriceItem
): Promise<PriceSettings> {
  const fallback = seedPriceSettings.find((item) => item.categoryId === categoryId)!;

  return {
    categoryId,
    price: raw?.price ?? fallback.price,
    features: resolveFeatures(raw, fallback),
    buttonsEnabled: raw?.buttonsEnabled ?? fallback.buttonsEnabled,
  };
}

async function normalizeSettings(parsed: LegacyPriceItem[]): Promise<PriceSettings[]> {
  const categories = await getCategories();

  return Promise.all(
    priceCategoryIds.map(async (categoryId) => {
      const byCategoryId = parsed.find(
        (item) => item.categoryId === categoryId || item.id === categoryId
      );
      const category = categories.find((item) => item.id === categoryId);
      const byTitle = category
        ? parsed.find((item) => item.title === category.title)
        : undefined;

      return settingsForCategory(categoryId, byCategoryId ?? byTitle);
    })
  );
}

export async function getPriceSettings(): Promise<PriceSettings[]> {
  const parsed = await fetchCollection<LegacyPriceItem[]>("price");
  if (!Array.isArray(parsed)) return seedPriceSettings;
  return normalizeSettings(parsed);
}

async function persistPrices(items: PriceSettings[]) {
  await saveCollection("price", items);
}

export async function getPriceListItems(): Promise<PriceListItem[]> {
  const [categories, settingsList] = await Promise.all([getCategories(), getPriceSettings()]);
  const settingsMap = new Map(settingsList.map((item) => [item.categoryId, item]));

  return categories.map((category) => {
    const settings =
      settingsMap.get(category.id) ??
      seedPriceSettings.find((item) => item.categoryId === category.id)!;

    return {
      categoryId: category.id,
      title: category.title,
      subtitle: category.subtitle,
      icon: category.icon,
      price: settings.price,
      features: settings.features,
      buttonsEnabled: settings.buttonsEnabled,
    };
  });
}

export async function updatePriceSettings(
  categoryId: string,
  input: PriceSettingsInput
): Promise<PriceSettings | null> {
  const items = await getPriceSettings();
  const index = items.findIndex((item) => item.categoryId === categoryId);
  if (index === -1) return null;

  const updated: PriceSettings = {
    ...items[index],
    ...input,
    categoryId: items[index].categoryId,
    features: input.features ? normalizeFeatures(input.features) : items[index].features,
  };

  const next = [...items];
  next[index] = updated;
  await persistPrices(next);
  return updated;
}

export async function savePriceSettings(items: PriceSettings[]) {
  await persistPrices(await normalizeSettings(items));
}
