"use client";

import { memo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { CategoryIcon } from "@/components/icons/category-icons";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { MotionCard, MotionGridItem } from "@/components/ui/motion-card";
import { SkeletonCategoryCard } from "@/components/ui/skeleton";
import { SectionHeading, SectionShell } from "@/components/ui/section-shell";
import { useCategories } from "@/hooks/use-categories-store";
import type { CategoryItem } from "@/lib/categories-data";
import { getPortfolioCategoryHref } from "@/lib/portfolio-category-slugs";
import styles from "./Categories.module.css";

const CategoryCard = memo(function CategoryCard({
  category,
  index,
}: {
  category: CategoryItem;
  index: number;
}) {
  const href = getPortfolioCategoryHref({
    portfolioSlug: category.portfolioSlug,
    viewAll: category.viewAll,
    icon: category.icon,
  });

  return (
    <MotionGridItem index={index} className="min-w-0">
      <Link href={href} className="block h-full">
        <MotionCard
          delay={index * 0.06}
          style={{ backgroundColor: "#faf8ff" }}
          className={cn(
            styles.card,
            "category-portfolio-card group mx-auto flex w-full flex-col",
            "rounded-[20px] border border-artdear-border-card px-2 pb-2.5 pt-1.5",
            "shadow-[var(--shadow-artdear-card)]"
          )}
        >
          <div className={cn(styles.cardMedia, "relative flex w-full shrink-0 items-center justify-center")}>
            <CategoryIcon icon={category.icon} />
          </div>

          <div className="mt-1.5 flex shrink-0 flex-col items-center justify-center gap-0.5 text-center">
            <h3 className={cn("w-full truncate text-[12px] font-bold leading-tight text-artdear-text sm:text-[13px]", artdear.textHoverPurple)}>
              {category.title}
            </h3>
            <p className="w-full truncate text-[9px] font-medium tracking-[0.08em] text-artdear-text-light sm:text-[10px]">
              {category.subtitle}
            </p>
          </div>
        </MotionCard>
      </Link>
    </MotionGridItem>
  );
});

export function Categories() {
  const { items, ready } = useCategories();

  return (
    <FadeInSection>
      <SectionShell id="portfolio" className={cn("bg-background/80", styles.section)}>
        <SectionHeading
          title="DESIGN PORTFOLIO"
          linkHref="/portfolio"
          linkLabel="전체 보기"
        />

        <div className={styles.gridWrapper}>
          <div className={styles.grid}>
          {!ready ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCategoryCard key={i} />
            ))
          ) : items.length === 0 ? (
            <p className="col-span-full py-12 text-center text-[14px] text-artdear-text-subtle">
              등록된 카테고리가 없습니다.
            </p>
          ) : (
            items.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))
          )}
          </div>
        </div>
      </SectionShell>
    </FadeInSection>
  );
}
