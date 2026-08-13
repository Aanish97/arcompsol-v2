"use client";

/**
 * Fades and lifts its children into view the first time they are scrolled to.
 *
 * ── IN SIMPLE WORDS ──
 * Content sits still until it reaches the viewport, then rises a little and
 * fades in. Once shown it stays shown — it does not replay when you scroll back
 * up, which is distracting on a page you are re-reading.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * IntersectionObserver, not a scroll listener. A scroll handler fires on every
 * frame of every scroll for every element on the page; the observer is told
 * once what to watch and the browser does the work off the main thread.
 *
 * The observer DISCONNECTS after the first reveal. Left connected, six milestone
 * rows plus nine cards keep observing for the life of the page for no reason.
 *
 * All the visual state is CSS (see globals.css). This component only flips a
 * data attribute. That is what lets the hidden state live inside a
 * prefers-reduced-motion query and lets <noscript> override it — neither is
 * possible if opacity is set from JavaScript.
 *
 * rootMargin's -12% bottom means the reveal fires slightly BEFORE the element
 * reaches the bottom edge. Triggering exactly at the edge means you watch it
 * animate; triggering early means it has already settled by the time you look.
 *
 * ── DO NOT ──
 * - Do not wrap above-the-fold content in this. The first thing a visitor sees
 *   should not fade in — it reads as a slow page, not as polish.
 * - Do not set opacity here as a fallback "to be safe". It would defeat the
 *   reduced-motion query and hide content from people who asked not to have it
 *   animated.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  /** Stagger, in ms. Keep under ~300 total or the last item feels broken. */
  delay?: number;
  as?: "div" | "li" | "section";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — one ref type covering div | li | section
      ref={ref}
      data-reveal={shown ? "shown" : ""}
      style={
        delay
          ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties)
          : undefined
      }
      className={className}
    >
      {children}
    </Tag>
  );
}
