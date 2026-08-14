"use client";

/**
 * The line down the middle of "How We Work?", drawn as you scroll past it.
 *
 * ── IN SIMPLE WORDS ──
 * The six process steps have a vertical line running through them. This draws
 * that line in as you scroll, so it grows downward and keeps pace with whatever
 * you are reading, and each numbered circle picks up a soft halo the moment the
 * line reaches it. Scroll back up and it retreats. It is the section saying
 * "you are here" rather than decorating itself.
 *
 * ── BUSINESS RULES ──
 * - The six steps are a SEQUENCE, and milestones.tsx already argues that this is
 *   the whole reason the layout alternates ("what makes a sequence feel like a
 *   sequence"). A line that draws in order is the same argument in motion; a
 *   line that is simply present is not.
 * - Enhancement only. The section is fully designed and fully readable with this
 *   file deleted — see the track element in milestones.tsx, which is untouched.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * TWO LINES, NOT ONE. milestones.tsx still renders its original gradient track;
 * this draws a second, brand-coloured line on top of it. That split is what
 * makes every failure mode land on today's design instead of on a blank column:
 * no JavaScript, a blocked bundle, an anime.js error, reduced motion — in every
 * one of them the track is still there and the section looks exactly as it did
 * before this file existed. Do not merge them into one animated element.
 *
 * `pathLength={1}` is load-bearing. The SVG is a 1px-wide box stretched to the
 * list's height with `preserveAspectRatio="none"`, so its user units are wildly
 * non-square and a raw `getTotalLength()` would be meaningless. `pathLength`
 * renormalises the line to exactly 1 unit, which makes `stroke-dasharray: 1`
 * plus a dashoffset of 1→0 an exact 0–100% draw at any viewport height, with no
 * measurement and nothing to recompute on resize. This is also why anime.js's
 * `createDrawable` is NOT used — it exists to do the measuring that `pathLength`
 * makes unnecessary, and skipping it keeps the `svg` module out of the bundle.
 *
 * `overflow: visible` in globals.css, because the stroke is 2px inside a 1px
 * box. An SVG root clips to its viewport by default and the line would render
 * as a 1px sliver of itself.
 *
 * The imports are SUBPATHS — `animejs/animation` and `animejs/events`, never
 * `animejs`. The barrel pulls in the timeline, draggable, WAAPI and text engines
 * for a file that needs a tween and a scroll observer.
 *
 * Marker halos are written by CLASS, and only on change. The head index is
 * tracked across updates so a full scroll of the section performs six class
 * writes total rather than six per frame. The halo itself is a `::after` on the
 * marker: the markers carry `md:-translate-x-1/2`, so animating their own
 * transform would knock all six off the spine on desktop.
 *
 * ── DO NOT ──
 * - Do not remove the reduced-motion bail. A line that grows with the scrollbar
 *   is precisely the coupling that setting exists to break, and the CSS already
 *   ships the finished state to those users — returning early here IS the
 *   correct rendering, not a missing feature.
 * - Do not animate anything but `stroke-dashoffset` here. It is the one property
 *   that changes what is drawn without moving, resizing or repainting the six
 *   panels the line runs behind.
 * - Do not point the observer at this <svg>. It is `position: absolute`, so it
 *   is sized BY the list; using it as the scroll target measures the thing being
 *   animated instead of the thing being scrolled through.
 */
import { useEffect, useRef } from "react";

import { animate } from "animejs/animation";
import { onScroll } from "animejs/events";

import { cn } from "@/lib/utils";

export function MilestoneSpine({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    const line = svg?.querySelector("line");
    // The <ol>. Read from the DOM rather than passed as a ref, so milestones.tsx
    // stays a server component and ships none of its content as client JS.
    // `closest`, NOT parentElement: the svg sits inside a positioning wrapper
    // (see the return below), so a parent hop is one level short and would
    // silently find no markers.
    const list = svg?.closest("ol");
    if (!svg || !line || !list) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const markers = Array.from(
      list.querySelectorAll<HTMLElement>("[data-milestone-marker]"),
    );

    /**
     * Each marker's centre as a fraction of the DRAWN line, not of the list.
     * The spine is inset 24px top and bottom, so measuring against the list
     * would light every marker slightly early at the top. Measuring against the
     * <svg> is the inset, for free.
     *
     * CLAMPED TO [0,1], AND THAT IS NOT DEFENSIVE PADDING. Below `md` the
     * markers are in normal flow and the last row carries `last:pb-0`, so the
     * list ends level with the final marker and `bottom-6` then pulls the line
     * up 24px ABOVE its centre. Measured at 375px: marker 6 sits at 1.0333,
     * outside the range the draw can ever reach, and its halo never fired while
     * the other five worked — which is exactly the sort of bug that survives a
     * desktop review. At 1280px the same marker is at 0.8772 and is unaffected.
     * Clamping says the thing that is actually true: a step past the end of the
     * line is reached when the line finishes.
     */
    let offsets: number[] = [];
    const measure = () => {
      const box = svg.getBoundingClientRect();
      offsets = box.height
        ? markers.map((marker) => {
            const rect = marker.getBoundingClientRect();
            const offset = (rect.top + rect.height / 2 - box.top) / box.height;
            return Math.min(1, Math.max(0, offset));
          })
        : [];
    };
    measure();

    // Index of the last marker the line has reached; -1 is none.
    let head = -1;
    const setHead = (progress: number) => {
      let next = -1;
      // `progress > 0` guards the clamp above: a marker clamped to 0 would
      // otherwise satisfy `0 <= 0` and sit lit before the line has started.
      if (progress > 0) {
        for (const offset of offsets) {
          if (offset > progress) break;
          next += 1;
        }
      }
      if (next === head) return;
      // Walk only the markers whose state actually changed. Scrolling back up
      // takes the second branch, which is why the halos retreat rather than
      // sticking on once seen.
      //
      // A DATA ATTRIBUTE, not a class: the halo is styled with Tailwind's
      // `data-reached:` variant on the marker, so the whole appearance stays on
      // the element it belongs to. Setting a class here would need a matching
      // rule in globals.css and split one effect across two files.
      if (next > head) {
        for (let i = head + 1; i <= next; i += 1) {
          markers[i]?.setAttribute("data-reached", "");
        }
      } else {
        for (let i = head; i > next; i -= 1) {
          markers[i]?.removeAttribute("data-reached");
        }
      }
      head = next;
    };

    /**
     * Progress 0 is the list's top a fifth of a screen above the fold, and
     * progress 1 is its bottom at the middle of the screen. That pairing is
     * what keeps the drawn head near what you are reading: the line leads the
     * first marker slightly on the way in, then tracks the centre of the
     * viewport down the rest of the section.
     */
    const observer = onScroll({
      target: list,
      enter: { target: "top", container: "bottom-=20%" },
      leave: { target: "bottom", container: "center" },
      // Smoothed, not 1:1. A hard link makes the head jitter on a trackpad's
      // sub-pixel deltas; this lets it settle a frame or two behind.
      sync: 0.35,
    });

    const drawing = animate(line, {
      strokeDashoffset: [1, 0],
      // LINEAR, deliberately. The scroll position is already the easing curve —
      // any other ease here means the line runs ahead of or behind the finger
      // driving it, which reads as lag rather than as motion design.
      ease: "linear",
      autoplay: observer,
      onUpdate: (self) => setHead(self.progress),
    });

    // The md breakpoint moves the spine from the left edge to the centre and
    // re-flows every panel, so the marker offsets are only valid for one layout.
    const resize = new ResizeObserver(measure);
    resize.observe(list);

    return () => {
      resize.disconnect();
      // revert() strips the inline stroke-dashoffset, handing the line back to
      // globals.css. Without it a fast route change can leave it half-drawn.
      drawing.revert();
      observer.revert();
      for (const marker of markers) marker.removeAttribute("data-reached");
    };
  }, []);

  return (
    // A WRAPPER, AND IT IS NOT DECORATION. The <svg> cannot take the positioning
    // classes directly: an absolutely positioned replaced element with `top` and
    // `bottom` set but `height: auto` resolves its height from its INTRINSIC
    // size and drops `bottom` as over-constrained (CSS 2.1 §10.6.5). With a
    // 1px-wide box and a 1×100 viewBox that intrinsic height is 100px, so the
    // spine rendered as a 100px stub against a 1283px track — measured, not
    // theorised. The span resolves top/bottom as a normal block, and `size-full`
    // then gives the svg a definite height to fill.
    <span aria-hidden className={cn("pointer-events-none", className)}>
      <svg
        ref={ref}
        // overflow-visible is NOT optional: the stroke is 2px inside a 1px-wide
        // box, and an <svg> root clips to its own viewport by default, so
        // without it the line renders as a sliver of itself.
        className="size-full overflow-visible"
        // A normalised box: 1 unit wide so x=0.5 is dead centre, 100 tall purely
        // so the numbers read as percentages. `none` lets it stretch to whatever
        // height the list is without the line changing width.
        viewBox="0 0 1 100"
        preserveAspectRatio="none"
      >
        <line
          // The <noscript> hook in layout.tsx. An ATTRIBUTE, because that rule
          // has to keep matching after any restyle — the Tailwind classes below
          // are exactly what a styling change is free to rewrite.
          data-spine-line
          className={cn(
            "fill-none stroke-2 stroke-(--spine-stroke) [stroke-linecap:round]",
            // Paired with pathLength={1} below: the line is renormalised to
            // exactly one unit, so a dasharray of 1 is an exact full length at
            // any viewport height and needs no measurement.
            "[stroke-dasharray:1]",
            // DRAWN is the default and HIDDEN is inside the motion query — the
            // same inversion the scroll reveal uses, and for the same reason.
            // Every way this can fail (reduced motion, no JS, a bundle that
            // never loads) has to land on a finished line rather than a missing
            // one. The <noscript> block in layout.tsx covers the scripts-off
            // case, which is the one combination motion-safe cannot reach.
            "[stroke-dashoffset:0] motion-safe:[stroke-dashoffset:1]",
          )}
          x1="0.5"
          y1="0"
          x2="0.5"
          y2="100"
          pathLength={1}
          // Without this the stroke is scaled by the box's y-stretch and the
          // line renders hundreds of units wide.
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
