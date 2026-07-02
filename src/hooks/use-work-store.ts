"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkItem } from "@/lib/work-data";
import { getWorks, WORKS_UPDATED_EVENT } from "@/lib/work-store";

export function useWorks() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setItems(await getWorks());
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const onUpdate = () => void refresh();
    window.addEventListener(WORKS_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      window.removeEventListener(WORKS_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  return { items, ready, refresh };
}
