import {
  formatReviewDate,
  formatReviewDisplayDate,
  inferCreatedAtFromId,
  type ReviewItem,
  type ReviewItemInput,
} from "@/lib/reviews-data";
import { sortReviewsByNewest } from "@/lib/reviews-sort";
import { fetchCollection, saveCollection } from "@/lib/api/data-client";

export const REVIEWS_STORAGE_KEY = "artdear-reviews";
export const REVIEWS_UPDATED_EVENT = "artdear-reviews-updated";

type LegacyReviewItem = Partial<ReviewItem> & {
  avatar?: string;
  work?: string;
  workImageUrl?: string | null;
};

export function normalizeReviewItem(item: LegacyReviewItem): ReviewItem {
  const createdAt =
    item.createdAt ??
    inferCreatedAtFromId(item.id ?? "") ??
    new Date().toISOString();

  return {
    id: item.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nickname: item.nickname ?? "",
    text: item.text ?? "",
    date: item.date?.trim()
      ? formatReviewDisplayDate(item.date)
      : formatReviewDate(),
    createdAt,
    rating: item.rating ?? 5,
    visible: item.visible !== false,
    avatarUrl: item.avatarUrl ?? null,
  };
}

function normalizeReviews(items: LegacyReviewItem[]): ReviewItem[] {
  return sortReviewsByNewest(items.map(normalizeReviewItem));
}

export async function getReviews(): Promise<ReviewItem[]> {
  const items = await fetchCollection<LegacyReviewItem[]>("reviews");
  return normalizeReviews(items);
}

async function persistReviews(items: ReviewItem[]) {
  await saveCollection("reviews", sortReviewsByNewest(items));
}

export async function createReview(input: ReviewItemInput): Promise<ReviewItem> {
  const items = await getReviews();
  const now = new Date();
  const item = normalizeReviewItem({
    id: input.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nickname: input.nickname,
    text: input.text,
    date: input.date ? formatReviewDisplayDate(input.date) : formatReviewDate(now),
    createdAt: input.createdAt ?? now.toISOString(),
    rating: input.rating ?? 5,
    visible: input.visible !== false,
  });
  await persistReviews([item, ...items]);
  return item;
}

export async function updateReview(id: string, input: ReviewItemInput): Promise<ReviewItem | null> {
  const items = await getReviews();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = normalizeReviewItem({
    ...items[index],
    nickname: input.nickname,
    text: input.text,
    date: input.date ?? items[index].date,
    rating: input.rating ?? items[index].rating,
    visible: input.visible !== undefined ? input.visible !== false : items[index].visible,
  });

  const next = [...items];
  next[index] = updated;
  await persistReviews(next);
  return updated;
}

export async function deleteReview(id: string): Promise<boolean> {
  const items = await getReviews();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  await persistReviews(next);
  return true;
}

export async function toggleReviewVisibility(id: string): Promise<boolean> {
  const items = await getReviews();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;

  const next = [...items];
  next[index] = { ...next[index], visible: !next[index].visible };
  await persistReviews(next);
  return true;
}

export async function reorderReview(_id: string, _direction: "up" | "down"): Promise<boolean> {
  return false;
}

export async function getVisibleReviews(): Promise<ReviewItem[]> {
  return (await getReviews()).filter((item) => item.visible);
}
