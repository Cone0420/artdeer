"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

const DECO_ITEMS = [
  { type: "star", top: "8%", left: "5%", size: 14, rotate: 12 },
  { type: "heart", top: "15%", left: "18%", size: 16, rotate: -8 },
  { type: "star", top: "22%", left: "82%", size: 12, rotate: 20 },
  { type: "bandaid", top: "35%", left: "92%", size: 22, rotate: 15 },
  { type: "heart", top: "42%", left: "8%", size: 14, rotate: 6 },
  { type: "star", top: "55%", left: "72%", size: 18, rotate: -12 },
  { type: "sparkle", top: "62%", left: "28%", size: 16, rotate: 0 },
  { type: "star", top: "70%", left: "48%", size: 10, rotate: 45 },
  { type: "heart", top: "78%", left: "88%", size: 12, rotate: -15 },
  { type: "bandaid", top: "85%", left: "12%", size: 20, rotate: -20 },
  { type: "star", top: "12%", left: "55%", size: 11, rotate: 8 },
  { type: "sparkle", top: "48%", left: "38%", size: 14, rotate: 0 },
  { type: "heart", top: "88%", left: "62%", size: 15, rotate: 10 },
  { type: "star", top: "30%", left: "35%", size: 9, rotate: -25 },
  { type: "bandaid", top: "52%", left: "58%", size: 18, rotate: 8 },
] as const;

function FourPointStar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"
      />
    </svg>
  );
}

function BandAidIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect
        x="4"
        y="12"
        width="24"
        height="12"
        rx="3"
        fill="currentColor"
        transform="rotate(-24 16 18)"
      />
    </svg>
  );
}

export const PageBackground = memo(function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute top-20 left-[10%] h-[520px] w-[520px] rounded-full bg-artdear-purple/20 blur-[100px] sm:top-24 lg:top-[5.5rem]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[35%] -right-[10%] h-[480px] w-[480px] rounded-full bg-artdear-purple/15 blur-[90px]"
        animate={{ x: [0, -35, 0], y: [0, -25, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[5%] left-[30%] h-[400px] w-[400px] rounded-full bg-artdear-purple/10 blur-[80px]"
        animate={{ x: [0, 25, 0], y: [0, -20, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 0.5 }}
      />

      {DECO_ITEMS.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-artdear-purple"
          style={{
            top: item.top,
            left: item.left,
            opacity: "var(--artdear-deco-opacity)",
            transform: `rotate(${item.rotate}deg)`,
          }}
          animate={{ y: [0, i % 2 === 0 ? -8 : 8, 0], opacity: [0.12, 0.2, 0.12] }}
          transition={{ repeat: Infinity, duration: 4 + (i % 5), ease: "easeInOut", delay: i * 0.15 }}
        >
          {item.type === "star" ? (
            <FourPointStar size={item.size} />
          ) : item.type === "heart" ? (
            <Heart
              className="fill-artdear-purple/20 stroke-artdear-purple"
              style={{ width: item.size, height: item.size }}
              strokeWidth={1.5}
            />
          ) : item.type === "sparkle" ? (
            <Sparkles style={{ width: item.size, height: item.size }} strokeWidth={1.5} />
          ) : (
            <BandAidIcon size={item.size} />
          )}
        </motion.div>
      ))}
    </div>
  );
});
