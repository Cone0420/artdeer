"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function AdminToast({
  message,
  visible,
  onClose,
  className,
}: {
  message: string;
  visible: boolean;
  onClose: () => void;
  className?: string;
}) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onClose, 2800);
    return () => window.clearTimeout(timer);
  }, [visible, onClose, message]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-artdear-border-card bg-artdear-card px-5 py-3 text-[13px] font-medium text-artdear-text shadow-[0_16px_48px_-12px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      {message}
    </div>
  );
}
