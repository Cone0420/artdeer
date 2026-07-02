"use client";

import { memo, useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { ReviewItem } from "@/lib/reviews-data";
import "./reviews-marquee.css";

/** 카드 1장이 화면을 지나가는 데 걸리는 시간(초) — 6~8초 목표 */
const SECONDS_PER_CARD = 7;
const RESUME_DELAY_MS = 3000;
const DRAG_THRESHOLD_PX = 4;
const MIN_THUMB_WIDTH_PX = 48;

export function getMarqueeDurationSeconds(reviewCount: number): number {
  return Math.max(reviewCount, 1) * SECONDS_PER_CARD;
}

type ReviewsMarqueeProps = {
  reviews: ReviewItem[];
  renderCard: (review: ReviewItem) => ReactNode;
  cardClassName: string;
};

function wrapOffset(offset: number, loopWidth: number): number {
  if (loopWidth <= 0) return 0;
  let next = offset % loopWidth;
  if (next < 0) next += loopWidth;
  return next;
}

export const ReviewsMarquee = memo(function ReviewsMarquee({
  reviews,
  renderCard,
  cardClassName,
}: ReviewsMarqueeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollbarTrackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({
    offset: 0,
    loopWidth: 0,
    viewportWidth: 0,
    paused: false,
    reducedMotion: false,
  });

  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startOffset: 0,
    moved: false,
  });

  const thumbDragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startOffset: 0,
  });

  const loopedReviews = useMemo(
    () => (reviews.length > 0 ? [...reviews, ...reviews] : []),
    [reviews]
  );

  const durationSeconds = getMarqueeDurationSeconds(reviews.length);

  const applyTransform = useCallback((offset: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }, []);

  const updateScrollbar = useCallback(() => {
    const { offset, loopWidth, viewportWidth } = stateRef.current;
    const track = scrollbarTrackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb || loopWidth <= 0) return;

    const trackWidth = track.clientWidth;
    const thumbWidth = Math.max((viewportWidth / loopWidth) * trackWidth, MIN_THUMB_WIDTH_PX);
    const maxThumbOffset = Math.max(trackWidth - thumbWidth, 0);
    const thumbOffset = (offset / loopWidth) * maxThumbOffset;

    thumb.style.width = `${thumbWidth}px`;
    thumb.style.transform = `translate3d(${thumbOffset}px, 0, 0)`;
  }, []);

  const measureLayout = useCallback(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const loopWidth = track.scrollWidth / 2;
    stateRef.current.loopWidth = loopWidth;
    stateRef.current.viewportWidth = viewport.clientWidth;

    stateRef.current.offset = wrapOffset(stateRef.current.offset, loopWidth);
    applyTransform(stateRef.current.offset);
    updateScrollbar();
  }, [applyTransform, updateScrollbar]);

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current !== null) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const scheduleAutoResume = useCallback(() => {
    clearResumeTimer();
    resumeTimerRef.current = setTimeout(() => {
      stateRef.current.paused = false;
      resumeTimerRef.current = null;
    }, RESUME_DELAY_MS);
  }, [clearResumeTimer]);

  const pauseFromInteraction = useCallback(() => {
    stateRef.current.paused = true;
    scheduleAutoResume();
  }, [scheduleAutoResume]);

  const setOffset = useCallback(
    (nextOffset: number) => {
      const loopWidth = stateRef.current.loopWidth;
      stateRef.current.offset = wrapOffset(nextOffset, loopWidth);
      applyTransform(stateRef.current.offset);
      updateScrollbar();
    },
    [applyTransform, updateScrollbar]
  );

  const setDraggingUi = useCallback((dragging: boolean) => {
    viewportRef.current?.classList.toggle("is-dragging", dragging);
  }, []);

  const setThumbDraggingUi = useCallback((dragging: boolean) => {
    thumbRef.current?.classList.toggle("is-dragging", dragging);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      stateRef.current.reducedMotion = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    measureLayout();

    const track = trackRef.current;
    const viewport = viewportRef.current;
    const scrollbarTrack = scrollbarTrackRef.current;
    if (!track || !viewport) return;

    const resizeObserver = new ResizeObserver(measureLayout);
    resizeObserver.observe(track);
    resizeObserver.observe(viewport);
    if (scrollbarTrack) resizeObserver.observe(scrollbarTrack);

    return () => resizeObserver.disconnect();
  }, [loopedReviews, measureLayout]);

  useEffect(() => {
    if (reviews.length === 0) return;

    let lastTime = performance.now();

    const tick = (now: number) => {
      const deltaMs = Math.min(now - lastTime, 32);
      lastTime = now;

      const state = stateRef.current;
      if (!state.paused && !state.reducedMotion && state.loopWidth > 0) {
        const pxPerMs = state.loopWidth / (durationSeconds * 1000);
        setOffset(state.offset + pxPerMs * deltaMs);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [durationSeconds, reviews.length, setOffset]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      const horizontalDelta =
        event.deltaX !== 0 ? event.deltaX : event.shiftKey ? event.deltaY : 0;
      if (horizontalDelta === 0) return;

      event.preventDefault();
      setOffset(stateRef.current.offset + horizontalDelta);
      pauseFromInteraction();
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [pauseFromInteraction, setOffset]);

  const handleViewportPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;

      dragRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startOffset: stateRef.current.offset,
        moved: false,
      };

      viewportRef.current?.setPointerCapture(event.pointerId);
      setDraggingUi(true);
      pauseFromInteraction();
    },
    [pauseFromInteraction, setDraggingUi]
  );

  const handleViewportPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag.active || event.pointerId !== drag.pointerId) return;

      const deltaX = event.clientX - drag.startX;
      if (Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
        drag.moved = true;
      }
      if (!drag.moved) return;

      event.preventDefault();
      setOffset(drag.startOffset - deltaX);
    },
    [setOffset]
  );

  const finishViewportDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag.active || event.pointerId !== drag.pointerId) return;

      drag.active = false;
      setDraggingUi(false);

      if (viewportRef.current?.hasPointerCapture(event.pointerId)) {
        viewportRef.current.releasePointerCapture(event.pointerId);
      }

      if (drag.moved) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }

      pauseFromInteraction();
    },
    [pauseFromInteraction, setDraggingUi]
  );

  const handleClickCapture = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  const handleTrackClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).closest(".reviews-scrollbar-thumb")) return;

      const track = scrollbarTrackRef.current;
      const { loopWidth } = stateRef.current;
      if (!track || loopWidth <= 0) return;

      const rect = track.getBoundingClientRect();
      const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
      setOffset(ratio * loopWidth);
      pauseFromInteraction();
    },
    [pauseFromInteraction, setOffset]
  );

  const handleThumbPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      thumbDragRef.current = {
        active: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        startOffset: stateRef.current.offset,
      };

      event.currentTarget.setPointerCapture(event.pointerId);
      setThumbDraggingUi(true);
      pauseFromInteraction();
    },
    [pauseFromInteraction, setThumbDraggingUi]
  );

  const handleThumbPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const thumbDrag = thumbDragRef.current;
      if (!thumbDrag.active || event.pointerId !== thumbDrag.pointerId) return;

      const track = scrollbarTrackRef.current;
      const { loopWidth } = stateRef.current;
      if (!track || loopWidth <= 0) return;

      event.preventDefault();

      const trackWidth = track.clientWidth;
      const viewportWidth = stateRef.current.viewportWidth || trackWidth;
      const thumbWidth = Math.max((viewportWidth / loopWidth) * trackWidth, MIN_THUMB_WIDTH_PX);
      const maxThumbOffset = Math.max(trackWidth - thumbWidth, 0);
      if (maxThumbOffset <= 0) return;

      const deltaX = event.clientX - thumbDrag.startX;
      const startThumbOffset = (thumbDrag.startOffset / loopWidth) * maxThumbOffset;
      const nextThumbOffset = Math.min(Math.max(startThumbOffset + deltaX, 0), maxThumbOffset);
      const nextOffset = (nextThumbOffset / maxThumbOffset) * loopWidth;

      setOffset(nextOffset);
    },
    [setOffset]
  );

  const finishThumbDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const thumbDrag = thumbDragRef.current;
      if (!thumbDrag.active || event.pointerId !== thumbDrag.pointerId) return;

      thumbDrag.active = false;
      setThumbDraggingUi(false);

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      pauseFromInteraction();
    },
    [pauseFromInteraction, setThumbDraggingUi]
  );

  if (reviews.length === 0) return null;

  return (
    <div className="reviews-scroll-wrap">
      <div
        ref={viewportRef}
        className="reviews-marquee-viewport"
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={finishViewportDrag}
        onPointerCancel={finishViewportDrag}
        onClickCapture={handleClickCapture}
      >
        <div ref={trackRef} className="reviews-marquee-track flex gap-5">
          {loopedReviews.map((review, itemIndex) => (
            <div key={`${review.id}-${itemIndex}`} className={cardClassName}>
              {renderCard(review)}
            </div>
          ))}
        </div>
      </div>

      <div className="reviews-scrollbar" aria-hidden="true">
        <div
          ref={scrollbarTrackRef}
          className="reviews-scrollbar-track"
          onClick={handleTrackClick}
        >
          <div
            ref={thumbRef}
            className="reviews-scrollbar-thumb"
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={finishThumbDrag}
            onPointerCancel={finishThumbDrag}
          />
        </div>
      </div>
    </div>
  );
});
