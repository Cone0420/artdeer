"use client";

import { useEffect, useRef } from "react";

type VisitResponse = {
  visitId?: number;
};

function sendDuration(visitId: number, durationSeconds: number) {
  const payload = JSON.stringify({ visitId, durationSeconds });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/leave", blob);
    return;
  }

  fetch("/api/analytics/leave", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

export function VisitorTracker() {
  const visitIdRef = useRef<number | null>(null);
  const enteredAtRef = useRef<number>(Date.now());
  const lastSentDurationRef = useRef(0);

  useEffect(() => {
    enteredAtRef.current = Date.now();
    lastSentDurationRef.current = 0;

    fetch("/api/analytics/visit", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/" }),
    })
      .then((response) => response.json())
      .then((data: VisitResponse) => {
        if (typeof data.visitId === "number") {
          visitIdRef.current = data.visitId;
        }
      })
      .catch(() => undefined);

    const flushDuration = () => {
      const visitId = visitIdRef.current;
      if (!visitId) return;

      const durationSeconds = Math.round((Date.now() - enteredAtRef.current) / 1000);
      if (durationSeconds <= 0 || durationSeconds <= lastSentDurationRef.current) return;

      lastSentDurationRef.current = durationSeconds;
      sendDuration(visitId, durationSeconds);
    };

    const handlePageHide = () => flushDuration();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushDuration();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      flushDuration();
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
