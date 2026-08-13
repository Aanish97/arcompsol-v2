"use client";

/**
 * Puts the hero art inside a real 3D space that responds to the pointer.
 *
 * ── IN SIMPLE WORDS ──
 * Move your mouse over the illustration and it turns to follow you, with the
 * glow behind it moving less than the art in front. That difference is what
 * makes it read as depth rather than as a picture being wobbled.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * This is genuine 3D: a `perspective` on the container, `preserve-3d` on the
 * stage, and children at different `translateZ`. It is NOT WebGL, because the
 * source is a flat PNG with no geometry and no depth channel. Three.js would
 * render that same flat image on a flat plane and cost ~150 kB to do it. If a
 * real .glb model ever exists, that is the moment to reach for WebGL.
 *
 * NO useState, and no dependency. The pointer writes two CSS custom properties
 * straight onto the DOM node. React never re-renders, so the tree does not
 * reconcile 60 times a second, which is the failure mode that makes
 * mouse-tracking effects collapse on mid-range phones. It is also why this
 * needs neither Motion nor GSAP.
 *
 * rAF-throttled. pointermove fires faster than the display refreshes; without
 * the frame guard the same style is written several times per painted frame.
 *
 * Gated on `(hover: hover) and (pointer: fine)`. On a touch screen there is no
 * pointer to follow, and attaching the listener there only burns battery
 * reacting to taps.
 *
 * ── DO NOT ──
 * - Do not drop the reduced-motion check. Pointer-driven rotation is exactly
 *   the kind of movement that setting exists to stop, and here it costs
 *   nothing to honour: the art simply sits still.
 * - Do not animate anything but `transform`. A rotation is free on the
 *   compositor; touching width, height or margin would relayout the hero on
 *   every mouse move.
 * - Do not raise the angles much past 20deg. The plane is flat, so beyond that
 *   the illusion breaks and it reads as a sheet of paper being tipped.
 */
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function HeroVisual({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;

    let frame = 0;

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty("--tilt-y", `${(x * 18).toFixed(2)}deg`);
        el.style.setProperty("--tilt-x", `${(-y * 13).toFixed(2)}deg`);
        el.dataset.tracking = "true";
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
      el.dataset.tracking = "false";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={cn("tilt3d", className)}>
      <div className="tilt3d-stage">
        {/* Behind the art, pushed back in Z. Because it is further from the
            camera it swings through a smaller arc than the illustration, and
            that difference IS the depth cue. Matching their motion would flatten
            the whole thing back into a picture. */}
        <span aria-hidden className="tilt3d-glow" />
        <div className="tilt3d-art">{children}</div>
      </div>
    </div>
  );
}
