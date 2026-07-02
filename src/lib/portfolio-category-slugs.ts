import type { PortfolioCategory } from "@/components/Portfolio/portfolio-data";
import type { CategoryIconId } from "@/lib/categories-data";

export type PortfolioCategorySlug =
  | "game-poster"
  | "youtube-design"
  | "photo-gallery"
  | "guild-mark"
  | "character-design"
  | "etc-design";

export const portfolioCategoryBySlug: Record<PortfolioCategorySlug, PortfolioCategory> = {
  "game-poster": "게임 포스터",
  "youtube-design": "유튜브 디자인",
  "photo-gallery": "포토광장",
  "guild-mark": "길드마크",
  "character-design": "캐릭터 디자인",
  "etc-design": "기타 디자인",
};

export const categoryIconToPortfolioSlug: Partial<
  Record<CategoryIconId, PortfolioCategorySlug>
> = {
  "game-poster": "game-poster",
  "youtube-design": "youtube-design",
  "channel-art": "photo-gallery",
  "photo-gallery": "photo-gallery",
  "guild-mark": "guild-mark",
  "character-design": "character-design",
  "etc-design": "etc-design",
};

export function isPortfolioCategorySlug(value: string): value is PortfolioCategorySlug {
  return value in portfolioCategoryBySlug;
}

export function resolvePortfolioCategoryFromSlug(
  slug: string | null | undefined
): PortfolioCategory | "all" {
  if (!slug || !isPortfolioCategorySlug(slug)) return "all";
  return portfolioCategoryBySlug[slug];
}

export function getPortfolioCategoryHref(
  options: {
    portfolioSlug?: PortfolioCategorySlug | null;
    viewAll?: boolean;
    icon?: CategoryIconId;
  }
): string {
  if (options.viewAll) return "/portfolio";

  const slug =
    options.portfolioSlug ??
    (options.icon ? categoryIconToPortfolioSlug[options.icon] : undefined);

  if (slug) return `/portfolio?category=${slug}`;
  return "/portfolio";
}
