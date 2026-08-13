"use client";

/**
 * A button that scrolls to a section of the current page.
 *
 * ── IN SIMPLE WORDS ──
 * Click it and the page glides down to the part it names.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * Not a plain <a href="#id">. Two of the targets on this site do not exist in
 * the document when the page first paints:
 *
 *   #contact-form  lives inside the footer form, which is loaded with
 *                  next/dynamic ssr:false — until that chunk arrives the DOM
 *                  holds a placeholder with no id at all.
 *   #services      exists only on the home page.
 *
 * A native hash link against a missing id does nothing at all, silently, and
 * on a Next route that has not finished painting it can jump to a stale
 * offset instead. getElementById + the optional-chaining call below no-ops
 * safely in both cases, which is the difference between a CTA that does
 * nothing visible and one that scrolls somewhere wrong.
 *
 * scroll-behavior: smooth is set globally in globals.css, so scrollIntoView
 * inherits the easing rather than restating it — and it is correctly ignored
 * for anyone who has asked for reduced motion, which a hand-rolled scroll
 * animation would have to remember to check.
 *
 * ── DO NOT ──
 * - Do not add `behavior: "smooth"` here. Passing it explicitly overrides the
 *   CSS, including the reduced-motion case that CSS handles for free.
 */
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { scrollToId } from "@/lib/scroll-to";

export function ScrollToButton({
  targetId,
  children,
  ...props
}: ComponentProps<typeof Button> & { targetId: string }) {
  return (
    <Button {...props} onClick={() => scrollToId(targetId)}>
      {children}
    </Button>
  );
}
