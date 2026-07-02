"use client";

import { useCallback, useEffect, useState } from "react";
import type { PriceListItem } from "@/lib/price-data";
import { CATEGORIES_UPDATED_EVENT } from "@/lib/categories-store";
import { getPriceListItems, PRICE_UPDATED_EVENT } from "@/lib/price-store";

export function usePriceListItems() {
  const [items, setItems] = useState<PriceListItem[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setItems(await getPriceListItems());
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => void refresh();
    window.addEventListener(PRICE_UPDATED_EVENT, onUpdate);
    window.addEventListener(CATEGORIES_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(PRICE_UPDATED_EVENT, onUpdate);
      window.removeEventListener(CATEGORIES_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  return { items, ready, refresh };
}

/** @deprecated use usePriceListItems */
export function usePriceItems() {
  return usePriceListItems();
}
