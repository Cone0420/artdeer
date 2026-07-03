import {
  normalizePortfolioItem,
  type PortfolioItem,
} from "@/components/Portfolio/portfolio-data";
import { getPortfolioItemsFromDb } from "@/lib/db/portfolio-service";

export async function getServerPortfolioItems(): Promise<PortfolioItem[]> {
  return getPortfolioItemsFromDb();
}

export async function getServerPortfolioItemById(
  id: string
): Promise<PortfolioItem | undefined> {
  const items = await getServerPortfolioItems();
  return items.find((item) => item.id === id);
}

export async function getServerPortfolioIds(): Promise<string[]> {
  const items = await getServerPortfolioItems();
  return items.map((item) => item.id);
}
