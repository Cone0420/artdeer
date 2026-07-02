"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { scrollToSectionWithRetry } from "@/lib/scroll-to-section";

type SectionHashLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  sectionId: string;
  onNavigate?: () => void;
};

function getHashFromHref(href: string, sectionId: string): string {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return sectionId;
  return href.slice(hashIndex + 1);
}

export function SectionHashLink({
  href,
  sectionId,
  onNavigate,
  onClick,
  ...props
}: SectionHashLinkProps) {
  const pathname = usePathname();
  const hash = getHashFromHref(href, sectionId);
  const isHashLink = href.startsWith("#") || href.startsWith("/#");

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (pathname === "/" && isHashLink) {
      event.preventDefault();
      scrollToSectionWithRetry(hash);
      onNavigate?.();
    }
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
