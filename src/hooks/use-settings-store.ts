"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/settings-data";
import { getSettings, SETTINGS_UPDATED_EVENT } from "@/lib/settings-store";

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setSettings(await getSettings());
    } catch {
      setSettings(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onUpdate = () => void refresh();
    window.addEventListener(SETTINGS_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  return { settings, ready, refresh };
}
