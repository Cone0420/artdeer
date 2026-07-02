import {
  normalizePortfolioItem,
  type PortfolioItem,
} from "@/components/Portfolio/portfolio-data";
import { getPortfolioItemsFromDb } from "@/lib/db/portfolio-service";

export function getServerPortfolioItems(): PortfolioItem[] {
  return getPortfolioItemsFromDb();
}

export function getServerPortfolioItemById(id: string): PortfolioItem | undefined {
  return getServerPortfolioItems().find((item) => item.id === id);
}

export function getServerPortfolioIds(): string[] {
  return getServerPortfolioItems().map((item) => item.id);
}
