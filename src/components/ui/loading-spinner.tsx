"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  label = "불러오는 중...",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-14", className)}>
      <div className="relative size-12">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-artdear-purple/20"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-artdear-purple border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-[6px] rounded-full bg-artdear-purple/10"
          animate={{ scale: [0.85, 1, 0.85] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        />
      </div>
      <motion.p
        className="text-[13px] font-medium text-artdear-text-subtle"
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
      >
        {label}
      </motion.p>
    </div>
  );
}
