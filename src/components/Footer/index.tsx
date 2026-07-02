"use client";

import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiscordIcon, OpenChatIcon } from "@/components/icons/brand-icons";
import { ArtDearLogo, HEADER_LOGO_HEIGHT } from "@/components/ArtDearLogo";
import { artdear } from "@/lib/artdear-styles";
import { externalHref, mailtoHref } from "@/lib/settings-data";
import { useSettings } from "@/hooks/use-settings-store";
import { useCategories } from "@/hooks/use-categories-store";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { SectionHashLink } from "@/components/ui/section-hash-link";
import styles from "./Footer.module.css";

const menuLinks = [
  { label: "Home", href: "/#hero", sectionId: "hero" },
  { label: "Portfolio", href: "/#portfolio", sectionId: "portfolio" },
  { label: "Price", href: "/#price", sectionId: "price" },
  { label: "Review", href: "/#reviews", sectionId: "reviews" },
  { label: "FAQ", href: "/#faq", sectionId: "faq" },
  { label: "ORDER", href: "/#order", sectionId: "order" },
] as const;

function FooterMenuLink({
  label,
  href,
  sectionId,
  isOrder = false,
}: {
  label: string;
  href: string;
  sectionId: string;
  isOrder?: boolean;
}) {
  return (
    <SectionHashLink
      href={href}
      sectionId={sectionId}
      className={cn(styles.menuLink, isOrder && styles.menuLinkOrder)}
    >
      {label}
      {isOrder ? <span className={styles.menuLinkUnderline} aria-hidden="true" /> : null}
    </SectionHashLink>
  );
}

export function Footer() {
  const { settings } = useSettings();
  const { items: categories } = useCategories();

  const discordLink = externalHref(settings?.discordLink ?? "#");
  const kakaoLink = externalHref(settings?.kakaoLink ?? "#");
  const emailLink = mailtoHref(settings?.email ?? "");

  return (
    <FadeInSection>
      <footer id="about" className={styles.footer}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.blurOrb} aria-hidden="true" />

        <div className={cn(artdear.container, styles.inner)}>
          <div className={styles.grid}>
            <div className={styles.brandBlock}>
              <div className={styles.brandLogo}>
                <ArtDearLogo height={HEADER_LOGO_HEIGHT} className={styles.brandLogoLink} />
              </div>

              <div className={styles.brandCopy}>
                <p className={styles.intro}>상상하는 모든 디자인을 현실로.</p>
                <p className={styles.tagline}>게임 · 방송 · 커뮤니티 디자인 전문</p>
              </div>

              <div className={styles.actions}>
                <a
                  href={discordLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtn}
                >
                  <DiscordIcon className="size-3.5 shrink-0 text-artdear-purple" />
                  Discord
                </a>
                <a
                  href={kakaoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtn}
                >
                  <OpenChatIcon />
                  OpenChat
                </a>
                <a href={emailLink} className={styles.actionBtn}>
                  <Mail className="size-3.5 shrink-0 text-artdear-purple" />
                  Email
                </a>
              </div>
            </div>

            <nav className={styles.menuColumn} aria-label="푸터 메뉴">
              <p className={styles.columnTitle}>MENU</p>
              <div className={styles.menuList}>
                {menuLinks.map((link) => (
                  <FooterMenuLink
                    key={link.label}
                    label={link.label}
                    href={link.href}
                    sectionId={link.sectionId}
                    isOrder={link.label === "ORDER"}
                  />
                ))}
              </div>
            </nav>

            <div className={styles.sideColumn}>
              <div>
                <p className={styles.columnTitle}>CONTACT</p>
                <div className={styles.contactList}>
                  <a
                    href={discordLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    Discord
                  </a>
                  <a
                    href={kakaoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    OpenChat
                  </a>
                  <a href={emailLink} className={styles.contactLink}>
                    Email
                  </a>
                </div>
                <p className={styles.hours}>
                  평일 10:00 ~ 22:00
                  <br />
                  주말 및 공휴일 상담 가능
                </p>
              </div>

              <div>
                <p className={styles.columnTitle}>SERVICE</p>
                <div className={styles.serviceList}>
                  {categories.map((category) => (
                    <p key={category.id} className={styles.serviceItem}>
                      {category.title}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.bottomBar}>
            <p>© 2026 ART DEER. All Rights Reserved.</p>
            <p className={styles.designedBy}>Designed by ART DEER</p>
          </div>
        </div>
      </footer>
    </FadeInSection>
  );
}
