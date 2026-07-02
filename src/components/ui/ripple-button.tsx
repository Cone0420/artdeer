"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Ripple = { id: number; x: number; y: number };

function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [
      ...prev,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  };

  return { ripples, addRipple };
}

function RippleLayer({ ripples }: { ripples: Ripple[] }) {
  return (
    <>
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full bg-white/35 mix-blend-overlay"
          style={{ left: ripple.x, top: ripple.y, width: 8, height: 8, x: "-50%", y: "-50%" }}
          initial={{ scale: 0, opacity: 0.55 }}
          animate={{ scale: 28, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

const motionProps = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.99 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

type RippleButtonProps = HTMLMotionProps<"button"> & {
  children: ReactNode;
};

export function RippleButton({ className, children, onClick, ...props }: RippleButtonProps) {
  const { ripples, addRipple } = useRipple();

  return (
    <motion.button
      {...motionProps}
      className={cn("relative overflow-hidden", className)}
      onClick={(e) => {
        addRipple(e);
        onClick?.(e);
      }}
      {...props}
    >
      <RippleLayer ripples={ripples} />
      <span className="relative z-[1] inline-flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}

type RippleLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
};

export function RippleLink({ href, className, children, target, rel }: RippleLinkProps) {
  const { ripples, addRipple } = useRipple();
  const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");

  const content = (
    <>
      <RippleLayer ripples={ripples} />
      <span className="relative z-[1] inline-flex items-center justify-center gap-2">{children}</span>
    </>
  );

  if (isExternal || target) {
    return (
      <motion.a
        href={href}
        target={target}
        rel={rel}
        {...motionProps}
        className={cn("relative inline-flex overflow-hidden", className)}
        onClick={addRipple}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div {...motionProps} className={cn("relative inline-flex overflow-hidden", className)}>
      <Link href={href} className="relative inline-flex overflow-hidden" onClick={addRipple}>
        {content}
      </Link>
    </motion.div>
  );
}

export function RippleSurface({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}) {
  const { ripples, addRipple } = useRipple();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative overflow-hidden", className)}
      onClick={(e) => {
        addRipple(e);
        onClick?.(e);
      }}
    >
      <RippleLayer ripples={ripples} />
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
}
