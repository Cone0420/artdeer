"use client";

import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { filterPortfolioItems } from "@/lib/portfolio-search";
import { resolvePortfolioCategoryFromSlug } from "@/lib/portfolio-category-slugs";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { PortfolioSearchField } from "./PortfolioSearch";
import { PortfolioImage } from "./PortfolioImage";
import { PortfolioTags } from "./PortfolioTags";
import {
  portfolioCategories,
  type PortfolioCategory,
  type PortfolioItem,
} from "./portfolio-data";
import { usePortfolioItems } from "@/hooks/use-portfolio-store";

const PAGE_SIZE = 12;

function FourPointStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"
      />
    </svg>
  );
}

const PortfolioCard = memo(function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <Link
      href={`/portfolio/${item.id}`}
      className={cn(
        artdear.card,
        artdear.cardInteractive,
        "group block w-full overflow-hidden text-left"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[21px]">
        <div className={cn("absolute inset-0", artdear.imageHoverInner)}>
          <PortfolioImage item={item} sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw" />
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
  );
});

export function Portfolio() {
  const searchParams = useSearchParams();
  const { items, ready } = usePortfolioItems();
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setSearchQuery(query);

    setActiveCategory(resolvePortfolioCategoryFromSlug(searchParams.get("category")));
  }, [searchParams]);

  const filtered = useMemo(() => {
    const searched = filterPortfolioItems(items, searchQuery);
    return searched.filter((item) => activeCategory === "all" || item.category === activeCategory);
  }, [items, activeCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <FadeInSection>
      <section className={cn(artdear.section, "bg-background")}>
        <div className={artdear.container}>
          <div className="text-center">
            <h1 className="flex items-center justify-center gap-2 text-[26px] font-bold text-artdear-text min-[375px]:text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px]">
              <FourPointStar className="size-6 text-artdear-purple sm:size-7" />
              PORTFOLIO
            </h1>
            <p className="mx-auto mt-3 max-w-lg px-2 text-[13px] leading-relaxed text-artdear-text-subtle sm:mt-4 sm:text-[14px] md:text-[15px]">
              아트디어가 제작한 게임, 방송, 커뮤니티 디자인 작업물을 확인해보세요.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-xl sm:mt-10">
            <PortfolioSearchField value={searchQuery} onChange={setSearchQuery} variant="page" />
          </div>

          <div className="mt-6 mb-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-2.5">
            {portfolioCategories.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveCategory(value)}
                className={cn(
                  artdear.btnGlow,
                  "rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-[background-color,color,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-4 sm:py-2 sm:text-[12px] md:px-5 md:text-[13px]",
                  activeCategory === value
                    ? "bg-artdear-purple text-white shadow-[0_8px_24px_-8px_rgba(139,124,255,0.35)] hover:shadow-[0_10px_28px_-10px_rgba(139,124,255,0.38)]"
                    : "bg-artdear-purple-light text-artdear-purple hover:bg-artdear-purple-light-hover hover:shadow-[var(--shadow-artdear-btn-soft)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 min-[375px]:grid-cols-2 sm:gap-4 md:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
            {!ready ? (
              <p className="col-span-full py-16 text-center text-[14px] text-artdear-text-subtle">
                불러오는 중...
              </p>
            ) : paginated.length === 0 ? (
              <p className="col-span-full py-16 text-center text-[14px] text-artdear-text-subtle">
                {hasSearchQuery ? "검색 결과가 없습니다." : "등록된 작품이 없습니다."}
              </p>
            ) : (
              paginated.map((item) => <PortfolioCard key={item.id} item={item} />)
            )}
          </div>

          {ready && filtered.length > 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4 md:mt-12">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={cn(
                  artdear.btnGlow,
                  "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-artdear-border-strong bg-artdear-card px-4 text-[12px] font-medium text-artdear-text-muted disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-auto sm:px-5 sm:text-[13px]",
                  "hover:border-artdear-purple hover:text-artdear-purple hover:shadow-[var(--shadow-artdear-btn-soft)]"
                )}
              >
                <ChevronLeft className="size-4" strokeWidth={2.2} />
                이전 페이지
              </button>

              <span className="min-w-[72px] text-center text-[13px] font-medium text-artdear-text-subtle">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className={cn(
                  artdear.btnGlow,
                  "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-artdear-border-strong bg-artdear-card px-4 text-[12px] font-medium text-artdear-text-muted disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-auto sm:px-5 sm:text-[13px]",
                  "hover:border-artdear-purple hover:text-artdear-purple hover:shadow-[var(--shadow-artdear-btn-soft)]"
                )}
              >
                다음 페이지
                <ChevronRight className="size-4" strokeWidth={2.2} />
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </FadeInSection>
  );
}
