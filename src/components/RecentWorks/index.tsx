"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { getRecentPortfolioItems } from "@/lib/portfolio-sort";
import { usePortfolioItems } from "@/hooks/use-portfolio-store";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { MotionCard, MotionGridItem } from "@/components/ui/motion-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { SectionHeading, SectionShell } from "@/components/ui/section-shell";
import { PortfolioImage } from "@/components/Portfolio/PortfolioImage";
import { PortfolioTags } from "@/components/Portfolio/PortfolioTags";
import type { PortfolioItem } from "@/components/Portfolio/portfolio-data";

const RECENT_WORKS_LIMIT = 8;

const RecentWorkCard = memo(function RecentWorkCard({
  item,
  index,
}: {
  item: PortfolioItem;
  index: number;
}) {
  return (
    <MotionGridItem index={index}>
      <Link
        href={`/portfolio/${item.id}`}
        className={cn(
          artdear.card,
          artdear.cardInteractive,
          "group block h-full overflow-hidden text-left"
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-[21px]">
          <div className={cn("absolute inset-0", artdear.imageHoverInner)}>
            <PortfolioImage
              item={item}
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          </div>
          <div className={artdear.imageHoverOverlay} />
        </div>
        <div className="px-3.5 py-3 sm:px-4 sm:py-4 md:px-5">
          <p className="truncate text-[13px] font-bold text-artdear-text sm:text-[14px] md:text-[15px]">
            {item.title}
          </p>
          <PortfolioTags tags={item.tags} className="mt-1.5 sm:mt-2" maxVisible={3} />
          <div className="mt-1.5 flex items-center justify-between gap-2 sm:mt-2">
            <p className="truncate text-[11px] font-medium text-artdear-purple sm:text-[12px]">
              {item.category}
            </p>
            <p className="shrink-0 text-[10px] text-artdear-text-light sm:text-[11px]">{item.date}</p>
          </div>
        </div>
      </Link>
    </MotionGridItem>
  );
});

export function RecentWorks() {
  const { items, ready } = usePortfolioItems();

  const recentItems = useMemo(
    () => getRecentPortfolioItems(items, RECENT_WORKS_LIMIT),
    [items]
  );

  if (ready && recentItems.length === 0) {
    return null;
  }

  return (
    <FadeInSection>
      <SectionShell className="bg-background/80">
        <SectionHeading
          title="RECENT WORKS"
          subtitle="최근 등록된 포트폴리오 작업물입니다."
        />

        <div className="grid grid-cols-1 gap-3 min-[375px]:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {!ready ? (
            Array.from({ length: RECENT_WORKS_LIMIT }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : (
            recentItems.map((item, index) => (
              <RecentWorkCard key={item.id} item={item} index={index} />
            ))
          )}
        </div>
      </SectionShell>
    </FadeInSection>
  );
}
