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

import { StaggerText } from "@/components/common/stagger-text";
import { cn } from "@/lib/utils";

type SectionProps = ComponentProps<"section"> & {
  /** Inner column width. `narrow` is the home measure, `wide` the about/careers one. */
  width?: "narrow" | "wide";
  /** Vertical padding. `tight` is for bands that butt against a neighbour. */
  space?: "default" | "tight";
  align?: "center" | "start";
  /**
   * Decoration painted behind the content, spanning the FULL band rather than
   * the inner column — which is the whole reason it is a prop and not just a
   * child. The margins either side of the column are where a backdrop can live
   * without sitting under any copy, and a child would be confined to the column
   * and lose them.
   *
   * `isolate` below is what makes it work: the backdrop is z-index -1 (see
   * .hexfield), so without a stacking context here it would paint behind the
   * page rather than behind the section. Same arrangement as
   * `.hero-band-wash` on the home hero.
   */
  backdrop?: ReactNode;
};

/**
 * ── EVERY BAND MUST BE NAMED ────────────────────────────────────────────────
 *
 * Pass `aria-labelledby` pointing at the id of this band's SectionHeading.
 * Both halves are required and they are written at the same call site so the
 * pair is visible in one place; SectionHeading takes a matching `id`.
 *
 * WHY: a <section> with NO accessible name is not exposed as a region at all.
 * It is announced as a plain group — which makes it exactly a <div> with extra
 * letters, and it never appears in the rotor/landmark list a screen-reader user
 * navigates a long page by. Every band on this site was in that state: an audit
 * of the rendered HTML found zero named sections across all three pages. The
 * only labelled <section> in the output belonged to Sonner's toast container.
 *
 * The name must come from `aria-labelledby` rather than `aria-label`, because
 * a hand-written label is a second copy of the heading that no longer changes
 * when the heading does. Pointing at the heading means there is one string.
 */

export function Section({
  width = "narrow",
  space = "default",
  align = "center",
  backdrop,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("w-full", backdrop && "relative isolate", className)}
      {...props}
    >
      {backdrop}
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
  align = "center",
  className,
}: {
  children: ReactNode;
  /**
   * Which way the rules hang. NOT cosmetic: a single trailing rule on a CENTRED
   * label hangs off one side and pulls the whole label off axis — the home
   * hero's own note says exactly this, which is why its rule is lg-only there.
   * Centred eyebrows get one on each side and stay balanced; left-aligned ones
   * get the trailing rule alone, because a leading rule would push the first
   * word off the reading edge the heading below it starts from.
   */
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mb-3 flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-brand uppercase",
        className,
      )}
    >
      {/* THE RULE THE HOME HERO ALREADY HAD, now on every eyebrow. It was one
          bespoke device on one label while the others were bare, so the same
          element looked like two different things depending on the page.

          It DRAWS ITSELF IN on arrival — scaleX from the outer edge, keyed off
          the [data-reveal] flag the section already sets, so it needs no
          observer and no extra element. Transform only, and it runs once.

          aria-hidden: a mark, not a separator anyone needs announced. */}
      {align === "center" && (
        <span aria-hidden className="eyebrow-rule eyebrow-rule-lead" />
      )}
      {children}
      <span aria-hidden className="eyebrow-rule" />
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
  /**
   * Names the band this heading heads. Pair it with `aria-labelledby` on the
   * enclosing <Section> — see the note on Section above for why every band
   * needs one.
   */
  id?: string;
};

export function SectionHeading({
  children,
  tone = "dark",
  as: Tag = "h2",
  align = "center",
  className,
  id,
}: HeadingProps) {
  return (
    <Tag
      id={id}
      className={cn(
        align === "center" ? "text-center" : "text-left",
        tone === "dark" ? "text-ink" : "text-brand-dark",
        className,
      )}
    >
      {/* Staggered only when the heading is a plain string. Anything else (the
          hero's two-tone h1) renders untouched rather than having its element
          tree pulled apart to find text nodes. Needs an ancestor carrying
          [data-reveal]; without one the words simply show immediately, which is
          a correct fallback rather than a broken state. */}
      {typeof children === "string" ? (
        <StaggerText text={children} />
      ) : (
        children
      )}
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
