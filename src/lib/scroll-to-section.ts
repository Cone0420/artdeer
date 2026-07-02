import {
  isNavSectionId,
  NAV_HEADER_OFFSET,
  NAV_SECTION_IDS,
  type NavSectionId,
} from "@/lib/nav-sections";

export { NAV_HEADER_OFFSET, type NavSectionId } from "@/lib/nav-sections";

export function scrollToSection(
  sectionId: string,
  behavior: ScrollBehavior = "smooth"
): boolean {
  const element = document.getElementById(sectionId);
  if (!element) return false;

  const top =
    element.getBoundingClientRect().top + window.scrollY - NAV_HEADER_OFFSET;

  window.scrollTo({
    top: Math.max(0, top),
    behavior,
  });

  if (window.location.pathname === "/") {
    window.history.replaceState(null, "", `#${sectionId}`);
  }

  return true;
}

export function scrollToSectionWithRetry(
  sectionId: string,
  behavior: ScrollBehavior = "smooth",
  maxAttempts = 30,
  intervalMs = 100
): void {
  if (scrollToSection(sectionId, behavior)) return;

  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    if (scrollToSection(sectionId, behavior) || attempts >= maxAttempts) {
      window.clearInterval(timer);
    }
  }, intervalMs);
}

export function scrollToLocationHash(behavior: ScrollBehavior = "smooth"): void {
  const hash = window.location.hash.slice(1);
  if (!hash || !isNavSectionId(hash)) return;
  scrollToSectionWithRetry(hash, behavior);
}

export function resolveActiveSectionFromScroll(): NavSectionId {
  const anchor = window.scrollY + NAV_HEADER_OFFSET;
  let active: NavSectionId = "hero";

  for (const id of NAV_SECTION_IDS) {
    const element = document.getElementById(id);
    if (!element) continue;

    const top = element.getBoundingClientRect().top + window.scrollY;
    if (top <= anchor) {
      active = id;
    }
  }

  return active;
}
