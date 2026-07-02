import type { PortfolioItem } from "@/components/Portfolio/portfolio-data";

export function parsePortfolioDate(date: string): number {
  const [year, month, day] = date.split(".").map((part) => Number(part.trim()));
  if (!year || !month || !day) return 0;
  return new Date(year, month - 1, day).getTime();
}

export function sortPortfolioByNewest(items: PortfolioItem[]): PortfolioItem[] {
  return [...items].sort((a, b) => {
    const dateDiff = parsePortfolioDate(b.date) - parsePortfolioDate(a.date);
    if (dateDiff !== 0) return dateDiff;
    return b.id.localeCompare(a.id, undefined, { numeric: true });
  });
}

export function getPortfolioNeighbors(
  items: PortfolioItem[],
  id: string
): {
  item: PortfolioItem | null;
  prev: PortfolioItem | null;
  next: PortfolioItem | null;
} {
  const sorted = sortPortfolioByNewest(items);
  const index = sorted.findIndex((item) => item.id === id);
  if (index === -1) {
    return { item: null, prev: null, next: null };
  }

  return {
    item: sorted[index],
    prev: index > 0 ? sorted[index - 1] : null,
    next: index < sorted.length - 1 ? sorted[index + 1] : null,
  };
}

export function getRecentPortfolioItems(items: PortfolioItem[], limit = 8): PortfolioItem[] {
  return sortPortfolioByNewest(items).slice(0, limit);
}

export function getPopularPortfolioItems(
  items: PortfolioItem[],
  limit = 6
): PortfolioItem[] {
  return sortPortfolioByNewest(items).slice(0, limit);
}
