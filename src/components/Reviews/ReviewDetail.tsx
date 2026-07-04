"use client";

import Link from "next/link";
import { useMemo } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { useReviews } from "@/hooks/use-reviews-store";
import { getReviewNeighbors } from "@/lib/reviews-sort";
import { formatReviewDisplayDate, maskReviewNickname, type ReviewItem } from "@/lib/reviews-data";
import { FourPointStar, ReviewProfile, StarRating } from "./review-ui";

function NavReviewCard({
  item,
  label,
  direction,
}: {
  item: ReviewItem;
  label: string;
  direction: "prev" | "next";
}) {
  return (
    <Link
      href={`/reviews/${item.id}`}
      className={cn(
        artdear.card,
        artdear.cardInteractive,
        "group flex flex-1 items-center gap-3 overflow-hidden p-3 sm:gap-4 sm:p-4"
      )}
    >
      {direction === "prev" ? (
        <ArrowLeft className="size-4 shrink-0 text-artdear-purple sm:size-5" />
      ) : null}
      <ReviewProfile reviewId={item.id} nickname={item.nickname} avatarUrl={item.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-artdear-text-light sm:text-[11px]">
          {label}
        </p>
        <p className={cn("mt-0.5 truncate text-[13px] font-bold text-artdear-text sm:text-[14px]", artdear.textHoverPurple)}>
          {maskReviewNickname(item.nickname)}
        </p>
        <p className="mt-1 line-clamp-1 text-[12px] text-artdear-text-subtle">{item.text}</p>
      </div>
      {direction === "next" ? (
        <ArrowRight className="size-4 shrink-0 text-artdear-purple sm:size-5" />
      ) : null}
    </Link>
  );
}

export function ReviewDetail({
  id,
  initialItem,
}: {
  id: string;
  initialItem?: ReviewItem;
}) {
  const { items, ready } = useReviews();

  const item = useMemo(() => {
    return items.find((candidate) => candidate.id === id) ?? initialItem ?? null;
  }, [items, id, initialItem]);

  const { prev: prevItem, next: nextItem } = useMemo(
    () => getReviewNeighbors(items.length > 0 ? items : initialItem ? [initialItem] : [], id),
    [items, id, initialItem]
  );

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
            href="/reviews"
            className={cn(artdear.sectionLink, "mb-6 sm:mb-8")}
          >
            <ChevronLeft className={artdear.sectionLinkBackIcon} />
            후기 목록
          </Link>

          <div className="mx-auto max-w-3xl">
            <div
              className={cn(
                artdear.card,
                "p-6 sm:p-8 lg:p-10",
                "shadow-[0_8px_32px_-12px_rgba(139,124,255,0.12)]"
              )}
            >
              <div className="flex items-start gap-4">
                <ReviewProfile reviewId={item.id} nickname={item.nickname} avatarUrl={item.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <h1 className="flex items-center gap-2 text-[22px] font-bold text-artdear-text sm:text-[26px]">
                    <FourPointStar className="size-4 shrink-0 text-artdear-purple sm:size-5" />
                    {maskReviewNickname(item.nickname)}
                  </h1>
                  <StarRating count={item.rating} size="md" />
                  <time className="mt-2 block text-[13px] text-artdear-text-light">
                    {formatReviewDisplayDate(item.date)}
                  </time>
                </div>
              </div>

              <p className="mt-8 whitespace-pre-line text-[15px] leading-[1.85] text-artdear-text-subtle sm:text-[16px]">
                {item.text}
              </p>
            </div>
          </div>

          {(prevItem || nextItem) && (
            <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 sm:mt-12 sm:flex-row sm:gap-4">
              {prevItem ? (
                <NavReviewCard item={prevItem} label="이전 후기" direction="prev" />
              ) : (
                <div className="hidden flex-1 sm:block" />
              )}
              {nextItem ? (
                <NavReviewCard item={nextItem} label="다음 후기" direction="next" />
              ) : null}
            </div>
          )}
        </div>
      </article>
    </FadeInSection>
  );
}
