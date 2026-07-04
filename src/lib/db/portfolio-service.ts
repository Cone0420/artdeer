import {
  normalizePortfolioItem,
  formatPortfolioDate,
  type PortfolioItem,
  type PortfolioItemInput,
} from "@/components/Portfolio/portfolio-data";
import { normalizePortfolioTags } from "@/lib/portfolio-tags";
import { readCollection, writeCollection } from "./collection-service";

async function mutatePortfolioItems(
  mutate: (items: PortfolioItem[]) => { items: PortfolioItem[]; changed: boolean } | { item: PortfolioItem; items: PortfolioItem[] }
): Promise<{ changed: boolean; item?: PortfolioItem }> {
  const items = (await readCollection<PortfolioItem[]>("portfolio")).map(normalizePortfolioItem);
  const result = mutate(items);

  if ("item" in result) {
    await writeCollection("portfolio", result.items.map(normalizePortfolioItem));
    return { changed: true, item: result.item };
  }

  if (!result.changed) {
    return { changed: false };
  }

  await writeCollection("portfolio", result.items.map(normalizePortfolioItem));
  return { changed: true };
}

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

  await mutatePortfolioItems((items) => ({
    item,
    items: [item, ...items],
  }));

  return item;
}

export async function updatePortfolioItemInDb(
  id: string,
  input: PortfolioItemInput
): Promise<PortfolioItem | null> {
  let updated: PortfolioItem | null = null;

  const { changed, item } = await mutatePortfolioItems((items) => {
    const index = items.findIndex((entry) => entry.id === id);
    if (index === -1) return { items, changed: false };

    const nextItem = mergePortfolioItem(items[index], input);
    if (nextItem.imageUrl) {
      delete nextItem.image;
    }

    updated = nextItem;
    const next = [...items];
    next[index] = nextItem;
    return { item: nextItem, items: next };
  });

  if (!changed || !item) return null;
  return updated;
}

export async function deletePortfolioItemInDb(id: string): Promise<boolean> {
  const { changed } = await mutatePortfolioItems((items) => {
    const next = items.filter((entry) => entry.id !== id);
    return { items: next, changed: next.length !== items.length };
  });

  return changed;
}

export async function reorderPortfolioItemInDb(
  id: string,
  direction: "up" | "down"
): Promise<boolean> {
  const { changed } = await mutatePortfolioItems((items) => {
    const index = items.findIndex((entry) => entry.id === id);
    if (index === -1) return { items, changed: false };

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return { items, changed: false };

    const next = [...items];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    return { items: next, changed: true };
  });

  return changed;
}
