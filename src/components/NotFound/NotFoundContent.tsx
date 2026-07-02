"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { PageBackground } from "@/components/ui/page-background";

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

function NotFoundIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[320px] sm:max-w-[380px]"
    >
      <motion.div
        aria-hidden
        animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute -top-3 left-4 text-artdear-purple/35"
      >
        <FourPointStar className="size-5" />
      </motion.div>
      <motion.div
        aria-hidden
        animate={{ y: [0, 6, 0], scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.4 }}
        className="absolute top-8 right-2 text-artdear-purple/30"
      >
        <Sparkles className="size-5" />
      </motion.div>
      <motion.div
        aria-hidden
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.8 }}
        className="absolute right-10 bottom-6 text-[28px]"
      >
        ?
      </motion.div>

      <div className="glass relative overflow-hidden rounded-[24px] border p-6 shadow-[var(--shadow-artdear-card-hover)] sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,124,255,0.18),transparent_60%)]"
        />

        <svg
          viewBox="0 0 320 260"
          role="img"
          aria-label="길을 잃은 아트디어 사슴 일러스트"
          className="relative mx-auto h-auto w-full"
        >
          <ellipse cx="160" cy="228" rx="92" ry="16" fill="#8B7CFF" opacity="0.18" />
          <text
            x="160"
            y="58"
            textAnchor="middle"
            fill="#8B7CFF"
            fontSize="52"
            fontWeight="900"
            opacity="0.22"
          >
            404
          </text>

          <g transform="translate(160 150)">
            <ellipse cx="0" cy="52" rx="46" ry="54" fill="#EDE9FF" />
            <ellipse cx="0" cy="58" rx="38" ry="44" fill="#F5F3FF" />

            <path
              d="M-34 -8 L-42 -38 M0 -18 L0 -52 M34 -8 L42 -38"
              stroke="#8B7CFF"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="-42" cy="-38" r="5" fill="#C4B5FD" />
            <circle cx="42" cy="-38" r="5" fill="#C4B5FD" />

            <ellipse cx="0" cy="8" rx="34" ry="30" fill="#EDE9FF" />
            <circle cx="-12" cy="2" r="5" fill="#333" />
            <circle cx="12" cy="2" r="5" fill="#333" />
            <circle cx="-10" cy="0" r="1.8" fill="white" />
            <circle cx="14" cy="0" r="1.8" fill="white" />
            <path
              d="M-8 16 Q0 24 8 16"
              stroke="#555"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />

            <ellipse cx="0" cy="30" rx="8" ry="6" fill="#C4B5FD" opacity="0.55" />

            <g transform="translate(48 -10) rotate(18)">
              <rect x="-24" y="-16" width="48" height="58" rx="8" fill="#fff" stroke="#C4B5FD" strokeWidth="3" />
              <path d="M-16 -2 H16 M-16 10 H10 M-16 22 H14" stroke="#8B7CFF" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
              <text x="0" y="8" textAnchor="middle" fill="#8B7CFF" fontSize="16" fontWeight="800" transform="rotate(180 0 8)">
                ?
              </text>
            </g>

            <ellipse cx="-34" cy="18" rx="10" ry="7" fill="#EDE9FF" stroke="#C4B5FD" strokeWidth="2" />
            <ellipse cx="34" cy="18" rx="10" ry="7" fill="#EDE9FF" stroke="#C4B5FD" strokeWidth="2" />
          </g>

          <circle cx="58" cy="92" r="3" fill="#C4B5FD" opacity="0.7" />
          <circle cx="252" cy="108" r="2.5" fill="#C4B5FD" opacity="0.6" />
          <path
            d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"
            fill="#D4CCFF"
            transform="translate(248 52) scale(0.9)"
          />
        </svg>
      </div>
    </motion.div>
  );
}

export function NotFoundContent() {
  return (
    <>
      <PageBackground />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6">
        <div className={cn(artdear.container, "flex max-w-xl flex-col items-center text-center")}>
          <NotFoundIllustration />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 sm:mt-10"
          >
            <p className="text-[13px] font-semibold tracking-[0.24em] text-artdear-purple sm:text-[14px]">
              ERROR 404
            </p>
            <h1 className="mt-3 bg-gradient-to-br from-artdear-purple via-[#9d8fff] to-[#6b5ce7] bg-clip-text text-[40px] font-black leading-none tracking-[-0.02em] text-transparent sm:text-[48px]">
              404
            </h1>
            <p className="mt-4 text-[16px] font-medium text-artdear-text sm:text-[18px]">
              페이지를 찾을 수 없습니다.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-artdear-text-subtle sm:text-[14px]">
              요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있어요.
            </p>

            <Link
              href="/"
              className={cn(
                artdear.btnPrimary,
                artdear.btnPrimaryLg,
                artdear.btnGlow,
                "mt-8 inline-flex w-full sm:w-auto"
              )}
            >
              <Home className="size-[18px]" strokeWidth={2.2} />
              홈으로 이동
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
