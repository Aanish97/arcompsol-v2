"use client";

/**
 * The landing hero band, lit by a gradient that follows the pointer.
 *
 * ── IN SIMPLE WORDS ──
 * Move your mouse across the top of the page and the green wash under the
 * paper follows it, like a light being carried behind the sheet. A second,
 * fainter wash drifts the other way and much slower. Click and a soft ring
 * spreads out from exactly where you pressed.
 *
 * Three things move at three different speeds — this wash at 72% of your
 * cursor, the far wash at about 12% and backwards, and the illustration
 * itself (see hero-visual.tsx) at full tilt. That SPREAD is what makes it
 * read as depth. If they all moved together the whole hero would look like
 * it was sliding, which reads as a bug rather than as space.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The washes DARKEN toward forest green. They do not glow. The hero ground is
 * --surface #FBFAF7 at L* 98.3, so there is no headroom above it: a lighter
 * radial on near-white is not dim, it is mathematically absent. This is the
 * exact failure that killed the earlier WebGL hero mesh, the footer mesh and
 * the flame, all of which used additive blending (src + dst — anything added
 * to white IS white). Anything added here must subtract light.
 *
 * CSS, not WebGL, and deliberately so. R3F's render loop does not execute in
 * this project at all (measured: renderCalls 0, programsCompiled 0, useFrame
 * never ticks), so WebGL here would mean raw three.js with a hand-owned
 * requestAnimationFrame — ~150 kB to draw two radial gradients that cannot use
 * bloom or additive blending anyway. This file is 1.5 kB and has no dependency.
 *
 * NO useState. The pointer writes four CSS custom properties straight onto the
 * section node, so React never reconciles during the movement. Re-rendering a
 * tree 60 times a second is the failure mode that makes pointer effects
 * collapse on mid-range phones. Same discipline as hero-visual.tsx.
 *
 * rAF-throttled: pointermove fires faster than the display refreshes, so
 * without the frame guard the same style is written several times per painted
 * frame.
 *
 * The ripple uses the Web Animations API rather than a CSS animation, because
 * a CSS animation has to be cancelled and reflowed to replay from a new
 * position, and rapid clicking makes that hack visibly stutter.
 *
 * Movement is gated on (hover: hover) and (pointer: fine) — there is no
 * pointer to follow on a touch screen. The RIPPLE is not gated, because a tap
 * has a position and giving it a response is the whole point.
 *
 * With JavaScript off, or under reduced-motion, the layers render at their
 * rest positions and reproduce the old static .bg-hero-glow almost exactly.
 * That class is still live on /careers and the 404 page — do not delete it.
 *
 * ── DO NOT ──
 * - Do not raise the tint percentages in globals.css without re-measuring
 *   contrast. The hero paragraph is --ink-soft on --surface; the washes stack,
 *   and a ripple crossing under that text is the worst case on the page.
 * - Do not drop the reduced-motion check. A wash chasing the cursor is
 *   precisely the movement that setting exists to stop.
 * - Do not animate anything but transform and opacity. Both are compositor
 *   work; touching background-position would repaint the whole band on every
 *   mouse move.
 * - Do not let the layer wrapper take pointer events. It covers the CTAs.
 */
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * How far each wash travels per pixel of pointer movement.
 *
 * NEAR is high enough to read as "it follows my mouse" while still lagging
 * — at 0.72 it trails the cursor by ~270px at the edge of a 1920 viewport,
 * which is what gives it weight instead of feeling glued on.
 *
 * FAR is negative on purpose. Counter-drift separates the two planes far more
 * strongly than a small same-direction offset does, and it is bounded in px
 * rather than scaled by the section, so it stays a drift and never becomes a
 * second thing chasing the cursor.
 */
const NEAR_GAIN = 0.72;
const FAR_TRAVEL_X = -70;
const FAR_TRAVEL_Y = -44;

export function HeroGradient({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();

        // NEAR rests centred on the top edge of the band, so its offset is
        // measured from there — not from the middle of the box.
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = event.clientY - rect.top;

        // FAR is driven by a normalised offset so its travel is capped in px
        // regardless of how tall the band gets on a narrow viewport.
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;

        el.style.setProperty("--near-x", `${(dx * NEAR_GAIN).toFixed(1)}px`);
        el.style.setProperty("--near-y", `${(dy * NEAR_GAIN).toFixed(1)}px`);
        el.style.setProperty("--far-x", `${(nx * FAR_TRAVEL_X).toFixed(1)}px`);
        el.style.setProperty("--far-y", `${(ny * FAR_TRAVEL_Y).toFixed(1)}px`);
        el.dataset.tracking = "true";
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty("--near-x", "0px");
      el.style.setProperty("--near-y", "0px");
      el.style.setProperty("--far-x", "0px");
      el.style.setProperty("--far-y", "0px");
      el.dataset.tracking = "false";
    };

    const onDown = (event: PointerEvent) => {
      const ripple = rippleRef.current;
      if (!ripple) return;

      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left).toFixed(1);
      const y = (event.clientY - rect.top).toFixed(1);
      const at = `translate3d(${x}px, ${y}px, 0)`;

      // Replaces any ripple still running. Without this a fast double click
      // leaves two rings at different radii, which reads as a glitch.
      ripple.getAnimations().forEach((animation) => animation.cancel());

      // Scaling DOWN from full size, never up. The element is authored at its
      // final diameter so the compositor rasterises the gradient once at the
      // size it ends at; growing a small layer 20x would resample it.
      ripple.animate(
        [
          { transform: `${at} scale(0.06)`, opacity: 0 },
          { transform: `${at} scale(0.34)`, opacity: 1, offset: 0.26 },
          { transform: `${at} scale(1)`, opacity: 0 },
        ],
        { duration: 720, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    };

    if (fine) {
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
    }
    el.addEventListener("pointerdown", onDown);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      rippleRef.current
        ?.getAnimations()
        .forEach((animation) => animation.cancel());
    };
  }, []);

  return (
    <section ref={ref} className={cn("hero-light w-full", className)}>
      {/* z-index -1, contained by `isolation: isolate` on .hero-light, so the
          washes paint above the section's own paper background and below the
          copy without the content needing a stacking context of its own. */}
      <div aria-hidden className="hero-light-layer">
        <span className="hero-light-far" />
        <span className="hero-light-near" />
        <span ref={rippleRef} className="hero-light-ripple" />
      </div>

      {children}
    </section>
  );
}
