/**
 * Section shell plus the eyebrow, heading and description that head one.
 *
 * ── IN SIMPLE WORDS ──
 * Every band down a page — services, values, benefits, openings — is the same
 * shape: full-width background, a centred column of fixed maximum width,
 * generous padding that shrinks on phones. This is that shape, written once.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The old project had a GenericWrapper plus a bespoke styled(Box) Container in
 * every template, each redeclaring its own max-width and its own three
 * breakpoints. They had already drifted — 1000px on home, 1200px on about — so
 * sections did not line up down the page. One component with a `width` prop
 * makes that difference explicit and reviewable instead of accidental.
 *
 * SectionHeading replaces four components (Title, TitleBlue, Description,
 * DescriptionBlue) that differed only in colour. Colour is a prop, not a file.
 *
 * `align` exists because the layout pass introduced left-aligned sections. Text
 * centred on both axes is the safe default that makes every page look the same;
 * alternating alignment is most of what gives a page rhythm.
 *
 * ── DO NOT ──
 * ── SPACING ──
 * Band padding is 56 / 72 / 80px. Two bands meet, so the gap between any two
 * is DOUBLE that: 160px at lg. It was 96px a side, i.e. 192px stacked, and
 * that read as dead space rather than as breathing room. Always reason about
 * the stacked figure, never the single-sided one.
 *
 * The eyebrow sits 12px above its heading while the heading sits 16px above
 * its description. That asymmetry is the point: an eyebrow BELONGS to the
 * heading beneath it, and at an equal 16px on both sides it floated between
 * the two and belonged to neither.
 *
 * ── DO NOT ──
 * - Do not add margin to the outer <section>. Bands sit flush by design;
 *   vertical rhythm comes from the padding inside, so an outer margin collapses
 *   unpredictably against its neighbour.
 * - Do not remove `measure` from SectionDescription. Full-width body copy on a
 *   1200px band runs to ~140 characters a line, which is roughly twice a
 *   comfortable reading span.
 */
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = ComponentProps<"section"> & {
  /** Inner column width. `narrow` is the home measure, `wide` the about/careers one. */
  width?: "narrow" | "wide";
  /** Vertical padding. `tight` is for bands that butt against a neighbour. */
  space?: "default" | "tight";
  align?: "center" | "start";
};

export function Section({
  width = "narrow",
  space = "default",
  align = "center",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("w-full", className)} {...props}>
      <div
        className={cn(
          "mx-auto flex w-full flex-col px-6 md:px-8",
          align === "center" ? "items-center" : "items-start",
          width === "narrow" ? "max-w-5xl" : "max-w-6xl",
          space === "default" ? "py-14 md:py-18 lg:py-20" : "py-10 md:py-12",
        )}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Small uppercase label above a heading.
 *
 * Its job is to name the section in one or two words so the heading below is
 * free to be a sentence rather than a category. Wide tracking is not decoration
 * here — uppercase text at 12px is genuinely harder to read without it, because
 * capitals have no ascenders or descenders to distinguish their shapes.
 */
export function SectionEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mb-3 text-xs font-semibold tracking-[0.18em] text-brand uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

type HeadingProps = {
  children: ReactNode;
  /** `dark` is the near-black used on white bands; `brand` the navy on tinted ones. */
  tone?: "dark" | "brand";
  as?: "h1" | "h2" | "h3";
  align?: "center" | "start";
  className?: string;
};

export function SectionHeading({
  children,
  tone = "dark",
  as: Tag = "h2",
  align = "center",
  className,
}: HeadingProps) {
  return (
    <Tag
      className={cn(
        align === "center" ? "text-center" : "text-left",
        tone === "dark" ? "text-ink" : "text-brand-dark",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionDescription({
  children,
  tone = "dark",
  align = "center",
  className,
}: {
  children: ReactNode;
  tone?: "dark" | "brand";
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "measure text-base leading-relaxed md:text-lg",
        align === "center" ? "text-center" : "text-left",
        tone === "dark" ? "text-ink-soft" : "text-ink-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}
