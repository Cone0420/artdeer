import { readCollection } from "@/lib/db/collection-service";
import type { ReviewItem } from "@/lib/reviews-data";
import { normalizeReviewItem } from "@/lib/reviews-store";
import { sortReviewsByNewest } from "@/lib/reviews-sort";

type LegacyReviewItem = Parameters<typeof normalizeReviewItem>[0];

async function getVisibleServerReviews(): Promise<ReviewItem[]> {
  const items = await readCollection<LegacyReviewItem[]>("reviews");
  return sortReviewsByNewest(items.map(normalizeReviewItem)).filter((item) => item.visible);
}

export async function getServerReviews(): Promise<ReviewItem[]> {
  return getVisibleServerReviews();
}

export async function getServerReviewById(id: string): Promise<ReviewItem | undefined> {
  const items = await getVisibleServerReviews();
  return items.find((item) => item.id === id);
}

export async function getServerReviewIds(): Promise<string[]> {
  const items = await getVisibleServerReviews();
  return items.map((item) => item.id);
}
