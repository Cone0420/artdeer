export const NAV_SECTION_IDS = [
  "hero",
  "portfolio",
  "price",
  "reviews",
  "order",
] as const;

export type NavSectionId = (typeof NAV_SECTION_IDS)[number];

export const NAV_HEADER_OFFSET = 120;

export function isNavSectionId(value: string): value is NavSectionId {
  return (NAV_SECTION_IDS as readonly string[]).includes(value);
}
