import {
  seedCategories,
  type CategoryItem,
  type CategoryItemInput,
} from "@/lib/categories-data";
import { categoryIconToPortfolioSlug } from "@/lib/portfolio-category-slugs";
import { fetchCollection, saveCollection } from "@/lib/api/data-client";

export const CATEGORIES_STORAGE_KEY = "artdear-categories";
export const CATEGORIES_UPDATED_EVENT = "artdear-categories-updated";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCategory(item: CategoryItem): CategoryItem {
  if (item.icon === "channel-art" || item.title === "채널아트") {
    return {
      ...item,
      title: "포토광장",
      subtitle: "PHOTO GALLERY",
      icon: "photo-gallery",
      portfolioSlug: "photo-gallery",
      viewAll: false,
    };
  }

  if (item.viewAll || item.title === "모두보기") {
    return {
      ...item,
      title: "모두보기",
      subtitle: item.subtitle || "VIEW ALL",
      viewAll: true,
      portfolioSlug: null,
    };
  }

  const seedMatch = seedCategories.find((seed) => seed.id === item.id);

  return {
    ...item,
    portfolioSlug:
      item.portfolioSlug ??
      seedMatch?.portfolioSlug ??
      categoryIconToPortfolioSlug[item.icon] ??
      null,
    viewAll: false,
  };
}

function normalizeCategories(items: CategoryItem[]): CategoryItem[] {
  const mapped = items
    .filter((item) => !item.viewAll && item.title !== "모두보기")
    .map(normalizeCategory);

  return seedCategories.map((seed) => {
    const match =
      mapped.find((item) => item.id === seed.id) ??
      mapped.find((item) => item.portfolioSlug === seed.portfolioSlug) ??
      mapped.find((item) => item.title === seed.title);

    return {
      ...seed,
      ...match,
      id: seed.id,
      title: seed.title,
      subtitle: seed.subtitle,
      icon: seed.icon,
      portfolioSlug: seed.portfolioSlug,
      viewAll: false,
    };
  });
}

export async function getCategories(): Promise<CategoryItem[]> {
  const items = await fetchCollection<CategoryItem[]>("categories");
  return normalizeCategories(items);
}

async function persistCategories(items: CategoryItem[]) {
  await saveCollection("categories", normalizeCategories(items));
}

export async function createCategory(input: CategoryItemInput): Promise<CategoryItem> {
  const items = await getCategories();
  const item = normalizeCategory({
    id: input.id ?? generateId(),
    title: input.title,
    subtitle: input.subtitle,
    icon: input.icon,
    portfolioSlug: input.portfolioSlug,
    viewAll: input.viewAll,
  });
  await persistCategories([...items, item]);
  return item;
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryItemInput>
): Promise<CategoryItem | null> {
  const items = await getCategories();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = normalizeCategory({ ...items[index], ...input, id: items[index].id });
  const next = [...items];
  next[index] = updated;
  await persistCategories(next);
  return updated;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const items = await getCategories();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  await persistCategories(next);
  return true;
}

export async function reorderCategory(id: string, direction: "up" | "down"): Promise<boolean> {
  const items = await getCategories();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return false;

  const next = [...items];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  await persistCategories(next);
  return true;
}

export async function saveCategories(items: CategoryItem[]) {
  await persistCategories(items);
}
