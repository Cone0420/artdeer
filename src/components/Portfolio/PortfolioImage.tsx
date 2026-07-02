"use client";

import type { PortfolioImagePreset, PortfolioItem } from "./portfolio-data";
import { PortfolioThumbnail } from "./PortfolioThumbnail";
import { StoredImage } from "@/components/ui/stored-image";
import { cn } from "@/lib/utils";

export function PortfolioImage({
  item,
  className,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fit = "cover",
}: {
  item: PortfolioItem;
  className?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  fit?: "cover" | "contain";
}) {
  const imageAlt = alt ?? item.title;

  if (item.imageUrl) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        <StoredImage
          src={item.imageUrl}
          alt={imageAlt}
          fill
          priority={priority}
          sizes={sizes}
          objectFit={fit}
        />
      </div>
    );
  }

  const preset: PortfolioImagePreset = item.image ?? "purple-girl";
  return (
    <PortfolioThumbnail
      type={preset}
      className={cn("h-full w-full", fit === "contain" && "object-contain object-center", className)}
    />
  );
}
