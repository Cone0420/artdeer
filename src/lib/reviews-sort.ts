import type { ReviewItem } from "@/lib/reviews-data";

export function parseReviewDate(date: string): number {
  const [datePart, timePart] = date.trim().split(/\s+/);
  const [year, month, day] = datePart.split(".").map((part) => Number(part.trim()));
  if (!year || !month || !day) return 0;

  if (timePart) {
    const [hour, minute] = timePart.split(":").map((part) => Number(part.trim()));
    return new Date(year, month - 1, day, hour || 0, minute || 0).getTime();
  }

  return new Date(year, month - 1, day).getTime();
}

export function sortReviewsByNewest(items: ReviewItem[]): ReviewItem[] {
  return [...items].sort((a, b) => {
    const dateDiff = parseReviewDate(b.date) - parseReviewDate(a.date);
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getReviewNeighbors(
  items: ReviewItem[],
  id: string
): {
  item: ReviewItem | null;
  prev: ReviewItem | null;
  next: ReviewItem | null;
} {
  const sorted = sortReviewsByNewest(items.filter((item) => item.visible));
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
