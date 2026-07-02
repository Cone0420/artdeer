import { getAdminToken } from "@/lib/admin-auth";
import type { CollectionKey } from "@/lib/db/constants";

const UPDATE_EVENTS: Partial<Record<CollectionKey, string>> = {
  settings: "artdear-settings-updated",
  categories: "artdear-categories-updated",
  portfolio: "artdear-portfolio-updated",
  reviews: "artdear-reviews-updated",
  faq: "artdear-faq-updated",
  price: "artdear-price-updated",
  works: "artdear-works-updated",
};

export async function fetchCollection<T>(collection: CollectionKey): Promise<T> {
  const response = await fetch(`/api/data/${collection}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`failed_to_load_${collection}`);
  }
  return (await response.json()) as T;
}

export async function saveCollection<T>(collection: CollectionKey, data: T): Promise<void> {
  const token = getAdminToken();
  const response = await fetch(`/api/data/${collection}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`failed_to_save_${collection}`);
  }

  if (typeof window !== "undefined") {
    const eventName = UPDATE_EVENTS[collection];
    if (eventName) {
      window.dispatchEvent(new CustomEvent(eventName));
    }
  }
}

export async function uploadMediaFile(file: File): Promise<string> {
  const token = getAdminToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/media", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    throw new Error("failed_to_upload_media");
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

export async function deleteMedia(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("/api/media/")) return;

  const id = url.replace(/^\/api\/media\//, "");
  const token = getAdminToken();

  await fetch(`/api/media/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).catch(() => undefined);
}
