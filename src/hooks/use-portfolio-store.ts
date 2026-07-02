"use client";

import { useCallback, useEffect, useState } from "react";
import type { PortfolioItem } from "@/components/Portfolio/portfolio-data";
import {
  getPortfolioItems,
  PORTFOLIO_UPDATED_EVENT,
} from "@/lib/portfolio-store";

export function usePortfolioItems() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setItems(await getPortfolioItems());
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const onUpdate = () => void refresh();
    window.addEventListener(PORTFOLIO_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      window.removeEventListener(PORTFOLIO_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  return { items, ready, refresh };
}
