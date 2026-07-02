"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { artdear } from "@/lib/artdear-styles";
import { FourPointStar } from "./four-point-star";

export function SectionTitleIcon({
  className,
  animated = false,
}: {
  className?: string;
  animated?: boolean;
}) {
  const icon = (
    <FourPointStar className={cn(artdear.sectionTitleIcon, className)} />
  );

  if (animated) {
    return (
      <motion.span
        className="inline-flex shrink-0 items-center"
        animate={{ rotate: [0, 8, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        {icon}
      </motion.span>
    );
  }

  return icon;
}
