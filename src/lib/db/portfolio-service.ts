import {
  normalizePortfolioItem,
  formatPortfolioDate,
  type PortfolioItem,
  type PortfolioItemInput,
} from "@/components/Portfolio/portfolio-data";
import { normalizePortfolioTags } from "@/lib/portfolio-tags";
import { readCollection, writeCollection } from "./collection-service";

export async function getPortfolioItemsFromDb(): Promise<PortfolioItem[]> {
  const items = await readCollection<PortfolioItem[]>("portfolio");
  return items.map(normalizePortfolioItem);
}

export async function savePortfolioItemsToDb(items: PortfolioItem[]): Promise<PortfolioItem[]> {
  const normalized = items.map(normalizePortfolioItem);
  await writeCollection("portfolio", normalized);
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

export async function createPortfolioItemInDb(input: PortfolioItemInput): Promise<PortfolioItem> {
  const items = await getPortfolioItemsFromDb();
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

  await savePortfolioItemsToDb([item, ...items]);
  return item;
}

export async function updatePortfolioItemInDb(
  id: string,
  input: PortfolioItemInput
): Promise<PortfolioItem | null> {
  const items = await getPortfolioItemsFromDb();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = mergePortfolioItem(items[index], input);
  if (updated.imageUrl) {
    delete updated.image;
  }

  const next = [...items];
  next[index] = updated;
  await savePortfolioItemsToDb(next);
  return updated;
}

export async function deletePortfolioItemInDb(id: string): Promise<boolean> {
  const items = await getPortfolioItemsFromDb();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  await savePortfolioItemsToDb(next);
  return true;
}

export async function reorderPortfolioItemInDb(
  id: string,
  direction: "up" | "down"
): Promise<boolean> {
  const items = await getPortfolioItemsFromDb();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return false;

  const next = [...items];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  await savePortfolioItemsToDb(next);
  return true;
}
