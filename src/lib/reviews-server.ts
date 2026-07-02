import { readCollection } from "@/lib/db/collection-service";
import type { ReviewItem } from "@/lib/reviews-data";
import { normalizeReviewItem } from "@/lib/reviews-store";
import { sortReviewsByNewest } from "@/lib/reviews-sort";

type LegacyReviewItem = Parameters<typeof normalizeReviewItem>[0];

function getVisibleServerReviews(): ReviewItem[] {
  const items = readCollection<LegacyReviewItem[]>("reviews");
  return sortReviewsByNewest(items.map(normalizeReviewItem)).filter((item) => item.visible);
}

export function getServerReviews(): ReviewItem[] {
  return getVisibleServerReviews();
}

export function getServerReviewById(id: string): ReviewItem | undefined {
  return getVisibleServerReviews().find((item) => item.id === id);
}

export function getServerReviewIds(): string[] {
  return getVisibleServerReviews().map((item) => item.id);
}
