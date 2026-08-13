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
 * THE PAUSE BUTTON is rendered when `pausable` is set. NO CALLER CURRENTLY
 * SETS IT — both carousels dropped it by owner decision on 2026-08-12, so this
 * branch is dormant rather than dead, kept as the one-word way back.
 *
 * It is a WCAG 2.2.2 requirement, not a nicety: content that advances on its
 * own for more than five seconds needs a control that stops it, and
 * pause-on-hover does not count — it cannot be reached from a keyboard or
 * announced to a screen reader. Both carousels autoplay at 6s and therefore
 * currently fail that criterion; see the comments at their call sites.
 *
 * It writes `data-autoplay-paused` onto the carousel root rather than lifting
 * state, because the timer lives in a sibling component. See carousel-autoplay.
 *
 * If autoplay is ever removed, remove this control in the same change.
 *
 * ── DO NOT ──
 * - Do not drop the `api.off` cleanup. Reveal-heavy pages mount and unmount
 *   these; leaked listeners fire on a disposed component and set state after
 *   unmount.
 */
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCarousel } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export function CarouselControls({
  label,
  pausable = false,
  className,
}: {
  /** Names what is being paged, for screen readers: "testimonial", "benefit". */
  label: string;
  /** Set wherever a CarouselAutoplay is rendered. Required for WCAG 2.2.2. */
  pausable?: boolean;
  className?: string;
}) {
  const { api, scrollPrev, scrollNext } = useCarousel();
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [paused, setPaused] = useState(false);

  const togglePaused = useCallback(() => {
    if (!api) return;
    setPaused((wasPaused) => {
      const next = !wasPaused;
      api.rootNode().dataset.autoplayPaused = String(next);
      return next;
    });
  }, [api]);

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
        // WRAPS. Once the pause button joined prev/next there were three 44px
        // targets plus up to six 44px dots, and at 390px that row needed 392px
        // inside 342px of content width — 26px of horizontal page scroll on a
        // phone. flex-wrap drops the button group onto its own line instead of
        // pushing the document wider. Re-measure at 390px before adding a
        // fourth control; this row has no slack left.
        "mt-8 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-4",
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
                "block h-1.5 rounded-full transition-[width,background-color] duration-300",
                index === selected
                  ? "w-8 bg-gradient-to-r from-brand to-brand-deep"
                  : "w-1.5 bg-ink/20 group-hover/dot:bg-ink/40",
              )}
            />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {pausable && (
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            onClick={togglePaused}
            aria-label={paused ? `Play ${label}s` : `Pause ${label}s`}
            aria-pressed={paused}
            className="size-11 rounded-full"
          >
            {paused ? (
              <Play className="size-4" />
            ) : (
              <Pause className="size-4" />
            )}
          </Button>
        )}
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
