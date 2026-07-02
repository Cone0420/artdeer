import { type FaqItem, type FaqItemInput } from "@/lib/faq-data";
import { fetchCollection, saveCollection } from "@/lib/api/data-client";

export const FAQ_STORAGE_KEY = "artdear-faq-items";
export const FAQ_SEED_VERSION_KEY = "artdear-faq-seed-version";
export const FAQ_UPDATED_EVENT = "artdear-faq-updated";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeFaqItem(item: FaqItem): FaqItem {
  return {
    id: item.id,
    question: item.question.trim(),
    answer: item.answer.trim(),
  };
}

function normalizeFaqItems(items: FaqItem[]): FaqItem[] {
  return items.map(normalizeFaqItem).filter((item) => item.question && item.answer);
}

export async function getFaqItems(): Promise<FaqItem[]> {
  const items = await fetchCollection<FaqItem[]>("faq");
  return normalizeFaqItems(items);
}

async function persistFaq(items: FaqItem[]) {
  await saveCollection("faq", normalizeFaqItems(items));
}

export async function createFaqItem(input: FaqItemInput): Promise<FaqItem> {
  const items = await getFaqItems();
  const item = normalizeFaqItem({
    id: input.id ?? generateId(),
    question: input.question,
    answer: input.answer,
  });
  await persistFaq([...items, item]);
  return item;
}

export async function updateFaqItem(id: string, input: FaqItemInput): Promise<FaqItem | null> {
  const items = await getFaqItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = normalizeFaqItem({
    ...items[index],
    question: input.question,
    answer: input.answer,
    id: items[index].id,
  });

  const next = [...items];
  next[index] = updated;
  await persistFaq(next);
  return updated;
}

export async function deleteFaqItem(id: string): Promise<boolean> {
  const items = await getFaqItems();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  await persistFaq(next);
  return true;
}

export async function moveFaqItem(draggedId: string, targetId: string): Promise<boolean> {
  const items = await getFaqItems();
  const from = items.findIndex((item) => item.id === draggedId);
  const to = items.findIndex((item) => item.id === targetId);
  if (from === -1 || to === -1 || from === to) return false;

  const next = [...items];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  await persistFaq(next);
  return true;
}

export async function saveFaqItems(items: FaqItem[]) {
  await persistFaq(normalizeFaqItems(items));
}
