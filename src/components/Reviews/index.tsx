"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { FadeInSection } from "@/components/ui/fade-in-section";
import { CountUp } from "@/components/ui/count-up";
import { SkeletonReviewCard } from "@/components/ui/skeleton";
import { useReviews } from "@/hooks/use-reviews-store";
import { formatReviewDisplayDate, maskReviewNickname, type ReviewItem } from "@/lib/reviews-data";
import { sortReviewsByNewest } from "@/lib/reviews-sort";
import { ReviewProfile, StarRating } from "./review-ui";
import { SectionTitleIcon } from "@/components/ui/section-title-icon";
import { ReviewsMarquee } from "./ReviewsMarquee";

const REVIEW_CARD_CLASS =
  "w-[min(85vw,300px)] shrink-0 sm:w-[300px] md:w-[320px] lg:w-[340px]";

const ReviewCard = memo(function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <Link
      href={`/reviews/${review.id}`}
      className={cn(
        artdear.card,
        artdear.cardInteractive,
        "group flex h-full min-h-[248px] min-w-0 flex-col p-3.5 transition-[transform,box-shadow,border-color] duration-[350ms] ease-in-out sm:min-h-[268px] sm:p-4 md:p-5"
      )}
    >
      <div className="flex items-start gap-3">
        <ReviewProfile reviewId={review.id} nickname={review.nickname} avatarUrl={review.avatarUrl} />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-bold text-artdear-text">
            {maskReviewNickname(review.nickname)}
          </span>
          <StarRating count={review.rating} />
        </div>
      </div>

      <p className="mt-3 min-h-[7.5rem] flex-1 line-clamp-6 text-[13px] leading-[1.65] text-artdear-text-subtle sm:min-h-[8rem] sm:line-clamp-7">
        {review.text}
      </p>

      <time className="mt-4 block text-[12px] text-artdear-text-light">
        {formatReviewDisplayDate(review.date)}
      </time>
    </Link>
  );
});

export function Reviews() {
  const { items: allReviews, ready } = useReviews();
  const reviews = useMemo(
    () => sortReviewsByNewest(allReviews.filter((item) => item.visible)),
    [allReviews]
  );

  return (
    <FadeInSection>
      <section id="reviews" className="bg-background/80 px-4 py-14 transition-colors duration-300 sm:px-5 sm:py-16 md:px-6 md:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between lg:mb-12">
          <div>
            <h2 className="flex items-center gap-2.5 text-[18px] font-bold tracking-wide text-artdear-text md:text-[20px]">
              <SectionTitleIcon />
              REAL REVIEWS
            </h2>
            <p className="mt-2 text-[14px] text-artdear-text-subtle">
              의뢰해주신 분들의 소중한 후기예요!
              {ready ? (
                <span className="ml-2 font-semibold text-artdear-purple">
                  (<CountUp to={reviews.length} suffix="개" />)
                </span>
              ) : null}
            </p>
          </div>
          <Link href="/reviews" className={artdear.sectionLink}>
            후기 더 보기
            <ArrowRight className={artdear.sectionLinkIcon} />
          </Link>
        </div>

        <div className="relative">
            {!ready ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonReviewCard key={i} />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="py-12 text-center text-[14px] text-artdear-text-subtle">
                등록된 후기가 없습니다.
              </p>
            ) : (
              <ReviewsMarquee
                reviews={reviews}
                cardClassName={REVIEW_CARD_CLASS}
                renderCard={(review) => <ReviewCard review={review} />}
              />
            )}
        </div>
      </div>
    </section>
    </FadeInSection>
  );
}
