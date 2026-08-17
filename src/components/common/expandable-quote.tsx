"use client";

/**
 * A testimonial quote, clamped on phones and opened in place.
 *
 * THE FULL QUOTE IS ALWAYS IN THE HTML — the clamp is CSS (`line-clamp-6
 * md:line-clamp-none`), never a substring. These are attributed statements, so
 * truncating the markup would hide half of what someone put their name to and
 * take it from search engines and screen readers as well.
 *
 * THE BUTTON RENDERS ONLY WHEN THE TEXT ACTUALLY OVERFLOWS, measured after
 * mount by comparing scrollHeight to clientHeight — a "Read more" that expands
 * nothing is worse than none. `overflows` starts false so the server HTML and
 * the first client render agree; measuring during render would mismatch and
 * React would throw the tree away. The button appears a frame later.
 */
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
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
   * CONTROLLED by the carousel, because two behaviours outside this component
   * need the answer: the slides are a flex row and all take the height of the
   * tallest, so one open quote stretches every other slide (354px → 514px at
   * 390px, measured); and autoplay holds while a quote is open, so nobody is
   * moved off a sentence they just opened.
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
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={onToggle}
          aria-expanded={expanded}
          // min-h-11 CORRECTS size="sm", which is h-7. This is `md:hidden`, so
          // it exists only on phones — the one place 44px is not optional.
          // px-0 drops sm's padding so the label keeps the quote's left edge.
          className="mt-3 min-h-11 px-0 text-brand hover:text-brand-deep md:hidden"
        >
          {expanded ? "Show less" : "Read more"}
        </Button>
      ) : null}
    </div>
  );
}
