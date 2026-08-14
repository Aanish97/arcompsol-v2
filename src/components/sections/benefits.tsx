"use client";

/**
 * The benefits carousel on the careers page.
 *
 * ── IN SIMPLE WORDS ──
 * What it is like to work here, three cards at a time on a laptop, one on a
 * phone, with dots showing how many more there are.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * Cards are tinted, not white. Six white cards on a white band have no edges;
 * the eye reads one undifferentiated area rather than six items. The tint is
 * what makes them count as objects.
 *
 * Deliberately NOT numbered. Numbered markers belong on content where order
 * carries meaning — the delivery process on the home page is genuinely
 * sequential, so it is numbered. Benefits are an unordered set, and numbering
 * them would assert a ranking that does not exist.
 *
 * `basis` classes on the item control how many are visible, not a JS breakpoint
 * listener, so the layout is already correct in the server-rendered HTML before
 * any JavaScript runs.
 *
 * The benefit copy in content/careers.ts contains literal "\n* " bullet
 * sequences carried over from the original data. They are split here rather
 * than cleaned in the content file, because that data is reproduced verbatim
 * from the old project on purpose.
 */
import { CarouselAutoplay } from "@/components/common/carousel-autoplay";
import { CarouselControls } from "@/components/common/carousel-controls";
import { HexField } from "@/components/common/hex-field";
import { Reveal } from "@/components/common/reveal";
import { Section, SectionHeading } from "@/components/common/section";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { BENEFITS } from "@/content/careers";

export function Benefits() {
  return (
    // LIGHT, with the honeycomb. This was briefly --brand-navy to give the
    // page a dark centre, and that put the openings band between two dark
    // grounds — the same trapped-white the home page had. The band still needs
    // to be more than a flat tint, so it takes the hex field instead: texture
    // rather than a change of ground.
    <Section
      aria-labelledby="benefits-heading"
      width="wide"
      align="start"
      // --surface, NOT --surface-alt. Qualities above and Openings below are
      // both tinted, so this made three identical bands in a row — 1,700px of
      // one colour with two headings sitting in the middle of it. The band
      // still has the honeycomb to make it its own; it does not need the tint
      // as well, and alternating is what lets the tinted ones feather.
      className="bg-surface"
      backdrop={<HexField tone="light" />}
    >
      <Reveal className="flex w-full flex-col items-start">
        <SectionHeading id="benefits-heading" align="start">
          Benefits
        </SectionHeading>
      </Reveal>

      <Carousel opts={{ loop: true, align: "start" }} className="mt-10 w-full">
        <CarouselContent className="-ml-5">
          {BENEFITS.map((item) => (
            <CarouselItem
              key={item.benefit}
              className="pl-5 md:basis-1/2 lg:basis-1/3"
            >
              {/* Opaque --surface on the tinted band, so each card is a light
                  object on a ground rather than a tint on a tint — the same
                  relationship the service tiles have with their panel. The
                  shadow is what lifts it off the honeycomb behind. */}
              <Card className="group h-full rounded-2xl border-border bg-surface p-7 shadow-[0_4px_20px_rgb(var(--shadow-tint)/0.05)] transition-[border-color,box-shadow,transform] duration-220 ease-out hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_12px_32px_rgb(var(--shadow-tint)/0.10)]">
                <CardContent className="flex h-full flex-col p-0">
                  {/* Short rule instead of an icon or a number. It marks where
                      each card starts without claiming an order the content
                      does not have, and it picks up the brand green that
                      otherwise appears only in the eyebrow.

                      GROWS BY TRANSFORM, not width. It was `transition-all`
                      with `group-hover:w-14`, which animates a LAYOUT property:
                      every hover frame re-ran layout for the card. scaleX(1.75)
                      from a left origin is the identical 32px -> 56px result on
                      the compositor. Safe on this element specifically because
                      it is 2px tall — the 1px corner radius stretches to 1.75px
                      horizontally, which is not perceptible. Do not copy the
                      scale trick onto a tall element with a visible radius. */}
                  <span
                    aria-hidden
                    className="mb-5 h-0.5 w-8 origin-left rounded-full bg-gradient-to-r from-brand to-brand-deep transition-transform duration-220 ease-out group-hover:scale-x-175"
                  />
                  <h3 className="text-ink">{item.benefit.trim()}</h3>
                  <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink-muted">
                    {item.description
                      .split("\n")
                      .map((line) => line.replace(/^\*\s*/, "").trim())
                      .filter(Boolean)
                      .map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* 5s, at the owner's request (2026-08-13).

            `pausable` COMES WITH IT AND IS NOT OPTIONAL. WCAG 2.2.2: anything
            that moves on its own for more than five seconds needs a control
            that stops it, and pause-on-hover does not count — it cannot be
            reached from a keyboard or announced to a screen reader. The timer
            and the button are one decision; do not restore one without the
            other.

            Know the trade being made: the longest benefit runs ~40 words, about
            12s of reading, so 5s will take a card away from someone still on
            it. Autoplay still stops on hover, focus, drag, off-screen and
            hidden tab, so it mostly affects a reader who is neither hovering
            nor focused — a touch reader. The pause button is their way out. */}
        <CarouselAutoplay interval={5000} />
        <CarouselControls label="benefit" pausable />
      </Carousel>
    </Section>
  );
}
