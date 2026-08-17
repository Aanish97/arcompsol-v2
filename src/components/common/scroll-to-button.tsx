"use client";

/**
 * A button that scrolls to a section of the current page.
 *
 * ── IN SIMPLE WORDS ──
 * Click it and the page glides down to the part it names.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * Not a plain <a href="#id">, because #services exists only on the home page.
 * A native hash link against a missing id does nothing at all, silently, and on
 * a Next route that has not finished painting it can jump to a stale offset
 * instead. scrollToId's getElementById guard no-ops safely, which is the
 * difference between a CTA that does nothing visible and one that scrolls
 * somewhere wrong.
 *
 * #contact-form USED TO BE THE OTHER CASE and no longer is. The id sat on the
 * <form>, inside a next/dynamic ssr:false chunk, so it was in no page's server
 * HTML and this button did nothing for the first ~1036ms of every page view.
 * It moved to a server-rendered wrapper in site-footer.tsx on 2026-08-17 and is
 * now present from first paint. Do not "simplify" this back to a hash link on
 * the strength of that: #services is still missing on two routes.
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
    <Button
      {...props}
      // The destination, in the DOM. A <button> carries no href, so a listener
      // watching for people heading somewhere cannot see this one at all —
      // contact-form-lazy.tsx uses it to start fetching the form chunk on the
      // same tick the scroll starts. Generic on purpose: it states where the
      // button goes and names no particular consumer, so nothing here has to
      // know the contact form exists.
      data-scroll-target={targetId}
      onClick={() => scrollToId(targetId)}
    >
      {children}
    </Button>
  );
}
