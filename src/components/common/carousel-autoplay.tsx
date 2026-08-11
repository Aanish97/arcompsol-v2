"use client";

/**
 * Advances a carousel on a timer. Renders nothing; must sit inside <Carousel>.
 *
 * ── IN SIMPLE WORDS ──
 * The carousel moves to the next item on its own every few seconds. It stops
 * the moment you look like you are reading it — cursor over it, keyboard focus
 * inside it, a finger on it — and starts again when you leave. It never runs
 * while the tab is in the background or while the carousel is off screen.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * Written against embla's own API rather than pulling in
 * embla-carousel-autoplay. The plugin is a dependency, a version to keep in
 * step with embla itself, and ~4 kB, for one setInterval and a set of pause
 * conditions — and the pause conditions are the part that actually matters
 * here, which is the part a plugin default would not get right for this
 * content.
 *
 * THE FOUR PAUSE CONDITIONS ARE THE FEATURE, not defensive extras:
 *
 *   hover / focus  — content that moves while you are reading it is worse than
 *                    content that does not move at all. This is also what
 *                    keeps the thing usable given the testimonials run 18–24
 *                    seconds of reading each, well past any sane interval.
 *   pointerDown    — a drag or a tap is someone taking control. Advancing on a
 *                    timer immediately after fights the person doing it.
 *   document.hidden— a background tab would otherwise scroll through the whole
 *                    set unseen, so you return to a carousel parked somewhere
 *                    arbitrary.
 *   off screen     — same problem down the page. Without it the benefits
 *                    carousel on /careers has advanced several times before it
 *                    is ever scrolled to.
 *
 * All four are read INSIDE the tick rather than by starting and stopping the
 * timer. One interval exists for the component's lifetime and each tick asks
 * whether it should act — which is why prefers-reduced-motion works here as a
 * live query rather than a value captured once at mount.
 *
 * ── DO NOT ──
 * - Do not set an interval shorter than the content takes to read. Measure it:
 *   the testimonials are 61–80 words, 18–24s at 200wpm.
 * - Do not remove the reduced-motion check. Auto-advancing content is the
 *   textbook case of motion someone may have asked their OS to stop.
 * - Do not use this on a carousel without `loop: true`. scrollNext() on the
 *   last slide of a non-looping carousel is a no-op, so the timer would keep
 *   firing against a dead end.
 */
import { useEffect } from "react";

import { useCarousel } from "@/components/ui/carousel";

export function CarouselAutoplay({
  /** Milliseconds between advances. Must exceed the reading time of one item. */
  interval,
}: {
  interval: number;
}) {
  const { api } = useCarousel();

  useEffect(() => {
    if (!api) return;

    const root = api.rootNode();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let hovered = false;
    let focused = false;
    let dragging = false;
    let onScreen = true;

    const tick = () => {
      if (hovered || focused || dragging || !onScreen) return;
      if (document.hidden || reduced.matches) return;
      api.scrollNext();
    };

    const timer = window.setInterval(tick, interval);

    const enter = () => (hovered = true);
    const leave = () => (hovered = false);
    const focusIn = () => (focused = true);
    const focusOut = () => (focused = false);
    const down = () => (dragging = true);
    // `settle` rather than `pointerUp`: releasing a drag leaves the carousel
    // mid-glide, and resuming there means the next tick can land while it is
    // still moving. `settle` fires once it has come to rest.
    const settle = () => (dragging = false);

    root.addEventListener("mouseenter", enter);
    root.addEventListener("mouseleave", leave);
    root.addEventListener("focusin", focusIn);
    root.addEventListener("focusout", focusOut);
    api.on("pointerDown", down);
    api.on("settle", settle);

    const observer = new IntersectionObserver(
      ([entry]) => (onScreen = entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(root);

    return () => {
      window.clearInterval(timer);
      root.removeEventListener("mouseenter", enter);
      root.removeEventListener("mouseleave", leave);
      root.removeEventListener("focusin", focusIn);
      root.removeEventListener("focusout", focusOut);
      api.off("pointerDown", down);
      api.off("settle", settle);
      observer.disconnect();
    };
  }, [api, interval]);

  return null;
}
