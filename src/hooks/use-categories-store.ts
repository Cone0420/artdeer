"use client";

import { useCallback, useEffect, useState } from "react";
import type { CategoryItem } from "@/lib/categories-data";
import { CATEGORIES_UPDATED_EVENT, getCategories } from "@/lib/categories-store";

export function useCategories() {
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setItems(await getCategories());
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => void refresh();
    window.addEventListener(CATEGORIES_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(CATEGORIES_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  return { items, ready, refresh };
}
