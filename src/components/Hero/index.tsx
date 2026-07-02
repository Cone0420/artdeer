"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { externalHref } from "@/lib/settings-data";
import { useSettings } from "@/hooks/use-settings-store";
import { DiscordIcon, OpenChatIcon } from "@/components/icons/brand-icons";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { RippleLink } from "@/components/ui/ripple-button";

const HERO_BANNER_VERSION = "20260703v2";
const HERO_BANNER = {
  src: `/images/hero-banner.png?v=${HERO_BANNER_VERSION}`,
  width: 1672,
  height: 941,
} as const;

const heroBannerImageClass =
  "block h-auto w-full object-contain object-center will-change-transform [image-rendering:auto] [transform:translateZ(0)]";

const heroInquiryButtonClass = cn(
  artdear.btnGlow,
  "inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[16px] border border-artdear-border-strong bg-white px-4 text-[13px] font-semibold text-artdear-text-muted shadow-[var(--shadow-artdear-card)] transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform [transform:translateZ(0)] hover:-translate-y-px hover:border-artdear-purple/35 hover:shadow-[var(--shadow-artdear-card-hover)]",
  "md:h-12 md:rounded-[18px] md:px-6 md:text-[14px]"
);

function HeroInquiryButtons({ className }: { className?: string }) {
  const { settings } = useSettings();
  const discordLink = externalHref(settings?.discordLink ?? "#");
  const kakaoLink = externalHref(settings?.kakaoLink ?? "#");

  return (
    <div className={className}>
      <RippleLink
        href={discordLink}
        target="_blank"
        rel="noopener noreferrer"
        className={heroInquiryButtonClass}
      >
        <DiscordIcon className="size-5 shrink-0 text-artdear-purple" />
        디스코드 문의
      </RippleLink>
      <RippleLink
        href={kakaoLink}
        target="_blank"
        rel="noopener noreferrer"
        className={heroInquiryButtonClass}
      >
        <OpenChatIcon />
        오픈채팅 문의
      </RippleLink>
    </div>
  );
}

export function Hero() {
  return (
    <FadeInSection>
      <section id="hero" className="relative isolate z-0 w-full overflow-hidden bg-background">
        <div className="relative mx-auto w-full max-w-[1400px] px-4 pt-6 pb-8 sm:px-5 sm:pt-8 md:px-6 lg:px-10 lg:pt-10 lg:pb-12">
          <div className="flex flex-col items-center md:hidden">
            <div className="w-full max-w-[420px]">
              <Image
                src={HERO_BANNER.src}
                alt="Art Deer Hero Banner"
                width={HERO_BANNER.width}
                height={HERO_BANNER.height}
                priority
                unoptimized
                className={cn(heroBannerImageClass, "mx-auto max-w-[420px]")}
                sizes="(max-width: 420px) 100vw, 420px"
              />
            </div>

            <HeroInquiryButtons className="mt-5 flex w-full max-w-[420px] flex-col items-center gap-3" />
          </div>

          <div className="relative hidden w-full overflow-hidden md:block">
            <Image
              src={HERO_BANNER.src}
              alt="Art Deer Hero Banner"
              width={HERO_BANNER.width}
              height={HERO_BANNER.height}
              priority
              unoptimized
              className={cn(heroBannerImageClass, "max-w-full")}
              sizes="(max-width: 1400px) 100vw, 1400px"
            />

            <HeroInquiryButtons
              className={cn(
                "absolute bottom-[13%] left-[5%] z-10 flex max-w-[min(100%,520px)] flex-row flex-wrap items-center gap-2.5",
                "lg:bottom-[15%] lg:max-w-[480px]"
              )}
            />
          </div>
        </div>
      </section>
    </FadeInSection>
  );
}
