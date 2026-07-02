"use client";

import Image from "next/image";
import { useLocalImageUrl } from "@/hooks/use-local-image-url";
import { isBlobOrDataImage, isMediaUrl, isStoredImageRef } from "@/lib/local-image-store";
import { cn } from "@/lib/utils";

export function StoredImage({
  src,
  alt,
  className,
  fill,
  priority = false,
  sizes,
  objectFit = "cover",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain";
}) {
  const resolved = useLocalImageUrl(src);

  if (!resolved) return null;

  const unoptimized =
    isStoredImageRef(src) ||
    isMediaUrl(src) ||
    isBlobOrDataImage(src) ||
    resolved.startsWith("blob:") ||
    resolved.startsWith("data:") ||
    resolved.endsWith(".svg");

  const loading = priority ? undefined : ("lazy" as const);
  const fetchPriority = priority ? "high" : "auto";

  if (fill) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill
        unoptimized={unoptimized}
        priority={priority}
        loading={loading}
        fetchPriority={fetchPriority}
        sizes={sizes ?? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        className={cn(
          objectFit === "contain" ? "object-contain object-center" : "object-cover",
          className
        )}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      width={800}
      height={500}
      unoptimized={unoptimized}
      priority={priority}
      loading={loading}
      fetchPriority={fetchPriority}
      sizes={sizes}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
