"use client";

import Link from "next/link";
import { useMemo } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { externalHref } from "@/lib/settings-data";
import { useSettings } from "@/hooks/use-settings-store";
import { usePortfolioItems } from "@/hooks/use-portfolio-store";
import { getPortfolioNeighbors } from "@/lib/portfolio-sort";
import type { PortfolioItem } from "./portfolio-data";
import { PortfolioImage } from "./PortfolioImage";
import { PortfolioTags } from "./PortfolioTags";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { RippleLink } from "@/components/ui/ripple-button";
import { DiscordIcon, OpenChatIcon } from "@/components/icons/brand-icons";
import { FourPointStar } from "@/components/ui/four-point-star";
import { SectionTitleIcon } from "@/components/ui/section-title-icon";

function NavWorkCard({
  item,
  label,
  direction,
}: {
  item: PortfolioItem;
  label: string;
  direction: "prev" | "next";
}) {
  return (
    <Link
      href={`/portfolio/${item.id}`}
      className={cn(
        artdear.card,
        artdear.cardInteractive,
        "group flex flex-1 items-center gap-3 overflow-hidden p-3 sm:gap-4 sm:p-4"
      )}
    >
      {direction === "prev" ? (
        <ArrowLeft className="size-4 shrink-0 text-artdear-purple sm:size-5" />
      ) : null}
      <div className="relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-[12px] sm:w-20">
        <div className={cn("absolute inset-0", artdear.imageHoverInner)}>
          <PortfolioImage item={item} sizes="80px" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-artdear-text-light sm:text-[11px]">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[13px] font-bold text-artdear-text sm:text-[14px]">
          {item.title}
        </p>
      </div>
      {direction === "next" ? (
        <ArrowRight className="size-4 shrink-0 text-artdear-purple sm:size-5" />
      ) : null}
    </Link>
  );
}

function RecommendCard({ item }: { item: PortfolioItem }) {
  return (
    <Link
      href={`/portfolio/${item.id}`}
      className={cn(
        artdear.card,
        artdear.cardInteractive,
        "group overflow-hidden"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className={cn("absolute inset-0", artdear.imageHoverInner)}>
          <PortfolioImage item={item} sizes="(max-width: 640px) 50vw, 25vw" />
        </div>
      </div>
      <div className="p-3.5 sm:p-4">
        <p className="truncate text-[13px] font-bold text-artdear-text sm:text-[14px]">{item.title}</p>
        <p className="mt-1 text-[11px] font-medium text-artdear-purple sm:text-[12px]">{item.category}</p>
      </div>
    </Link>
  );
}

export function PortfolioDetail({ id }: { id: string }) {
  const { items, ready } = usePortfolioItems();
  const { settings } = useSettings();

  const discordLink = externalHref(settings?.discordLink ?? "#");
  const kakaoLink = externalHref(settings?.kakaoLink ?? "#");

  const { item, prev: prevItem, next: nextItem } = useMemo(
    () => getPortfolioNeighbors(items, id),
    [items, id]
  );

  const recommended = useMemo(() => {
    if (!item) return [];
    return items
      .filter((candidate) => candidate.id !== item.id && candidate.category === item.category)
      .slice(0, 3);
  }, [items, item]);

  if (ready && !item) {
    notFound();
  }

  if (!item) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-artdear-purple border-t-transparent" />
      </div>
    );
  }

  return (
    <FadeInSection>
      <article className={cn(artdear.section, "bg-background")}>
        <div className={artdear.container}>
          <Link
            href="/portfolio"
            className={cn(artdear.sectionLink, "mb-6 sm:mb-8")}
          >
            <ChevronLeft className={artdear.sectionLinkBackIcon} />
            포트폴리오 목록
          </Link>

          <div className="mx-auto w-full max-w-4xl">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] border border-artdear-border-card bg-artdear-panel shadow-[var(--shadow-artdear-card-hover)] sm:rounded-[22px]">
              <PortfolioImage
                item={item}
                priority
                fit="contain"
                sizes="(max-width: 896px) 100vw, 896px"
                alt={item.title}
              />
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-3xl sm:mt-10 lg:mt-12">
            <span className="inline-flex rounded-full bg-artdear-purple-light px-3 py-1 text-[12px] font-medium text-artdear-purple">
              {item.category}
            </span>
            <h1 className="mt-4 flex items-start gap-2 text-[26px] font-bold leading-tight text-artdear-text sm:text-[32px] lg:text-[36px]">
              <FourPointStar className="mt-2 size-5 shrink-0 text-artdear-purple sm:size-6" />
              {item.title}
            </h1>
            <PortfolioTags tags={item.tags} className="mt-3" size="md" />
            <p className="mt-5 text-[14px] leading-[1.85] text-artdear-text-subtle sm:text-[15px] lg:text-[16px]">
              {item.description}
            </p>

            <dl className="mt-8 border-y border-artdear-border-card py-6">
              <div>
                <dt className="text-[12px] font-semibold tracking-[0.08em] text-artdear-text-light">
                  작업일
                </dt>
                <dd className="mt-1.5 text-[14px] font-semibold text-artdear-text sm:text-[15px]">
                  {item.date}
                </dd>
              </div>
            </dl>
          </div>

          {(prevItem || nextItem) && (
            <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:gap-4">
              {prevItem ? (
                <NavWorkCard item={prevItem} label="이전 작품" direction="prev" />
              ) : (
                <div className="hidden flex-1 sm:block" />
              )}
              {nextItem ? (
                <NavWorkCard item={nextItem} label="다음 작품" direction="next" />
              ) : null}
            </div>
          )}

          {recommended.length > 0 ? (
            <section className="mt-12 sm:mt-14">
              <h2 className={artdear.sectionTitle}>
                <SectionTitleIcon />
                추천 작품
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-3 min-[375px]:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:gap-5">
                {recommended.map((work) => (
                  <RecommendCard key={work.id} item={work} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-12 sm:mt-14">
            <div
              className={cn(
                artdear.panel,
                artdear.glass,
                "mx-auto max-w-2xl p-6 text-center sm:p-8"
              )}
            >
              <h2 className="text-[18px] font-bold text-artdear-text sm:text-[20px]">
                이 작업물이 마음에 드셨나요?
              </h2>
              <p className="mt-2 text-[13px] text-artdear-text-subtle sm:text-[14px]">
                편하신 방법으로 문의해주세요!
              </p>
              <div className="mt-6 flex flex-col gap-2.5 min-[375px]:flex-row min-[375px]:justify-center sm:gap-3">
                <RippleLink
                  href={discordLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(artdear.btnPrimary, artdear.btnPrimaryLg, "w-full min-[375px]:w-auto")}
                >
                  <DiscordIcon className="size-4" />
                  디스코드 문의
                </RippleLink>
                <RippleLink
                  href={kakaoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(artdear.btnSecondary, "h-11 w-full px-5 text-[14px] min-[375px]:w-auto sm:h-12")}
                >
                  <OpenChatIcon />
                  오픈채팅 문의
                </RippleLink>
              </div>
            </div>
          </section>
        </div>
      </article>
    </FadeInSection>
  );
}
