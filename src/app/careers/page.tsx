/**
 * Careers page: hero, the three qualities we look for, benefits, and openings.
 *
 * ── BUSINESS RULES ──
 * - Arriving at /careers?vision scrolls to #work-with-us, then the URL is
 *   rewritten to /careers after 5s. Carried over from the original; it exists
 *   so a campaign link can deep-link into that section.
 * - "Explore Opportunities" scrolls to #openings.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * searchParams is read HERE, on the server, and handed to VisionScroll as a
 * boolean. Reading it on the client with useSearchParams would force the whole
 * route out of static rendering.
 *
 * Both anchor targets carry scroll-mt-20 so the sticky header does not cover
 * the heading you just scrolled to — without it the section lands underneath
 * the header and looks like it scrolled to the wrong place.
 */
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { JobCard, ValueCard } from "@/components/common/cards";
import { Reveal } from "@/components/common/reveal";
import {
  Section,
  SectionDescription,
  SectionEyebrow,
  SectionHeading,
} from "@/components/common/section";
import { Benefits } from "@/components/sections/benefits";
import { ScrollToButton } from "@/components/common/scroll-to-button";
import { VisionScroll } from "@/components/sections/careers-interactions";
import {
  CAREERS_HERO,
  CURRENT_OPENINGS,
  OPENINGS_SECTION,
  QUALITIES,
  WORK_WITH_US,
} from "@/content/careers";

export const metadata: Metadata = {
  title: "Careers",
  description: CAREERS_HERO.description,
};

export default async function CareersPage({
  searchParams,
}: PageProps<"/careers">) {
  const params = await searchParams;

  return (
    <>
      <VisionScroll hasVision={params.vision !== undefined} />

      {/* width="wide" like every other band on the site. This was the only
          section left on the default "narrow" (1024px), so the careers hero
          sat 128px narrower than the three sections beneath it and the header
          above it. Nothing announces a container that changes width; it just
          reads as slightly wrong. */}
      {/* data-stagger="load": the heading rises word by word on load, matching
          the home hero. See the note on the about hero. */}
      <Section
        aria-labelledby="careers-hero-heading"
        width="wide"
        className="bg-hero-glow"
        data-stagger="load"
      >
        <SectionEyebrow>Join us</SectionEyebrow>
        <SectionHeading id="careers-hero-heading" as="h1" tone="brand">
          {CAREERS_HERO.title}
        </SectionHeading>
        <p className="mt-6 text-center text-xl font-medium text-brand-deep md:text-2xl">
          {CAREERS_HERO.heading}
        </p>
        <SectionDescription className="mt-4">
          {CAREERS_HERO.description}
        </SectionDescription>
        <div className="mt-10">
          <ScrollToButton
            targetId="openings"
            variant="brand"
            size="brand-lg"
            className="group"
          >
            {/* THE COUNT IS IN THE BUTTON, not in a badge beside it.
                This was a rounded pill with a coloured dot reading "3 open
                roles" — the status-badge shape that every generated landing
                page reaches for, and it read as one. Worse, it split one idea
                across two elements: a fact sitting next to a button that
                repeated it in vaguer words.

                The button now carries both. It is the thing that takes you to
                the list, so it should say what is in the list — and a visitor
                learns the number from the control they were going to press
                anyway, instead of from decoration above it.

                Falls back to the written CTA at zero, rather than offering to
                explore nothing. */}
            {CURRENT_OPENINGS.length > 0
              ? `Explore ${CURRENT_OPENINGS.length} open ${
                  CURRENT_OPENINGS.length === 1 ? "role" : "roles"
                }`
              : CAREERS_HERO.cta}
            {/* The same arrow the home hero's primary CTA carries, sliding on
                hover. Both are the one green button on their page; they should
                behave identically. */}
            <ArrowRight className="transition-transform duration-220 ease-out group-hover:translate-x-0.5" />
          </ScrollToButton>
        </div>
      </Section>

      <Section
        id="work-with-us"
        aria-labelledby="work-with-us-heading"
        width="wide"
        align="start"
        className="band-soft scroll-mt-20"
      >
        <Reveal className="flex w-full flex-col items-start">
          <SectionHeading id="work-with-us-heading" tone="brand" align="start">
            {WORK_WITH_US.title}
          </SectionHeading>
          <SectionDescription tone="brand" align="start" className="mt-4">
            {WORK_WITH_US.description}
          </SectionDescription>
        </Reveal>

        <ul className="mt-12 grid w-full gap-6 md:grid-cols-3">
          {QUALITIES.map((quality, index) => (
            <Reveal
              key={quality.heading}
              as="li"
              delay={index * 60}
              className="h-full"
            >
              <ValueCard
                heading={quality.heading}
                description={quality.description}
              />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Benefits />

      <Section
        id="openings"
        aria-labelledby="openings-heading"
        width="wide"
        align="start"
        className="band-soft scroll-mt-20"
      >
        <Reveal className="flex w-full flex-col items-start">
          <SectionHeading id="openings-heading" align="start">
            {OPENINGS_SECTION.title}
          </SectionHeading>
          <SectionDescription align="start" className="mt-4">
            {OPENINGS_SECTION.subtitle}
          </SectionDescription>
        </Reveal>

        <ul className="mt-12 grid w-full gap-6 md:grid-cols-3">
          {CURRENT_OPENINGS.map((job, index) => (
            <Reveal key={job.id} as="li" delay={index * 60} className="h-full">
              <JobCard
                title={job.title}
                team={job.team}
                location={job.location}
                description={job.description}
              />
            </Reveal>
          ))}
        </ul>
      </Section>
    </>
  );
}
