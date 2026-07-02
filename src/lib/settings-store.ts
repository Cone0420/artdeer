import { defaultSettings, normalizeSettings, type SiteSettings } from "@/lib/settings-data";
import { fetchCollection, saveCollection } from "@/lib/api/data-client";

export const SETTINGS_STORAGE_KEY = "artdear-settings";
export const SETTINGS_UPDATED_EVENT = "artdear-settings-updated";

export async function getSettings(): Promise<SiteSettings> {
  const data = await fetchCollection<SiteSettings>("settings");
  return normalizeSettings(data);
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await saveCollection("settings", normalizeSettings(settings));
}
