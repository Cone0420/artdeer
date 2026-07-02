import Image from "next/image";
import type { CategoryIconId } from "@/lib/categories-data";
import { cn } from "@/lib/utils";

const categoryIllustrationMap: Record<CategoryIconId, string> = {
  "game-poster": "/images/categories/game-poster.png",
  "youtube-design": "/images/categories/youtube-design.png",
  "channel-art": "/images/categories/photo-gallery.png",
  "photo-gallery": "/images/categories/photo-gallery.png",
  "guild-mark": "/images/categories/guild-mark.png",
  "character-design": "/images/categories/character-design.png",
  "etc-design": "/images/categories/etc-design.png",
};

const illustrationSizes = "220px";

/** Per-illustration visual scale (transparent padding differs between assets). */
const categoryVisualScale: Record<CategoryIconId, number> = {
  "game-poster": 1.2,
  "youtube-design": 1.2,
  "photo-gallery": 1.2,
  "channel-art": 1.2,
  "guild-mark": 1.2,
  "character-design": 1.12,
  "etc-design": 1.12,
};

const priceListVisualScale: Record<CategoryIconId, number> = {
  "game-poster": 0.91,
  "youtube-design": 0.92,
  "photo-gallery": 0.89,
  "channel-art": 0.89,
  "guild-mark": 0.94,
  "character-design": 0.94,
  "etc-design": 0.95,
};

export function CategoryIcon({ icon }: { icon: CategoryIconId }) {
  const src = categoryIllustrationMap[icon] ?? categoryIllustrationMap["etc-design"];
  const visualScale = categoryVisualScale[icon] ?? 1.2;

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ transform: `scale(${visualScale})`, transformOrigin: "center center" }}
    >
      <Image
        src={src}
        alt=""
        width={220}
        height={220}
        sizes={illustrationSizes}
        unoptimized
        className="h-full w-full object-contain object-center"
        priority={false}
      />
    </div>
  );
}

/** PRICE LIST — fit-safe sizing (object-contain, no transform clipping). */
export function PriceCategoryIcon({ icon }: { icon: CategoryIconId }) {
  const src = categoryIllustrationMap[icon] ?? categoryIllustrationMap["etc-design"];
  const size = priceListVisualScale[icon] ?? 0.9;
  const dimension = `${size * 100}%`;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <Image
          src={src}
          alt=""
          fill
          sizes={illustrationSizes}
          unoptimized
          className="object-contain object-center"
          priority={false}
        />
      </div>
    </div>
  );
}

export function CategoryIconPreview({ icon, className }: { icon: CategoryIconId; className?: string }) {
  const src = categoryIllustrationMap[icon] ?? categoryIllustrationMap["etc-design"];

  return (
    <div className={cn("relative flex h-24 w-24 items-center justify-center", className)}>
      <Image src={src} alt="" width={96} height={96} sizes="96px" unoptimized className="h-full w-full object-contain object-center" />
    </div>
  );
}
