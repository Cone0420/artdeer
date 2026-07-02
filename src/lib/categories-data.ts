export type CategoryIconId =
  | "game-poster"
  | "youtube-design"
  | "channel-art"
  | "photo-gallery"
  | "guild-mark"
  | "character-design"
  | "etc-design";

export type CategoryItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: CategoryIconId;
  portfolioSlug?: import("@/lib/portfolio-category-slugs").PortfolioCategorySlug | null;
  viewAll?: boolean;
};

export const categoryIconOptions: { label: string; value: CategoryIconId }[] = [
  { label: "게임 포스터", value: "game-poster" },
  { label: "유튜브 디자인", value: "youtube-design" },
  { label: "포토광장", value: "photo-gallery" },
  { label: "길드마크", value: "guild-mark" },
  { label: "캐릭터 디자인", value: "character-design" },
  { label: "기타 디자인", value: "etc-design" },
];

export const seedCategories: CategoryItem[] = [
  {
    id: "1",
    title: "게임 포스터",
    subtitle: "GAME POSTER",
    icon: "game-poster",
    portfolioSlug: "game-poster",
  },
  {
    id: "2",
    title: "유튜브 디자인",
    subtitle: "YOUTUBE DESIGN",
    icon: "youtube-design",
    portfolioSlug: "youtube-design",
  },
  {
    id: "3",
    title: "포토광장",
    subtitle: "PHOTO GALLERY",
    icon: "photo-gallery",
    portfolioSlug: "photo-gallery",
  },
  {
    id: "4",
    title: "길드마크",
    subtitle: "GUILD MARK",
    icon: "guild-mark",
    portfolioSlug: "guild-mark",
  },
  {
    id: "5",
    title: "캐릭터 디자인",
    subtitle: "CHARACTER DESIGN",
    icon: "character-design",
    portfolioSlug: "character-design",
  },
  {
    id: "6",
    title: "기타 디자인",
    subtitle: "ETC DESIGN",
    icon: "etc-design",
    portfolioSlug: "etc-design",
  },
];

export type CategoryItemInput = Omit<CategoryItem, "id"> & { id?: string };
