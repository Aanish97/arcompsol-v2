/**
 * About page: hero over the office photo, the five values, and the process.
 *
 * The hero photograph is applied as a CSS background with a white gradient
 * washed over it, matching the original. It is decorative and carries no
 * information, so it stays a background rather than an <Image> — a screen
 * reader has nothing useful to announce for it.
 *
 * Fully static: no client component on this route.
 */
import type { Metadata } from "next";

import { ValueCard } from "@/components/common/cards";
import { Reveal } from "@/components/common/reveal";
import {
  Section,
  SectionDescription,
  SectionEyebrow,
  SectionHeading,
} from "@/components/common/section";
import { Milestones } from "@/components/sections/milestones";
import { ABOUT_HERO, VALUES, WHO_WE_ARE } from "@/content/about";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us",
  description: ABOUT_HERO.description,
};

export default function AboutPage() {
  return (
    <>
      <Section
        aria-labelledby="about-hero-heading"
        width="wide"
        // The photo band is a named class in globals.css, not an arbitrary
        // value here. It was three colour literals inline — including the
        // PREVIOUS brand green — which no palette sweep could reach, so the
        // band silently kept the old theme. See .about-hero.
        className="about-hero relative"
        // The heading rises word by word on LOAD, like the home hero's. Both
        // secondary heroes had no arrival at all: they are above the fold so
        // they cannot wait for an observer, and nothing else was animating
        // them, so the page simply appeared. `load` rises WITHOUT fading —
        // above-the-fold copy must be legible from the first frame.
        data-stagger="load"
      >
        <SectionEyebrow>Who we are</SectionEyebrow>
        <SectionHeading id="about-hero-heading" as="h1" tone="brand">
          {ABOUT_HERO.title}
        </SectionHeading>
        <SectionDescription className="mt-6">
          {ABOUT_HERO.description}
        </SectionDescription>
      </Section>

      {/* --surface, NOT --surface-alt. The milestones band below is
          --surface-alt too, so the two ran together as one 2,440px slab with
          nothing marking where the values ended and the process began. Bands
          are what give a page its rhythm; two of the same colour in a row are
          one band with a heading in the middle of it. */}
      <Section
        aria-labelledby="who-we-are-heading"
        width="wide"
        align="start"
        className="bg-surface"
      >
        <Reveal className="flex w-full flex-col items-start">
          <SectionHeading id="who-we-are-heading" tone="brand" align="start">
            {WHO_WE_ARE.title}
          </SectionHeading>
          <SectionDescription tone="brand" align="start" className="mt-4">
            {WHO_WE_ARE.description}
          </SectionDescription>
        </Reveal>

        {/* A list: five values, and a screen reader should say so before
            reading them. <Reveal> renders the <li> itself rather than sitting
            inside one, so nothing comes between the <ul> and its items —
            a wrapper there makes the list have zero children. */}
        <ul className="mt-12 grid w-full gap-6 md:grid-cols-3">
          {VALUES.map((value, index) => (
            <Reveal
              key={value.heading}
              as="li"
              delay={index * 60}
              className={cn("h-full", index === 0 && "md:col-span-2")}
            >
              <ValueCard
                heading={value.heading}
                description={value.description}
                featured={index === 0}
              />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Milestones />
    </>
  );
}
