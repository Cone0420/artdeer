"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DeerLogoIcon } from "@/components/icons/brand-icons";

const LOADING_SEEN_KEY = "artdear-loading-seen";
const LOADING_DURATION_MS = 2000;

function FourPointStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"
      />
    </svg>
  );
}

function LoadingScreenOverlay() {
  return (
    <motion.div
      key="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-background"
      role="status"
      aria-live="polite"
      aria-label="페이지 로딩 중"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute top-[18%] left-[12%] h-56 w-56 rounded-full bg-artdear-purple/20 blur-[80px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[10%] bottom-[20%] h-48 w-48 rounded-full bg-artdear-purple/15 blur-[70px]"
          animate={{ scale: [1.05, 0.92, 1.05], x: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        aria-hidden
        animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute top-[22%] left-[18%] text-artdear-purple/30"
      >
        <FourPointStar className="size-4" />
      </motion.div>
      <motion.div
        aria-hidden
        animate={{ y: [0, 6, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-[28%] right-[20%] text-artdear-purple/25"
      >
        <FourPointStar className="size-3" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="relative"
        >
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-artdear-purple/25 blur-xl"
          />
          <DeerLogoIcon className="relative size-20 sm:size-24" />
        </motion.div>

        <div className="mt-6 text-center">
          <p className="text-[13px] font-semibold tracking-[0.18em] text-artdear-purple-muted">
            ART DEER
          </p>
          <motion.p
            className="mt-3 text-[15px] font-medium text-artdear-text-subtle sm:text-[16px]"
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            Loading...
          </motion.p>
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 px-8 pb-10 sm:px-12 sm:pb-12">
        <div className="mx-auto w-full max-w-[280px]">
          <div className="h-1.5 overflow-hidden rounded-full bg-artdear-purple-light/80">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: LOADING_DURATION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-artdear-purple via-[#9d8fff] to-artdear-purple shadow-[0_0_16px_rgba(139,124,255,0.45)]"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-3 text-center text-[11px] font-medium tracking-[0.08em] text-artdear-text-light"
          >
            GAME GRAPHIC DESIGN STUDIO
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

export function InitialLoadingProvider({ children }: { children: React.ReactNode }) {
  const [showLoading, setShowLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      if (sessionStorage.getItem(LOADING_SEEN_KEY)) return;
    } catch {
      return;
    }

    setShowLoading(true);

    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(LOADING_SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      setShowLoading(false);
    }, LOADING_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {children}
      <AnimatePresence mode="wait">
        {mounted && showLoading ? <LoadingScreenOverlay /> : null}
      </AnimatePresence>
    </>
  );
}
