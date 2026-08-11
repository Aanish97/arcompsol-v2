/**
 * Home page: hero, services, the delivery process, and testimonials.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * A server component. Only the testimonials carousel and the scroll reveals are
 * interactive and they mark themselves "use client", so the hero and the
 * services grid ship as static HTML. The MUI version made the whole tree a
 * client component because styled() requires the client.
 *
 * The hero is ASYMMETRIC — copy left, image right, on lg and up. Everything on
 * this site was previously a centred column, which is what made every band look
 * like the one above it. An off-axis hero gives the page a starting point, and
 * it puts the headline against the left reading edge where the eye lands first.
 * It collapses back to centred on mobile, where two columns cannot work.
 *
 * The services grid is a BENTO layout: the first tile spans two columns and two
 * rows. Six identical tiles say all six services matter equally; the eye has no
 * entry point and skims past. Weighting the first one gives it somewhere to
 * start.
 *
 * The hero is NOT wrapped in <Reveal>. Above-the-fold content that fades in
 * reads as a slow page rather than as polish.
 *
 * ── DO NOT ──
 * - Do not let the bento tile spans apply below `md`. A two-column span inside
 *   a one-column grid silently becomes a full-width tile that is twice as tall
 *   as the rest.
 */
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { HeroGradient } from "@/components/common/hero-gradient";
import { HeroVisual } from "@/components/common/hero-visual";
import { Reveal } from "@/components/common/reveal";
import { ScrollToButton } from "@/components/common/scroll-to-button";
import { ServiceCard } from "@/components/common/service-card";
import {
  Section,
  SectionDescription,
  SectionHeading,
} from "@/components/common/section";
import { Milestones } from "@/components/sections/milestones";
import { Testimonials } from "@/components/sections/testimonials";
import { HOME_HERO, SERVICES, SERVICES_SECTION } from "@/content/home";

import heroImage from "../../public/images/home-hero-image.png";

export default function HomePage() {
  const [headStart, headAccent] = HOME_HERO.heading.split(" with ");

  return (
    <>
      {/* HeroGradient is a client component, but everything below is passed to
          it as children — so the hero copy still renders on the server and
          only the ~1.5 kB pointer handler ships. Same slot pattern as
          HeroVisual, which is why neither forces this page to "use client". */}
      <HeroGradient>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-14 md:px-8 md:py-20 lg:grid-cols-[1fr_1.08fr] lg:gap-16">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* A label on a rule, not a pill. Set at the same size and tracking
                as every SectionEyebrow down the page, so the hero opens the
                way the sections do instead of introducing a shape used
                nowhere else. The rule is lg-only: trailing a centred label it
                would hang off one side. */}
            <p className="flex items-center gap-4 text-xs font-semibold tracking-[0.18em] text-brand uppercase">
              {HOME_HERO.label}
              <span
                aria-hidden
                className="hidden h-px w-12 bg-gradient-to-r from-brand to-transparent lg:block"
              />
            </p>

            <h1 className="mt-6 text-balance">
              {headStart}{" "}
              <span className="bg-gradient-to-r from-brand to-brand-deep bg-clip-text text-transparent">
                with {headAccent}
              </span>
            </h1>

            <p className="measure mt-6 text-lg leading-relaxed text-ink-soft md:text-xl">
              {HOME_HERO.description}
            </p>

            {/* One primary, one text link. Two filled buttons of equal weight
                make the reader choose before they know enough to; the second
                action is for people not ready to talk yet, so it should look
                like the lighter option it is. */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:justify-start">
              <ScrollToButton
                targetId="contact-form"
                variant="brand"
                size="brand-lg"
                className="group"
              >
                {HOME_HERO.primaryCta}
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </ScrollToButton>

              <ScrollToButton
                targetId="services"
                variant="link"
                size="brand"
                className="px-0 text-base text-ink-soft hover:text-ink"
              >
                {HOME_HERO.secondaryCta}
              </ScrollToButton>
            </div>
          </div>

          {/* Bigger: the art column now takes 1.15fr against the copy's 1fr
              (it was the smaller half at 1fr against 1.05fr), the box is 5/4
              rather than 4/3, and -mx-4 lets it bleed past the grid gutter on
              lg. `sizes` is raised to match, or Next keeps serving the old
              560px-wide candidate into a box that is now ~660px and the
              illustration renders soft. */}
          <HeroVisual className="relative aspect-[5/4] w-full">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 680px"
              className="object-contain mix-blend-multiply"
            />
          </HeroVisual>
        </div>
      </HeroGradient>

      <Section id="services" width="wide" className="scroll-mt-20 bg-surface">
        <Reveal className="w-full">
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-border bg-secondary px-6 py-14 shadow-[0_4px_24px_rgb(var(--shadow-tint)/0.06)] md:px-10 md:py-20">
            <div aria-hidden className="bg-grid absolute inset-0" />

            <div className="relative">
              <div className="flex flex-col items-start">
                <SectionHeading align="start">
                  {SERVICES_SECTION.title}
                </SectionHeading>
                <SectionDescription align="start" className="mt-4">
                  {SERVICES_SECTION.description}
                </SectionDescription>
              </div>

              {/* Six equal tiles, two rows of three. The tiles carry their own
                  content on the back, so the grid does not have to create the
                  visual entry point on its own.

                  Grid items stretch by default, so every card in a row takes
                  the height of the tallest, which is what keeps them uniform
                  as the descriptions differ in length.

                  Three columns at lg, NOT at md. At 768px the services band is
                  inset twice — max-w-6xl padding, then the panel's own px-10 —
                  so three columns come out 195px wide, and a 139-character
                  description needs seven clipped lines in one. Two columns at
                  that width give 302px and four lines. Measure the column, not
                  the viewport. */}
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {SERVICES.map((service, index) => (
                  <Reveal
                    key={service.title}
                    delay={index * 60}
                    // h-full so the flip container inherits a real height from
                    // the grid row. Both card faces are absolutely positioned,
                    // so a wrapper of auto height would collapse them.
                    className="h-full"
                  >
                    <ServiceCard
                      title={service.title}
                      description={service.description}
                      image={service.image}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      <Milestones tone="dark" />
      <Testimonials />
    </>
  );
}
