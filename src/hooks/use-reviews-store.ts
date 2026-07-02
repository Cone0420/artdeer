"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReviewItem } from "@/lib/reviews-data";
import { getReviews, REVIEWS_UPDATED_EVENT } from "@/lib/reviews-store";

export function useReviews() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setItems(await getReviews());
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => void refresh();
    window.addEventListener(REVIEWS_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(REVIEWS_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  return { items, ready, refresh };
}
