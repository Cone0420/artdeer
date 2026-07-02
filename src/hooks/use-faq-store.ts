"use client";

import { useCallback, useEffect, useState } from "react";
import type { FaqItem } from "@/lib/faq-data";
import { FAQ_UPDATED_EVENT, getFaqItems } from "@/lib/faq-store";

export function useFaqItems() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setItems(await getFaqItems());
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => void refresh();
    window.addEventListener(FAQ_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(FAQ_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  return { items, ready, refresh };
}
