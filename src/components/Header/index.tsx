"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { externalHref } from "@/lib/settings-data";
import { useSettings } from "@/hooks/use-settings-store";
import { DiscordIcon, OpenChatIcon } from "@/components/icons/brand-icons";
import { ArtDearLogo } from "@/components/ArtDearLogo";
import {
  HeaderPortfolioSearch,
  MobileMenuPortfolioSearch,
} from "@/components/Portfolio/PortfolioSearch";
import { RippleLink } from "@/components/ui/ripple-button";
import { useActiveNavSection } from "@/hooks/use-active-nav-section";
import { scrollToLocationHash } from "@/lib/scroll-to-section";
import {
  headerNavItems,
  isHeaderNavItemActive,
  resolveHeaderNavHref,
  type HeaderNavItem,
} from "@/lib/header-nav";
import navStyles from "./HeaderNav.module.css";
import { SectionHashLink } from "@/components/ui/section-hash-link";

const HEADER_HEIGHT_CLASS = "h-14 sm:h-16 lg:h-[72px]";

function DesktopNavLink({
  item,
  href,
  isActive,
}: {
  item: HeaderNavItem;
  href: string;
  isActive: boolean;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
      <SectionHashLink
        href={href}
        sectionId={item.sectionId}
        className={cn(
          navStyles.link,
          isActive ? navStyles.linkActive : navStyles.linkDefault
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {item.label}
      </SectionHashLink>
    </motion.div>
  );
}

function HeaderLogo() {
  return (
    <div className="inline-flex shrink-0 items-center will-change-transform [transform:translateZ(0)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.01]">
      <ArtDearLogo priority className="min-w-0" />
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const activeSectionId = useActiveNavSection(isHomePage);
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;

    scrollToLocationHash();

    const handleHashChange = () => scrollToLocationHash();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  const discordLink = externalHref(settings?.discordLink ?? "#");
  const kakaoLink = externalHref(settings?.kakaoLink ?? "#");

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(artdear.header, scrolled && artdear.headerScrolled, "overflow-visible")}
      >
        <div
          className={cn(
            artdear.container,
            "flex h-14 items-center justify-between gap-2 overflow-visible max-md:px-5 sm:h-16 lg:grid lg:h-[72px] lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-4"
          )}
        >
          <div className="lg:justify-self-start">
            <HeaderLogo />
          </div>

          <nav
            className="relative z-20 hidden items-center gap-5 overflow-visible py-1 lg:flex lg:justify-self-center xl:gap-8"
            aria-label="메인 메뉴"
          >
            {headerNavItems.map((item) => {
              const isActive = isHeaderNavItemActive(item, pathname, activeSectionId);
              const href = resolveHeaderNavHref(item, pathname);

              return (
                <DesktopNavLink
                  key={item.label}
                  item={item}
                  href={href}
                  isActive={isActive}
                />
              );
            })}
          </nav>

          <div className="relative z-10 flex shrink-0 items-center justify-self-end gap-1.5 sm:gap-2">
            <HeaderPortfolioSearch />
            <RippleLink
              href={discordLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(artdear.btnSecondary, "hidden h-9 px-3 text-[11px] md:inline-flex lg:px-4 lg:text-[12px]")}
            >
              <DiscordIcon className="size-3.5 shrink-0 text-artdear-purple" />
              <span className="hidden lg:inline">DISCORD</span>
              <span className="lg:hidden">DC</span>
            </RippleLink>
            <RippleLink
              href={kakaoLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                artdear.btnSecondary,
                "hidden h-9 px-3 text-[11px] sm:inline-flex lg:px-4 lg:text-[12px]"
              )}
            >
              <OpenChatIcon />
              <span className="hidden md:inline">오픈채팅</span>
              <span className="md:hidden">채팅</span>
            </RippleLink>

            <button
              type="button"
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
              className={cn(
                artdear.btnGlow,
                "flex size-9 items-center justify-center rounded-full border border-artdear-border-strong bg-artdear-btn-secondary text-artdear-purple shadow-[var(--shadow-artdear-card)] lg:hidden"
              )}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <div aria-hidden className={cn(HEADER_HEIGHT_CLASS, "shrink-0 bg-[rgba(255,255,255,0.96)]")} />

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="메뉴 닫기"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={closeMenu}
            />
            <motion.nav
              id="mobile-nav"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-[10001] flex w-full max-w-[min(100vw,320px)] flex-col border-l border-artdear-border bg-artdear-header shadow-[var(--shadow-artdear-card-hover)] sm:max-w-[360px] lg:hidden"
              aria-label="모바일 메뉴"
            >
              <div className="flex h-14 items-center justify-between border-b border-artdear-border px-4 sm:h-16 sm:px-5">
                <HeaderLogo />
                <button
                  type="button"
                  aria-label="메뉴 닫기"
                  onClick={closeMenu}
                  className="flex size-9 items-center justify-center rounded-full border border-artdear-border-strong text-artdear-text-subtle"
                >
                  <X className="size-5" />
                </button>
              </div>

              <MobileMenuPortfolioSearch onNavigate={closeMenu} />

              <ul className="flex-1 overflow-y-auto px-4 py-6 sm:px-5">
                {headerNavItems.map((item, index) => {
                  const isActive = isHeaderNavItemActive(item, pathname, activeSectionId);
                  const href = resolveHeaderNavHref(item, pathname);

                  return (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <SectionHashLink
                      href={href}
                      sectionId={item.sectionId}
                      onClick={closeMenu}
                      onNavigate={closeMenu}
                      className={cn(
                        navStyles.mobileLink,
                        "border-b border-artdear-border/60",
                        isActive ? navStyles.mobileLinkActive : navStyles.mobileLinkDefault
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </SectionHashLink>
                  </motion.li>
                  );
                })}
              </ul>

              <div className="space-y-2.5 border-t border-artdear-border p-4 sm:p-5">
                <a
                  href={discordLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className={cn(artdear.btnPrimary, "flex h-11 w-full items-center justify-center gap-2 text-[14px]")}
                >
                  <DiscordIcon className="size-4" />
                  디스코드 문의
                </a>
                <a
                  href={kakaoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className={cn(
                    artdear.btnSecondary,
                    "flex h-11 w-full items-center justify-center gap-2 text-[14px]"
                  )}
                >
                  <OpenChatIcon />
                  오픈채팅 문의
                </a>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default Header;
