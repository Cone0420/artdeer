"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { DiscordIcon, OpenChatIcon } from "@/components/icons/brand-icons";
import { PriceCategoryIcon } from "@/components/icons/category-icons";
import type { CategoryIconId } from "@/lib/categories-data";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { AnimatedPrice } from "@/components/ui/count-up";
import { MotionCard, MotionGridItem } from "@/components/ui/motion-card";
import { RippleLink } from "@/components/ui/ripple-button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { SectionHeading, SectionShell } from "@/components/ui/section-shell";
import { usePriceListItems } from "@/hooks/use-price-store";
import { useSettings } from "@/hooks/use-settings-store";
import { externalHref } from "@/lib/settings-data";

const PriceCard = memo(function PriceCard({
  title,
  subtitle,
  icon,
  features,
  price,
  buttonsEnabled,
  discordLink,
  kakaoLink,
  index,
}: {
  title: string;
  subtitle: string;
  icon: CategoryIconId;
  features: string[];
  price: string;
  buttonsEnabled: boolean;
  discordLink: string;
  kakaoLink: string;
  index: number;
}) {
  return (
    <MotionGridItem index={index}>
      <MotionCard
        delay={index * 0.05}
        interactive={false}
        className="flex flex-col p-3 transition-none sm:p-4 md:p-5"
      >
        <div className="text-center">
          <h3 className="text-[13px] font-bold text-artdear-purple sm:text-[14px] md:text-[15px] lg:text-[16px]">
            {title}
          </h3>
          <p className="mt-0.5 text-[10px] font-medium tracking-[0.1em] text-artdear-text-light sm:mt-1 sm:text-[11px]">
            {subtitle}
          </p>
          <p className="mt-1.5 text-[12px] font-bold text-artdear-text sm:mt-2 sm:text-[13px] md:text-[14px]">
            <AnimatedPrice value={price} />
          </p>
        </div>

        <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-[12px] bg-[#faf8ff] ring-1 ring-artdear-border-card/80 sm:mt-4 sm:rounded-[14px] md:rounded-[16px]">
          <div className="absolute inset-0">
            <PriceCategoryIcon icon={icon} />
          </div>
        </div>

        <ul className="mt-3 flex-1 space-y-1.5 sm:mt-4 sm:space-y-2">
          {features.map((line, lineIndex) => (
            <li
              key={`${line}-${lineIndex}`}
              className="flex items-start gap-1.5 text-[11px] leading-snug text-artdear-text-subtle sm:gap-2 sm:text-[12px] md:text-[13px]"
            >
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-artdear-purple" />
              {line}
            </li>
          ))}
        </ul>

        {buttonsEnabled ? (
          <div className="mt-3 grid grid-cols-1 gap-2 min-[375px]:grid-cols-2 sm:mt-4 sm:gap-2.5">
            <RippleLink
              href={discordLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(artdear.btnCard, "px-3 text-[9px] sm:px-3.5 sm:text-[10px]")}
            >
              <DiscordIcon className="size-3.5 shrink-0" />
              <span className="truncate">디스코드 문의</span>
            </RippleLink>
            <RippleLink
              href={kakaoLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(artdear.btnCard, "px-3 text-[9px] sm:px-3.5 sm:text-[10px]")}
            >
              <OpenChatIcon />
              <span className="truncate">오픈채팅 문의</span>
            </RippleLink>
          </div>
        ) : null}
      </MotionCard>
    </MotionGridItem>
  );
});

export function PriceList() {
  const { items, ready } = usePriceListItems();
  const { settings } = useSettings();
  const discordLink = externalHref(settings?.discordLink ?? "#");
  const kakaoLink = externalHref(settings?.kakaoLink ?? "#");

  return (
    <FadeInSection>
      <SectionShell id="price" className="bg-background/80">
        <SectionHeading
          title="PRICE LIST"
          subtitle="각 디자인별 가격을 확인해보세요!"
        />

        <div className="grid grid-cols-1 gap-3 min-[375px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-6">
          {!ready ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            items.map((item, index) => (
              <PriceCard
                key={item.categoryId}
                index={index}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                features={item.features}
                price={item.price}
                buttonsEnabled={item.buttonsEnabled}
                discordLink={discordLink}
                kakaoLink={kakaoLink}
              />
            ))
          )}
        </div>
      </SectionShell>
    </FadeInSection>
  );
}
