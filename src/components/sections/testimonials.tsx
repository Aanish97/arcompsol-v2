"use client";

/**
 * Client testimonials carousel.
 *
 * ── IN SIMPLE WORDS ──
 * One client quote at a time. Who said it comes first — face, name, and where
 * they work — then what they said.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * Attribution leads. These quotes run 400–600 characters and the names attached
 * to them are the strongest asset on the site — an Executive Director at the
 * Linux Foundation, a Customer Success Manager at ModMed. The previous layout
 * centred the text and put the face underneath it, so a reader met an anonymous
 * wall of prose and only learned whose opinion it was if they finished. Reading
 * a recommendation is a different act when you already know who is speaking.
 *
 * The gradient rule down the left edge is the typographic convention for a
 * blockquote, doing the job an oversized decorative quote glyph usually does —
 * except it also gives the card a visible edge on a white band, which the plain
 * bordered box did not have.
 *
 * Text is left-aligned and capped by `measure`. Centred text forces the eye to
 * find a new left edge on every line; that is tolerable for a headline and
 * genuinely tiring for six sentences.
 *
 * ── DO NOT ──
 * - Do not remove `loop`. With five items and both arrows always visible, a
 *   non-looping carousel disables an arrow at each end, which reads as broken
 *   rather than as a boundary.
 * - Do not re-centre the quote text. See above; the measure is set for a left
 *   edge.
 */
import Image from "next/image";
import { useEffect, useState } from "react";

import { CarouselAutoplay } from "@/components/common/carousel-autoplay";
import { CarouselControls } from "@/components/common/carousel-controls";
import { ExpandableQuote } from "@/components/common/expandable-quote";
import { Reveal } from "@/components/common/reveal";
import {
  Section,
  SectionEyebrow,
  SectionHeading,
} from "@/components/common/section";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { TESTIMONIALS, TESTIMONIALS_SECTION } from "@/content/testimonials";

/*
 * ONE max-w-4xl COLUMN, centred on the page, with everything inside it aligned
 * left. Both halves of that matter and they are easy to confuse:
 *
 * The COLUMN is centred because the carousel is max-w-4xl inside a max-w-6xl
 * container. Pinning it left leaves all 256px of the difference down one side,
 * which reads as lopsided rather than as narrow; centred it is 128px a side and
 * reads as a deliberate inset.
 *
 * The CONTENTS are left-aligned. The heading has to
 * share the carousel's column to do that — hung on the max-w-6xl container it
 * would start 128px outside the card's left edge and read as a mistake rather
 * than as an alignment. That shared column is the whole reason for the wrapper
 * div; do not flatten it back into two siblings of Section.
 */
export function Testimonials() {
  const [api, setApi] = useState<CarouselApi>();

  /**
   * WHICH quote is expanded, or null. One value, because three behaviours read
   * it and they must agree:
   *
   *   - the quote itself renders clamped or full;
   *   - autoplay holds while anything is open, so the carousel never moves out
   *     from under someone who is mid-sentence;
   *   - it clears on slide change, because the slides are a flex row and all
   *     take the height of the tallest — one open quote leaves every other
   *     slide stretched with a slab of empty space under its text (measured at
   *     390px: 354px collapsed, 514px with one open).
   *
   * Held here rather than inside each quote so autoplay can see it at all.
   */
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setExpandedIndex(null);
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <Section width="wide" className="bg-surface">
      <div className="w-full max-w-4xl">
        <Reveal className="flex w-full flex-col items-start">
          {/* The reference this was built from showed the label in a bright
              teal. It is --brand deep forest instead, on purpose: at 12px the
              eyebrow counts as small text, which WCAG holds to 4.5:1, and the
              bright greens in this brand do not reach it on paper — the logo
              green measures 2.59:1 on --surface. --brand measures 7.19:1 here.
              Measured, not estimated. Do not swap it for a lighter green. */}
          <SectionEyebrow>{TESTIMONIALS_SECTION.eyebrow}</SectionEyebrow>
          <SectionHeading align="start">
            {TESTIMONIALS_SECTION.title}
          </SectionHeading>
        </Reveal>

        {/* w-full of the max-w-4xl column above, NOT of the 1152 container.
            Every other band on the page runs edge to edge; a single quote at
            that width reads as another section rather than as something
            someone said. Narrower also means fewer characters per line at the
            same type size. */}
        <Carousel
          setApi={setApi}
          opts={{ loop: true, align: "start" }}
          className="mt-10 w-full"
        >
          <CarouselContent>
            {TESTIMONIALS.map((testimonial, index) => (
              <CarouselItem key={testimonial.name}>
                <Card className="relative h-full overflow-hidden rounded-2xl border-border bg-surface-alt p-0">
                  {/* Blockquote rule. Structural, not ornamental: it marks the
                    whole card as quoted matter and gives it an edge against
                    the white band behind it. */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand to-brand-deep"
                  />

                  {/* TWO COLUMNS at lg, attribution beside the quote rather than
                    above it. The card spans the full carousel width — 1088px at
                    1920 — while the quote is capped at 65ch, so 363px down the
                    right of every card was empty. The cap is right and stays:
                    unpinned, the same quote runs ~105 characters a line. The
                    space had to be USED, not reclaimed by widening the text,
                    and the attribution is the thing most worth putting in it.

                    Collapses to the original stack below lg, where 260px of
                    sidebar plus a readable measure will not fit side by side.

                    items-start, because the full quote is the taller column and
                    both should read from the same top edge. It was briefly
                    items-center while the cards showed ~20-word excerpts, where
                    the attribution column was the taller of the two. If the
                    excerpts ever come back, that swaps again. */}
                  <CardContent className="grid gap-6 p-6 pl-8 md:p-9 md:pl-11 lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] lg:items-start lg:gap-9">
                    {/* <figure> is what makes <figcaption> legal — a
                          figcaption with no figure ancestor is invalid and
                          lands nowhere in the accessibility tree. `lg:contents`
                          keeps the two-column grid above, where the caption and
                          the quote are the grid's own children. */}
                    <figure className="grid gap-6 lg:contents">
                      <figcaption className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
                        <Image
                          src={testimonial.avatar}
                          alt=""
                          width={56}
                          height={56}
                          className="size-12 shrink-0 rounded-full object-cover ring-2 ring-brand/20 lg:size-16"
                        />
                        <div>
                          <p className="font-semibold text-ink">
                            {testimonial.name}
                          </p>
                          <p className="mt-0.5 text-sm text-ink-soft">
                            {testimonial.organization}
                          </p>
                        </div>
                      </figcaption>

                      <div>
                        {/* BODY COPY scale, because the full quotes run 61-80
                          words. This was briefly text-lg/md:text-xl while the
                          cards showed ~20-word excerpts, where the quote was a
                          pull quote and had to carry the band. At full length
                          that size is a wall of 20px text six lines deep. Kept
                          at --ink-soft (9.84:1) rather than the original
                          --ink-muted (6.90:1): both pass, and six sentences are
                          worth the extra contrast.

                          CLAMPED ON PHONES. At 390px the full quote runs about
                          eleven lines, which is most of the screen for one of
                          six slides and pushes the carousel's own controls
                          below the fold. The full text stays in the DOM — this
                          is a visual clamp, and these are attributed statements
                          that must remain readable to search engines and screen
                          readers. */}
                        {/* EXPANDS IN PLACE, because there is nowhere to send
                            anyone. The carousel is the only place these quotes
                            appear, so a clamp without an expander would cut
                            them off with no way to finish reading. Keeps the
                            phone length down and gives the rest back on tap.
                            Full text stays in the DOM either way. */}
                        <ExpandableQuote
                          text={testimonial.text}
                          className="md:text-lg"
                          expanded={expandedIndex === index}
                          onToggle={() =>
                            setExpandedIndex(
                              expandedIndex === index ? null : index,
                            )
                          }
                        />
                      </div>
                    </figure>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselAutoplay interval={6000} paused={expandedIndex !== null} />
          {/* No `pausable`: the play/pause button is removed by owner decision
              (2026-08-12). Autoplay still stops on hover, focus, drag, when the
              section is off-screen, when the tab is hidden, and under
              prefers-reduced-motion — see carousel-autoplay.tsx. Note this
              leaves no explicit pause control for a 6s auto-advance, which is
              what WCAG 2.2.2 asks for; the focus-stop is the closest thing that
              remains. Restore `pausable` to put it back. */}
          <CarouselControls label="testimonial" />
        </Carousel>
      </div>
    </Section>
  );
}
