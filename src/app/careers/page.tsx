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
      <Section width="wide" className="bg-hero-glow">
        <SectionEyebrow>Join us</SectionEyebrow>
        <SectionHeading as="h1" tone="brand">
          {CAREERS_HERO.title}
        </SectionHeading>
        <p className="mt-6 text-center text-xl font-medium text-brand-deep md:text-2xl">
          {CAREERS_HERO.heading}
        </p>
        <SectionDescription className="mt-4">
          {CAREERS_HERO.description}
        </SectionDescription>
        <div className="mt-10">
          <ScrollToButton targetId="openings" variant="brand" size="brand-lg">
            {CAREERS_HERO.cta}
          </ScrollToButton>
        </div>
      </Section>

      <Section
        id="work-with-us"
        width="wide"
        align="start"
        className="scroll-mt-20 bg-surface-alt"
      >
        <Reveal className="flex w-full flex-col items-start">
          <SectionHeading tone="brand" align="start">
            {WORK_WITH_US.title}
          </SectionHeading>
          <SectionDescription tone="brand" align="start" className="mt-4">
            {WORK_WITH_US.description}
          </SectionDescription>
        </Reveal>

        <div className="mt-12 grid w-full gap-6 md:grid-cols-3">
          {QUALITIES.map((quality, index) => (
            <Reveal key={quality.heading} delay={index * 60} className="h-full">
              <ValueCard
                heading={quality.heading}
                description={quality.description}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      <Benefits />

      <Section
        id="openings"
        width="wide"
        align="start"
        className="scroll-mt-20 bg-surface-alt"
      >
        <Reveal className="flex w-full flex-col items-start">
          <SectionHeading align="start">
            {OPENINGS_SECTION.title}
          </SectionHeading>
          <SectionDescription align="start" className="mt-4">
            {OPENINGS_SECTION.subtitle}
          </SectionDescription>
        </Reveal>

        <div className="mt-12 grid w-full gap-6 md:grid-cols-3">
          {CURRENT_OPENINGS.map((job, index) => (
            <Reveal key={job.id} delay={index * 60} className="h-full">
              <JobCard
                title={job.title}
                team={job.team}
                location={job.location}
                description={job.description}
              />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
