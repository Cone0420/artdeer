import type { PortfolioItem } from "@/components/Portfolio/portfolio-data";
import { portfolioTagsMatchQuery } from "@/lib/portfolio-tags";

export function filterPortfolioItems(
  items: PortfolioItem[],
  query: string
): PortfolioItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(normalized) ||
      item.description.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized) ||
      portfolioTagsMatchQuery(item.tags ?? [], normalized)
  );
}
