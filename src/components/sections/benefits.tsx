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
import { Reveal } from "@/components/common/reveal";
import {
  Section,
  SectionHeading,
} from "@/components/common/section";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { BENEFITS } from "@/content/careers";

export function Benefits() {
  return (
    <Section width="wide" align="start" className="bg-surface">
      <Reveal className="flex w-full flex-col items-start">
        <SectionHeading align="start">Benefits</SectionHeading>
      </Reveal>

      <Carousel opts={{ loop: true, align: "start" }} className="mt-10 w-full">
        <CarouselContent className="-ml-5">
          {BENEFITS.map((item) => (
            <CarouselItem
              key={item.benefit}
              className="pl-5 md:basis-1/2 lg:basis-1/3"
            >
              <Card className="group h-full rounded-2xl border-border bg-surface-alt p-7 transition-colors duration-300 hover:border-brand/30">
                <CardContent className="flex h-full flex-col p-0">
                  {/* Short rule instead of an icon or a number. It marks where
                      each card starts without claiming an order the content
                      does not have, and it picks up the brand green that
                      otherwise appears only in the eyebrow. */}
                  <span
                    aria-hidden
                    className="mb-5 h-0.5 w-8 rounded-full bg-gradient-to-r from-brand to-brand-deep transition-all duration-300 group-hover:w-14"
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

        {/* 4.5s, matching the testimonials. It sits far better here: three
            cards are visible at once, so an advance replaces one and leaves
            the two you were reading in place, and the longest benefit is 43
            words against a testimonial's 80. */}
        <CarouselAutoplay interval={4500} />
        <CarouselControls label="benefit" />
      </Carousel>
    </Section>
  );
}
