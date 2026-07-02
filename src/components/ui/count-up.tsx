"use client";

import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function CountUp({
  to,
  from = 0,
  className,
  suffix = "",
  prefix = "",
  duration = 1.6,
}: {
  to: number;
  from?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(from, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export function AnimatedPrice({ value, className }: { value: string; className?: string }) {
  const match = value.match(/([\d,]+)/);
  if (!match || match.index === undefined) {
    return <span className={className}>{value}</span>;
  }

  const num = Number.parseInt(match[1].replace(/,/g, ""), 10);
  if (Number.isNaN(num)) {
    return <span className={className}>{value}</span>;
  }

  const before = value.slice(0, match.index);
  const after = value.slice(match.index + match[1].length);

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      {before ? <span>{before}</span> : null}
      <CountUp to={num} className="tabular-nums" />
      {after ? <span>{after}</span> : null}
    </span>
  );
}
