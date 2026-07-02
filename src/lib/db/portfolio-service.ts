import {
  normalizePortfolioItem,
  formatPortfolioDate,
  type PortfolioItem,
  type PortfolioItemInput,
} from "@/components/Portfolio/portfolio-data";
import { normalizePortfolioTags } from "@/lib/portfolio-tags";
import { readCollection, writeCollection } from "./collection-service";

export function getPortfolioItemsFromDb(): PortfolioItem[] {
  return readCollection<PortfolioItem[]>("portfolio").map(normalizePortfolioItem);
}

export function savePortfolioItemsToDb(items: PortfolioItem[]): PortfolioItem[] {
  const normalized = items.map(normalizePortfolioItem);
  writeCollection("portfolio", normalized);
  return normalized;
}

function mergePortfolioItem(
  existing: PortfolioItem,
  input: PortfolioItemInput
): PortfolioItem {
  return normalizePortfolioItem({
    ...existing,
    title: input.title,
    description: input.description,
    category: input.category,
    date: input.date ?? existing.date,
    imageUrl: input.imageUrl ?? existing.imageUrl ?? null,
    image: input.image ?? existing.image,
    tags: input.tags !== undefined ? normalizePortfolioTags(input.tags) : existing.tags,
  });
}

export function createPortfolioItemInDb(input: PortfolioItemInput): PortfolioItem {
  const items = getPortfolioItemsFromDb();
  const item = normalizePortfolioItem({
    id: input.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    description: input.description,
    category: input.category,
    date: input.date ?? formatPortfolioDate(),
    imageUrl: input.imageUrl ?? null,
    image: input.image,
    tags: input.tags,
  });

  if (item.imageUrl) {
    delete item.image;
  }

  savePortfolioItemsToDb([item, ...items]);
  return item;
}

export function updatePortfolioItemInDb(
  id: string,
  input: PortfolioItemInput
): PortfolioItem | null {
  const items = getPortfolioItemsFromDb();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = mergePortfolioItem(items[index], input);
  if (updated.imageUrl) {
    delete updated.image;
  }

  const next = [...items];
  next[index] = updated;
  savePortfolioItemsToDb(next);
  return updated;
}

export function deletePortfolioItemInDb(id: string): boolean {
  const items = getPortfolioItemsFromDb();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  savePortfolioItemsToDb(next);
  return true;
}

export function reorderPortfolioItemInDb(id: string, direction: "up" | "down"): boolean {
  const items = getPortfolioItemsFromDb();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return false;

  const next = [...items];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  savePortfolioItemsToDb(next);
  return true;
}
