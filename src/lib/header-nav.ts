import type { NavSectionId } from "@/lib/nav-sections";

export type HeaderNavItem = {
  label: string;
  href: string;
  sectionId: NavSectionId;
  /** Dedicated route prefix (e.g. /portfolio, /reviews) */
  pathPrefix?: string;
};

export const headerNavItems: HeaderNavItem[] = [
  { label: "HOME", href: "#hero", sectionId: "hero" },
  { label: "PORTFOLIO", href: "#portfolio", sectionId: "portfolio", pathPrefix: "/portfolio" },
  { label: "PRICE", href: "#price", sectionId: "price" },
  { label: "REVIEW", href: "#reviews", sectionId: "reviews", pathPrefix: "/reviews" },
  { label: "ORDER", href: "#order", sectionId: "order" },
];

export function resolveHeaderNavHref(item: HeaderNavItem, pathname: string): string {
  if (pathname === "/") return item.href;
  if (item.pathPrefix) return item.pathPrefix;
  return item.href.startsWith("#") ? `/${item.href}` : item.href;
}

export function isHeaderNavItemActive(
  item: HeaderNavItem,
  pathname: string,
  activeSectionId: NavSectionId
): boolean {
  if (item.pathPrefix) {
    const onRoute =
      pathname === item.pathPrefix || pathname.startsWith(`${item.pathPrefix}/`);
    if (onRoute) return true;
  }

  if (pathname !== "/") {
    return false;
  }

  return item.sectionId === activeSectionId;
}
