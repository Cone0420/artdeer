"use client";

import { useEffect, useState } from "react";
import { resolveImageSrc } from "@/lib/local-image-store";

export function useLocalImageUrl(value: string | null | undefined) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!value) {
      setSrc("");
      return;
    }

    setSrc(resolveImageSrc(value));
  }, [value]);

  return src;
}
