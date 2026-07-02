"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor-hover]";

const LERP_INNER = 0.28;
const LERP_OUTER = 0.12;
const HOVER_OUTER_SCALE = 2;
const HOVER_INNER_SCALE = 1.6;

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const innerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const inner = useRef({ x: -100, y: -100 });
  const outer = useRef({ x: -100, y: -100 });
  const hoveringRef = useRef(false);
  const rafId = useRef(0);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reducedMotion.matches) return;

    setEnabled(true);
    document.body.classList.add("custom-cursor-active");

    const onMove = (event: MouseEvent) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;
      setVisible(true);
    };

    const onOver = (event: MouseEvent) => {
      const element = event.target;
      if (!(element instanceof Element)) return;
      hoveringRef.current = !!element.closest(INTERACTIVE_SELECTOR);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const tick = () => {
      inner.current.x += (target.current.x - inner.current.x) * LERP_INNER;
      inner.current.y += (target.current.y - inner.current.y) * LERP_INNER;
      outer.current.x += (target.current.x - outer.current.x) * LERP_OUTER;
      outer.current.y += (target.current.y - outer.current.y) * LERP_OUTER;

      const innerScale = hoveringRef.current ? HOVER_INNER_SCALE : 1;
      const outerScale = hoveringRef.current ? HOVER_OUTER_SCALE : 1;

      const innerEl = innerRef.current;
      const outerEl = outerRef.current;

      if (innerEl) {
        innerEl.style.transform = `translate3d(${inner.current.x}px, ${inner.current.y}px, 0) translate(-50%, -50%) scale(${innerScale})`;
      }

      if (outerEl) {
        outerEl.style.transform = `translate3d(${outer.current.x}px, ${outer.current.y}px, 0) translate(-50%, -50%) scale(${outerScale})`;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(rafId.current);
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[120] transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        ref={outerRef}
        className="absolute top-0 left-0 size-9 rounded-full border border-artdear-purple/35 bg-artdear-purple/10 will-change-transform"
        style={{ marginTop: 0, marginLeft: 0 }}
      />
      <div
        ref={innerRef}
        className="absolute top-0 left-0 size-1.5 rounded-full bg-artdear-purple will-change-transform"
        style={{ marginTop: 0, marginLeft: 0 }}
      />
    </div>
  );
}
