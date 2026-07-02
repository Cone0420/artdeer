"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminToken } from "@/lib/admin-auth";
import type { AnalyticsStats } from "@/lib/analytics/types";

const emptyStats: AnalyticsStats = {
  visits: {
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    total: 0,
  },
  duration: {
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    total: 0,
  },
};

export function useVisitorStats() {
  const [stats, setStats] = useState<AnalyticsStats>(emptyStats);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      setReady(true);
      setError("인증이 필요합니다.");
      return;
    }

    try {
      const response = await fetch("/api/analytics/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("stats_fetch_failed");
      }

      const data = (await response.json()) as AnalyticsStats;
      setStats(data);
      setError(null);
    } catch {
      setError("방문 통계를 불러오지 못했습니다.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, ready, error, refresh };
}
