"use client";

/**
 * A testimonial quote that is clamped on phones and opened with a button.
 *
 * ── IN SIMPLE WORDS ──
 * These quotes run 60–100 words each. On a laptop that is a comfortable
 * paragraph; on a phone it is eleven lines, and five of them in a row turn the
 * page into a wall of text nobody scrolls to the end of. So on a phone each
 * quote shows its first few lines with a "Read more" underneath, and opens in
 * place when tapped. On a tablet and up the whole quote is simply shown.
 *
 * ── BUSINESS RULES ──
 * - The full quote is ALWAYS in the HTML. Clamping is visual only. These are
 *   attributed statements by named people; truncating them in the markup would
 *   hide half of what someone put their name to, and would take it away from
 *   search engines and screen readers too.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The button renders only when the text actually overflows its clamp, measured
 * after mount by comparing scrollHeight to clientHeight. A "Read more" that
 * expands nothing is worse than no button, and a future testimonial short
 * enough to fit would get one otherwise.
 *
 * `overflows` starts false so the server HTML and the first client render
 * agree — measuring during render would mismatch and React would discard the
 * tree. The button appears one frame later, which is invisible in practice.
 *
 * The clamp is CSS (`line-clamp-6 md:line-clamp-none`), not a substring. That
 * is what keeps the full text in the DOM, and it means the breakpoint is
 * handled by the stylesheet rather than by a resize listener that would run on
 * every frame of an orientation change.
 *
 * ── DO NOT ──
 * - Do not slice the string to a character count. It cuts mid-word, it cannot
 *   know the viewport, and it removes the text from the accessibility tree.
 * - Do not clamp the featured quote. Someone reached this page by tapping that
 *   specific one; hiding it behind a button is the one thing the click asked
 *   not to happen.
 */
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function ExpandableQuote({
  text,
  className,
  expanded,
  onToggle,
}: {
  text: string;
  className?: string;
  /**
   * CONTROLLED by the carousel, not held here, because two other behaviours
   * depend on knowing whether a quote is open:
   *
   *   1. The slides are a flex row and therefore all as tall as the TALLEST.
   *      One open quote stretches every other slide to match, so swiping to a
   *      collapsed one shows a card with a slab of empty space under its text.
   *      Measured at 390px: 354px collapsed, 514px with one quote open, and
   *      the others stay 514 until it closes. The carousel clears this on
   *      slide change to keep the track one height.
   *   2. Autoplay must not advance while a quote is open. Someone who tapped
   *      "Read more" is mid-sentence; moving the carousel under them is the
   *      worst possible moment to do it.
   *
   * Both need the answer OUTSIDE this component, so the state lives there and
   * this renders what it is told.
   */
  expanded: boolean;
  onToggle: () => void;
}) {
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const node = quoteRef.current;
    if (!node) return;

    const measure = () => {
      // Only meaningful while the clamp is applied. Once expanded the two are
      // equal by definition, so keep whatever the first measurement found.
      if (expanded) return;
      setOverflows(node.scrollHeight > node.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [expanded]);

  return (
    <div>
      <blockquote
        ref={quoteRef}
        className={cn(
          "measure text-base leading-relaxed text-ink-soft",
          !expanded && "line-clamp-6 md:line-clamp-none",
          className,
        )}
      >
        {text}
      </blockquote>

      {overflows ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="mt-3 inline-flex min-h-11 items-center rounded-md text-sm font-medium text-brand transition-colors hover:text-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none md:hidden"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}
