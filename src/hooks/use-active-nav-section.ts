"use client";

import { useEffect, useState } from "react";
import {
  NAV_HEADER_OFFSET,
  NAV_SECTION_IDS,
  type NavSectionId,
} from "@/lib/nav-sections";
import { resolveActiveSectionFromScroll } from "@/lib/scroll-to-section";

export { NAV_SECTION_IDS, type NavSectionId } from "@/lib/nav-sections";

function pickActiveFromRatios(ratios: Map<NavSectionId, number>): NavSectionId {
  let active: NavSectionId = "hero";
  let bestRatio = -1;

  for (const id of NAV_SECTION_IDS) {
    const ratio = ratios.get(id);
    if (ratio === undefined) continue;

    if (ratio > bestRatio) {
      bestRatio = ratio;
      active = id;
    }
  }

  if (bestRatio >= 0) return active;
  return resolveActiveSectionFromScroll();
}

export function useActiveNavSection(enabled: boolean): NavSectionId {
  const [activeSectionId, setActiveSectionId] = useState<NavSectionId>("hero");

  useEffect(() => {
    if (!enabled) {
      setActiveSectionId("hero");
      return;
    }

    const ratios = new Map<NavSectionId, number>();
    const observed = new Set<Element>();

    const syncActive = () => {
      setActiveSectionId(pickActiveFromRatios(ratios));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as NavSectionId;
          if (!(NAV_SECTION_IDS as readonly string[]).includes(id)) continue;

          if (entry.isIntersecting) {
            ratios.set(id, entry.intersectionRatio);
          } else {
            ratios.delete(id);
          }
        }

        syncActive();
      },
      {
        root: null,
        rootMargin: `-${NAV_HEADER_OFFSET}px 0px -50% 0px`,
        threshold: [0, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
      }
    );

    const observeSections = () => {
      for (const id of NAV_SECTION_IDS) {
        const element = document.getElementById(id);
        if (!element || observed.has(element)) continue;
        observed.add(element);
        observer.observe(element);
      }
    };

    const handleScroll = () => {
      if (ratios.size === 0) {
        setActiveSectionId(resolveActiveSectionFromScroll());
      }
    };

    observeSections();
    handleScroll();

    const main = document.getElementById("main-content");
    const mutationObserver = new MutationObserver(() => {
      observeSections();
      handleScroll();
    });

    if (main) {
      mutationObserver.observe(main, { childList: true, subtree: true });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [enabled]);

  return activeSectionId;
}
