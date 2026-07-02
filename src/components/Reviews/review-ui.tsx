"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { getReviewAvatarSrc } from "@/lib/review-avatars";
import { cn } from "@/lib/utils";

export { FourPointStar } from "@/components/ui/four-point-star";

export function StarRating({
  count = 5,
  size = "sm",
}: {
  count?: number;
  size?: "sm" | "md";
}) {
  const starClass = size === "md" ? "size-4" : "size-3";

  return (
    <div className="mt-1 flex items-center gap-0.5" aria-label={`${count}점`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 18 }}
        >
          <Star className={cn(starClass, "fill-artdear-purple text-artdear-purple")} strokeWidth={0} />
        </motion.span>
      ))}
    </div>
  );
}

function splitGraphemeInitial(value: string): string {
  if (!value) return "";
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segment = [...new Intl.Segmenter("ko", { granularity: "grapheme" }).segment(value)][0];
    return segment?.segment ?? "";
  }
  return [...value][0] ?? "";
}

function LetterAvatar({
  nickname,
  sizeClass,
  textClass,
}: {
  nickname: string;
  sizeClass: string;
  textClass: string;
}) {
  const initial = splitGraphemeInitial(nickname.trim()) || "?";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-artdear-purple/20 bg-artdear-purple-light font-bold text-artdear-purple",
        sizeClass,
        textClass
      )}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

export function ReviewProfile({
  reviewId,
  nickname,
  avatarUrl,
  size = "md",
}: {
  reviewId: string;
  nickname: string;
  avatarUrl?: string | null;
  size?: "sm" | "md";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = getReviewAvatarSrc(reviewId, avatarUrl);
  const sizeClass = size === "sm" ? "size-10" : "size-12";
  const textClass = size === "sm" ? "text-[13px]" : "text-[14px]";
  const pixelSize = size === "sm" ? 40 : 48;

  if (!src || imageFailed) {
    return <LetterAvatar nickname={nickname} sizeClass={sizeClass} textClass={textClass} />;
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full border border-artdear-purple/25 bg-artdear-purple-light",
        sizeClass
      )}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        width={pixelSize}
        height={pixelSize}
        className="size-full object-cover object-center"
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}
