"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";

const easeOut = [0.22, 1, 0.36, 1] as const;

type MotionCardProps = HTMLMotionProps<"div"> & {
  delay?: number;
  interactive?: boolean;
  glass?: boolean;
};

export function MotionCard({
  className,
  children,
  delay = 0,
  interactive = true,
  glass = false,
  ...props
}: MotionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
      className={cn(
        artdear.card,
        interactive && artdear.cardInteractive,
        glass && "glass",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MotionGridItem({
  index = 0,
  className,
  children,
}: {
  index?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
