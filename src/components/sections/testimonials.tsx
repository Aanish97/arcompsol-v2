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
import { Monogram } from "@/components/common/monogram";
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
   * WHICH quote is expanded, or null. One value, because two behaviours read it
   * and they must agree:
   *
   *   - the quote itself renders clamped or full;
   *   - it clears on slide change, because the slides are a flex row and all
   *     take the height of the tallest — one open quote leaves every other
   *     slide stretched with a slab of empty space under its text (measured at
   *     390px: 354px collapsed, 514px with one open).
   *
   * It USED to have a third reader: autoplay held while a quote was open, so
   * the carousel could not move out from under someone mid-sentence. There is
   * no autoplay now (see the call site below), so that reason is gone — but the
   * height problem above is not, and it is why this still lives here rather
   * than inside each quote.
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
    <Section
      aria-labelledby="testimonials-heading"
      width="wide"
      className="bg-surface"
    >
      <div className="w-full max-w-4xl">
        <Reveal className="flex w-full flex-col items-start">
          {/* The reference this was built from showed the label in a bright
              teal. It is --brand deep forest instead, on purpose: at 12px the
              eyebrow counts as small text, which WCAG holds to 4.5:1, and the
              bright greens in this brand do not reach it on paper — the logo
              green measures 2.62:1 on --surface. --brand measures 8.36:1 here.
              Measured, not estimated. Do not swap it for a lighter green. */}
          <SectionEyebrow align="start">
            {TESTIMONIALS_SECTION.eyebrow}
          </SectionEyebrow>
          <SectionHeading id="testimonials-heading" align="start">
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
                {/* A shadow, so the card sits ON the band rather than being a
                    grey rectangle cut into it. --surface-alt against the
                    section's --surface is only 3.4 L* points; the border alone
                    was carrying the whole separation and the card read as a
                    fill, not an object. Same depth the services panel uses. */}
                <Card className="relative h-full overflow-hidden rounded-2xl border-border bg-surface-alt p-0 shadow-[0_4px_24px_rgb(var(--shadow-tint)/0.06)]">
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
                  {/* 13rem, up from 11. "Executive Director @ Linux Foundation"
                      broke across three lines in 176px — the longest and most
                      valuable attribution on the site, set as the most awkward.
                      208px takes it to two, and the quote column loses 32px it
                      does not miss at a 65ch cap. Measure against the LONGEST
                      organisation string, not the average. */}
                  <CardContent className="grid gap-6 p-6 pl-8 md:p-9 md:pl-11 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:items-start lg:gap-9">
                    {/* <figure> is what makes <figcaption> legal — a
                          figcaption with no figure ancestor is invalid and
                          lands nowhere in the accessibility tree. `lg:contents`
                          keeps the two-column grid above, where the caption and
                          the quote are the grid's own children. */}
                    <figure className="grid gap-6 lg:contents">
                      <figcaption className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
                        {/* A PORTRAIT WHERE WE HAVE ONE, INITIALS WHERE WE DO
                            NOT. Two of these five used to point at a shared
                            Placeholder.png — a generic silhouette beside the
                            real name and real employer of a real person, on the
                            one section of the site whose entire job is
                            credibility.

                            width/height raised to 64 to match the rendered
                            lg:size-16. At 56 the browser was upscaling a 56px
                            source into a 64px box on every desktop view — the
                            one image on this card, and it was the soft one.
                            A ring plus an offset in the card's own colour, so
                            the portrait reads as inset into the card rather
                            than pasted onto it; <Monogram> repeats that ring
                            verbatim so the two sit identically in the row. */}
                        {testimonial.avatar ? (
                          <Image
                            src={testimonial.avatar}
                            alt=""
                            width={64}
                            height={64}
                            className="size-12 shrink-0 rounded-full object-cover ring-2 ring-brand/25 ring-offset-2 ring-offset-surface-alt lg:size-16"
                          />
                        ) : (
                          <Monogram name={testimonial.name} />
                        )}
                        <div>
                          {/* font-heading: this is the name of a real person at
                              a named company and it is the strongest asset on
                              the page. It was set in body weight at body size,
                              indistinguishable from the role beneath it. */}
                          <p className="font-heading text-base font-semibold text-ink">
                            {testimonial.name}
                          </p>
                          {/* --ink-muted, not --ink-soft, and leading-snug: the
                              role is support for the name, and at the same
                              colour the two lines competed. 5.83:1 on
                              --surface, comfortably past AA. */}
                          <p className="mt-1 text-sm leading-snug text-ink-muted">
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
                          at --ink-soft (9.88:1) rather than the original
                          --ink-muted (5.83:1): both pass, and six sentences are
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
          {/* 7s, at the owner's request (2026-08-13).

              `pausable` COMES WITH IT AND IS NOT OPTIONAL — see WCAG 2.2.2 in
              carousel-controls.tsx. The timer and the button are one decision.

              KNOW THE TRADE. These quotes run 61-80 words: 18-24 seconds of
              reading at 200wpm, against a 7s interval. A reader who is neither
              hovering nor focused — which is most touch readers — will lose a
              quote about a third of the way in. That is the cost of a timer on
              this content and it cannot be tuned away at any interval short of
              ~20s; the three mitigations are the hover/focus stop, the pause
              button, and `paused` below, which holds while a quote is expanded
              so nobody is moved off a sentence they just opened.

              If the quotes are ever shortened, revisit this. Do not shorten
              them TO suit it — they are attributed statements by named people
              (see content/testimonials.ts). */}
          <CarouselAutoplay interval={7000} paused={expandedIndex !== null} />
          <CarouselControls label="testimonial" pausable />
        </Carousel>
      </div>
    </Section>
  );
}
