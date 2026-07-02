import { seedCategories } from "@/lib/categories-data";
import { seedPortfolioItems } from "@/components/Portfolio/portfolio-data";
import { seedReviews } from "@/lib/reviews-data";
import { FAQ_SEED_VERSION, seedFaqItems } from "@/lib/faq-data";
import { seedPriceSettings } from "@/lib/price-data";
import { defaultSettings } from "@/lib/settings-data";
import { seedWorks } from "@/lib/work-data";
import type { CollectionKey } from "./constants";

export type MetaCollection = {
  faqSeedVersion: number;
};

export const defaultMeta: MetaCollection = {
  faqSeedVersion: FAQ_SEED_VERSION,
};

export function getDefaultCollectionData(key: CollectionKey): unknown {
  switch (key) {
    case "settings":
      return defaultSettings;
    case "categories":
      return seedCategories;
    case "portfolio":
      return seedPortfolioItems;
    case "reviews":
      return seedReviews;
    case "faq":
      return seedFaqItems;
    case "price":
      return seedPriceSettings;
    case "works":
      return seedWorks;
    case "meta":
      return defaultMeta;
    default:
      return null;
  }
}

export const ALL_COLLECTION_KEYS: CollectionKey[] = [
  "settings",
  "categories",
  "portfolio",
  "reviews",
  "faq",
  "price",
  "works",
  "meta",
];
