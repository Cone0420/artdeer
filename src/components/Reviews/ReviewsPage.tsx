"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { SkeletonReviewCard } from "@/components/ui/skeleton";
import { useReviews } from "@/hooks/use-reviews-store";
import { formatReviewDisplayDate, maskReviewNickname, type ReviewItem } from "@/lib/reviews-data";
import { sortReviewsByNewest } from "@/lib/reviews-sort";
import { FourPointStar, ReviewProfile, StarRating } from "./review-ui";

const ReviewListCard = memo(function ReviewListCard({ review }: { review: ReviewItem }) {
  return (
    <Link
      href={`/reviews/${review.id}`}
      className={cn(
        artdear.card,
        artdear.cardInteractive,
        "group flex h-full flex-col p-4 sm:p-5"
      )}
    >
      <div className="flex items-start gap-3">
        <ReviewProfile reviewId={review.id} nickname={review.nickname} avatarUrl={review.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-[15px] font-bold text-artdear-text", artdear.textHoverPurple)}>
            {maskReviewNickname(review.nickname)}
          </p>
          <StarRating count={review.rating} />
        </div>
      </div>

      <p className="mt-4 line-clamp-3 flex-1 text-[14px] leading-[1.7] text-artdear-text-subtle">
        {review.text}
      </p>

      <time className="mt-4 block text-[12px] text-artdear-text-light">
        {formatReviewDisplayDate(review.date)}
      </time>
    </Link>
  );
});

export function ReviewsPage() {
  const { items: allReviews, ready } = useReviews();
  const reviews = useMemo(
    () => sortReviewsByNewest(allReviews.filter((item) => item.visible)),
    [allReviews]
  );

  return (
    <FadeInSection>
      <section className={cn(artdear.section, "bg-background")}>
        <div className={artdear.container}>
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <h1 className="flex items-center gap-2 text-[22px] font-bold tracking-wide text-artdear-text sm:text-[24px] md:text-[26px]">
              <FourPointStar className="size-5 text-artdear-purple" />
              REAL REVIEWS
            </h1>
            <p className="mt-2 text-[14px] text-artdear-text-subtle sm:text-[15px]">
              의뢰해주신 분들의 소중한 후기예요!
              {ready ? (
                <span className="ml-2 font-semibold text-artdear-purple">({reviews.length}개)</span>
              ) : null}
            </p>
          </div>

          {!ready ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonReviewCard key={i} />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-artdear-text-subtle">
              등록된 후기가 없습니다.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {reviews.map((review) => (
                <ReviewListCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </section>
    </FadeInSection>
  );
}
