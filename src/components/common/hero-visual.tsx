"use client";

/**
 * Puts the hero art inside a real 3D space that responds to the pointer.
 *
 * ── IN SIMPLE WORDS ──
 * Move your mouse over the illustration and it turns to follow you, with the
 * glow behind it moving less than the art in front. That difference is what
 * makes it read as depth rather than as a picture being wobbled.
 *
 * And as you scroll away from the hero, the art drifts a little slower than the
 * page, with the glow slower still — so the two separate as it leaves instead
 * of sliding off as one flat picture. That second part works on a phone; the
 * mouse-following does not, and cannot.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * This is genuine 3D: a `perspective` on the container, `preserve-3d` on the
 * stage, and children at different `translateZ`. It is NOT WebGL, because the
 * source is a flat PNG with no geometry and no depth channel. Three.js would
 * render that same flat image on a flat plane and cost ~150 kB to do it. If a
 * real .glb model ever exists, that is the moment to reach for WebGL.
 *
 * NO useState. Both effects write CSS custom properties straight onto the DOM
 * node and React never re-renders, so the tree does not reconcile 60 times a
 * second — the failure mode that makes mouse-tracking effects collapse on
 * mid-range phones.
 *
 * This file used to say it "needs neither Motion nor GSAP", and for the TILT
 * that is still exactly right: a pointer handler writing two properties behind
 * a frame guard is less code than any library call for it. The parallax below
 * is the part that changed, and only because anime.js's scroll observer was
 * ALREADY in this route's bundle for the process spine — measured at +382 bytes
 * gzipped to add it here, against ~16.5 kB had this been the first use. **If
 * the spine is ever removed, re-run that measurement before keeping this**: the
 * parallax alone does not justify the dependency, and hand-rolling a scroll
 * handler for it would be the right call again.
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

import { animate } from "animejs/animation";
import { onScroll } from "animejs/events";

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

  /**
   * Scroll parallax, and it is a SEPARATE EFFECT ON PURPOSE.
   *
   * The tilt above is gated on `(hover: hover) and (pointer: fine)`, which is
   * correct for it — there is no pointer to follow on a phone. But that gate is
   * also why the hero art was completely static on every touch device, and
   * static on desktop the moment you stopped moving the mouse. This runs
   * everywhere, so the one piece of art on the page finally does something on
   * the devices most people arrive on.
   *
   * IT DRIVES TWO CUSTOM PROPERTIES, NOT `transform`. Both layers already carry
   * a `translateZ` that places them in the stage's 3D space, and the stage
   * itself carries the tilt rotation. Animating `transform` here would overwrite
   * one of those and flatten the effect the file exists for; a custom property
   * composes into the existing transform in globals.css instead, so the two
   * effects cannot collide.
   *
   * THE GLOW TRAVELS FURTHER THAN THE ART, which is the opposite of the tilt's
   * rule and is not a mistake. On a rotation, the layer further from the camera
   * sweeps a SMALLER screen arc. On a translation, a background is read as
   * distant precisely because it moves LESS across the screen — and a bigger
   * positive Y here means more of the scroll is cancelled, so it lags more.
   * Perspective sharpens the split: at `perspective: 1100px`, the art at z=+40
   * shows 1.038x of its Y on screen and the glow at z=-90 shows 0.924x.
   *
   * ── DO NOT ──
   * - Do not put this behind the hover/pointer gate. Touch is the case it was
   *   added for.
   * - Do not raise the travel much. These are small numbers because the art sits
   *   in an `aspect-[5/4]` box with no clipping: a large drift slides it toward
   *   the band below, and the hero is the one thing on the site that must look
   *   settled at first paint.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Progress 0 while the hero's top is at or below the viewport top — which
    // includes first paint, so the art is at rest before anyone scrolls — and 1
    // once its bottom has passed the top edge.
    const observer = onScroll({
      target: el,
      enter: { target: "top", container: "top" },
      leave: { target: "bottom", container: "top" },
      // Tighter than the process spine's 0.35. `sync` maps to a per-frame lerp
      // between 0.01 and 0.2, so a higher number tracks the scroll more
      // closely: parallax is a spatial relationship and visible lag reads as
      // the art sliding after you have stopped. Some smoothing is still wanted,
      // because a mouse wheel arrives in discrete jumps and 1:1 would step.
      sync: 0.65,
    });

    const drift = animate(el, {
      "--parallax-art": ["0px", "14px"],
      "--parallax-glow": ["0px", "28px"],
      // The scroll position IS the curve. Any easing here puts the art ahead of
      // or behind the finger driving it.
      ease: "linear",
      autoplay: observer,
    });

    return () => {
      // Hands both properties back to their CSS fallbacks of 0px.
      drift.revert();
      observer.revert();
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
