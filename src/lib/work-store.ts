import { seedWorks, type WorkItem, type WorkItemInput, type WorkStatus } from "@/lib/work-data";
import { getAdminToken } from "@/lib/admin-auth";
import { saveCollection } from "@/lib/api/data-client";

export const WORKS_STORAGE_KEY = "artdear-works";
export const WORKS_UPDATED_EVENT = "artdear-works-updated";

function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function fetchWorks(): Promise<WorkItem[]> {
  const token = getAdminToken();
  const response = await fetch("/api/admin/data/works", {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("failed_to_load_works");
  }

  return (await response.json()) as WorkItem[];
}

async function persistWorks(items: WorkItem[]) {
  await saveCollection("works", items);
}

export async function getWorks(): Promise<WorkItem[]> {
  return fetchWorks();
}

export async function createWork(input: WorkItemInput): Promise<WorkItem> {
  const items = await getWorks();
  const item: WorkItem = {
    id: input.id ?? generateId(),
    clientName: input.clientName,
    title: input.title,
    category: input.category,
    status: input.status ?? "consulting",
    date: input.date ?? formatDate(),
    note: input.note,
  };
  await persistWorks([item, ...items]);
  return item;
}

export async function updateWork(id: string, input: WorkItemInput): Promise<WorkItem | null> {
  const items = await getWorks();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: WorkItem = {
    ...items[index],
    clientName: input.clientName,
    title: input.title,
    category: input.category,
    status: input.status ?? items[index].status,
    note: input.note,
  };

  const next = [...items];
  next[index] = updated;
  await persistWorks(next);
  return updated;
}

export async function updateWorkStatus(id: string, status: WorkStatus): Promise<WorkItem | null> {
  const items = await getWorks();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const next = [...items];
  next[index] = { ...next[index], status };
  await persistWorks(next);
  return next[index];
}

export async function deleteWork(id: string): Promise<boolean> {
  const items = await getWorks();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  await persistWorks(next);
  return true;
}

export async function resetWorks() {
  await persistWorks(seedWorks);
}
