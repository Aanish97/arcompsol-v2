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
        width="wide"
        className="relative bg-[radial-gradient(60%_60%_at_50%_0%,rgba(31,95,75,0.16)_0%,transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.96)_100%),url('/images/pexels-photo-by-sora-shimazaki.jpg')] bg-cover bg-center bg-no-repeat"
      >
        <SectionEyebrow>Who we are</SectionEyebrow>
        <SectionHeading as="h1" tone="brand">
          {ABOUT_HERO.title}
        </SectionHeading>
        <SectionDescription className="mt-6">
          {ABOUT_HERO.description}
        </SectionDescription>
      </Section>

      <Section width="wide" align="start" className="bg-surface-alt">
        <Reveal className="flex w-full flex-col items-start">
          <SectionHeading tone="brand" align="start">
            {WHO_WE_ARE.title}
          </SectionHeading>
          <SectionDescription tone="brand" align="start" className="mt-4">
            {WHO_WE_ARE.description}
          </SectionDescription>
        </Reveal>

        <div className="mt-12 grid w-full gap-6 md:grid-cols-3">
          {VALUES.map((value, index) => (
            <Reveal
              key={value.heading}
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
        </div>
      </Section>

      <Milestones />
    </>
  );
}
