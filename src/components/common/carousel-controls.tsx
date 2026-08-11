"use client";

/**
 * Position indicator and navigation for a carousel. Must be rendered inside
 * a <Carousel>.
 *
 * ── IN SIMPLE WORDS ──
 * A row of dots showing how many items there are and which one you are on,
 * plus back and forward buttons. Clicking a dot jumps straight to that item.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The previous carousels had `CarouselPrevious`/`CarouselNext` marked
 * `hidden md:flex`. On a phone — where most people meet a marketing site —
 * there was no visible control at all and no indication more items existed.
 * Drag worked, but nothing on screen said so. These controls are visible at
 * every width for exactly that reason.
 *
 * The dots are real <button>s, not decorative spans. They are the only way to
 * reach item five without pressing next four times, and a keyboard user gets
 * the same jump a mouse user does.
 *
 * State is read from embla rather than counted from the item list, because
 * `scrollSnapList()` accounts for how many items are visible at once — the
 * benefits carousel shows three per view, so six items are four snap positions,
 * not six. Counting children would render two dots that go nowhere.
 *
 * ── DO NOT ──
 * - Do not drop the `api.off` cleanup. Reveal-heavy pages mount and unmount
 *   these; leaked listeners fire on a disposed component and set state after
 *   unmount.
 */
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCarousel } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export function CarouselControls({
  label,
  className,
}: {
  /** Names what is being paged, for screen readers: "testimonial", "benefit". */
  label: string;
  className?: string;
}) {
  const { api, scrollPrev, scrollNext } = useCarousel();
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const sync = useCallback(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    setSnapCount(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api, sync]);

  return (
    <div
      className={cn(
        "mt-8 flex w-full items-center justify-between gap-6",
        className,
      )}
    >
      <div className="flex items-center">
        {Array.from({ length: snapCount }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to ${label} ${index + 1}`}
            aria-current={index === selected}
            // The BUTTON is 44px tall with the bar drawn inside it, rather than
            // the button being the bar. A 6x6px dot is a 1.9% hit area against
            // the 44x44 minimum — reachable with a mouse, a lottery on a phone.
            // grid+place-items keeps the bar optically centred in the padding.
            className={cn(
              "group/dot grid h-11 min-w-11 cursor-pointer place-items-center",
              "focus-visible:rounded focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "block h-1.5 rounded-full transition-all duration-300",
                index === selected
                  ? "w-8 bg-gradient-to-r from-brand to-brand-deep"
                  : "w-1.5 bg-ink/20 group-hover/dot:bg-ink/40",
              )}
            />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={scrollPrev}
          aria-label={`Previous ${label}`}
          className="size-11 rounded-full"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={scrollNext}
          aria-label={`Next ${label}`}
          className="size-11 rounded-full"
        >
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
