import {
  normalizePortfolioItem,
  seedPortfolioItems,
  type PortfolioItem,
  type PortfolioItemInput,
} from "@/components/Portfolio/portfolio-data";
import { fetchCollection, saveCollection } from "@/lib/api/data-client";
import { getAdminToken } from "@/lib/admin-auth";

export const PORTFOLIO_STORAGE_KEY = "artdear-portfolio-items";
export const PORTFOLIO_UPDATED_EVENT = "artdear-portfolio-updated";

function authHeaders(): HeadersInit {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function notifyPortfolioUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PORTFOLIO_UPDATED_EVENT));
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "request_failed";
  } catch {
    return "request_failed";
  }
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const items = await fetchCollection<PortfolioItem[]>("portfolio");
  return items.map(normalizePortfolioItem);
}

export async function savePortfolioItems(items: PortfolioItem[]) {
  await saveCollection(
    "portfolio",
    items.map(normalizePortfolioItem)
  );
}

export async function createPortfolioItem(input: PortfolioItemInput): Promise<PortfolioItem> {
  const response = await fetch("/api/admin/portfolio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { item: PortfolioItem };
  notifyPortfolioUpdated();
  return normalizePortfolioItem(data.item);
}

export async function updatePortfolioItem(
  id: string,
  input: PortfolioItemInput
): Promise<PortfolioItem | null> {
  const response = await fetch(`/api/admin/portfolio/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(input),
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { item: PortfolioItem };
  notifyPortfolioUpdated();
  return normalizePortfolioItem(data.item);
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  const url = `/api/admin/portfolio/${id}`;
  console.log("[portfolio-delete] API request starting", { method: "DELETE", url, id });

  const response = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(),
  });

  console.log("[portfolio-delete] API response received", {
    id,
    url,
    status: response.status,
    ok: response.ok,
  });

  if (response.status === 404) return false;
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  notifyPortfolioUpdated();
  return true;
}

export async function reorderPortfolioItem(id: string, direction: "up" | "down"): Promise<boolean> {
  const response = await fetch("/api/admin/portfolio/reorder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ id, direction }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  notifyPortfolioUpdated();
  return true;
}

export async function resetPortfolioItems() {
  await saveCollection("portfolio", seedPortfolioItems);
}
