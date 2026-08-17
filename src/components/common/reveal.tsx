"use client";

/**
 * Reveals its children the first time they are scrolled to, once.
 *
 * IT ONLY FLIPS A DATA ATTRIBUTE — every visual state is CSS (globals.css).
 * That is what lets the hidden state sit inside a `prefers-reduced-motion`
 * query and lets layout.tsx's `<noscript>` rule override it. Set opacity from
 * here "to be safe" and both stop working: reduced-motion users get content
 * hidden from them, and a blocked bundle leaves the page blank.
 *
 * rootMargin's -12% bottom fires the reveal slightly BEFORE the element reaches
 * the viewport edge, so it has settled by the time you look at it rather than
 * animating under your eye. services-grid.tsx matches these margins on purpose.
 *
 * Do not wrap above-the-fold content in this — content that fades in on first
 * paint reads as a slow page. The heroes use `data-stagger="load"` instead.
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
