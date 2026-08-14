/**
 * "How We Work?" — the six-step delivery process, shown on home and about.
 *
 * ── IN SIMPLE WORDS ──
 * A numbered sequence of the stages a project moves through. On a wide screen
 * the steps alternate left and right of a central spine; on a phone they stack
 * down one side. Each step arrives as you scroll to it.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The alternating layout is the point of the layout pass here. Six identical
 * left-aligned rows read as a bulleted list — the eye runs straight down and
 * takes in none of it. Alternating forces a small horizontal move per step,
 * which is what makes a sequence feel like a sequence.
 *
 * THE POSITION ALTERNATES; THE TEXT ALIGNMENT DOES NOT. Steps 1, 3 and 5 sit
 * left of the spine and used to be set RIGHT-ALIGNED to hug it, which meant
 * three of the six descriptions had a ragged left edge — and a ragged left edge
 * costs the reader a new starting point on every line. testimonials.tsx already
 * makes this argument for centred text ("tolerable for a headline and genuinely
 * tiring for six sentences"); right-aligned body copy is the same fault. Every
 * step now reads from one left edge, and the zig-zag comes from WHERE the panel
 * sits, which is where it was always coming from. Do not re-add md:text-right.
 *
 * The spine is ONE absolutely positioned element on the list, not a per-row
 * border. Per-row borders were the previous approach and they break the moment
 * two rows have different heights, because each segment is only as tall as its
 * own row and gaps appear between them.
 *
 * IT IS NOW TWO ELEMENTS ON THAT COLUMN, and the split is deliberate. The
 * gradient track is still a plain span and still the whole design on its own;
 * <MilestoneSpine> draws a second, brand-coloured line over it as you scroll.
 * Keeping them separate is what puts every failure — no JavaScript, reduced
 * motion, a bundle that never loads — back on the design that shipped before
 * it rather than on an empty column. Do not merge them.
 *
 * The alternation is `md:` and up only. Below that there is no room for two
 * columns, so every step sits right of a left-hand spine.
 *
 * The original took four colour props — titleColor, descColor, backgroundcolor,
 * circleColor — and both call sites passed identical values. Four knobs that
 * were never turned; removed.
 *
 * ── DO NOT ──
 * - Do not render the step number from a hardcoded list. It is the array index,
 *   so inserting a stage in content/home.ts renumbers the rest automatically.
 * - Do not raise the per-step delay much above 70ms. Six steps at 100ms puts
 *   half a second between the first and last, which reads as lag not stagger.
 */
import { HexField } from "@/components/common/hex-field";
import { MilestoneSpine } from "@/components/common/milestone-spine";
import { Reveal } from "@/components/common/reveal";
import {
  Section,
  SectionDescription,
  SectionHeading,
} from "@/components/common/section";
import { MILESTONES, MILESTONES_SECTION } from "@/content/home";
import { cn } from "@/lib/utils";

export function Milestones({
  /**
   * `dark` puts the band on the navy panel. It is a PROP, not a constant,
   * because this section renders on two pages and the right answer differs:
   * on home it sits between the services and the testimonials, so a dark band
   * there gives the page light-dark-light-dark rhythm. On about it is the LAST
   * section before the footer, and a dark band directly above a dark footer
   * merges into one undifferentiated block with a heading floating in it.
   */
  tone = "light",
}: {
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <Section
      aria-labelledby="milestones-heading"
      width="wide"
      // `band-soft` rather than a flat `bg-surface-alt`: the services band
      // above and the testimonials band below are both --surface, so a flat
      // tint here draws a hard line across the page at each boundary. See
      // .band-soft in globals.css.
      className={dark ? "bg-brand-navy" : "band-soft"}
      // The honeycomb, in the margins either side of the timeline. It takes the
      // band's tone rather than choosing its own: the lines have to be
      // --brand-on-dark on navy and --brand on paper, for the same reason every
      // other accent on this site does. See hex-field.tsx.
      backdrop={<HexField tone={tone} />}
    >
      <Reveal className="flex flex-col items-center">
        {/* NO EYEBROW. It read "Our process" above a heading that reads
            "How We Work?" — the label restated the headline. */}
        <SectionHeading
          id="milestones-heading"
          className={dark ? "text-on-dark" : undefined}
        >
          {MILESTONES_SECTION.title}
        </SectionHeading>
        {/* white/75, up from white/60. This line sits DIRECTLY on the band —
            it is the one piece of copy in the section with no panel under it,
            and the honeycomb now runs beneath it, so at /60 (6.40:1) it was
            reading as part of the pattern rather than as text. /75 measures
            9.74:1 on --brand-navy and separates cleanly. */}
        <SectionDescription className={cn("mt-4", dark && "text-on-dark-soft")}>
          {MILESTONES_SECTION.description}
        </SectionDescription>
      </Reveal>

      <ol
        className={cn(
          "relative mt-16 w-full max-w-4xl",
          // Carries the spine's two colours as custom properties so BOTH the
          // drawn line and the marker halos inherit one tone decision. Neither
          // can be set on the <svg>: the halos are on the markers, which are
          // not inside it.
          dark ? "milestone-timeline-dark" : "milestone-timeline-light",
        )}
      >
        {/* The spine, as a TRACK and a DRAWN LINE on the same 1px column.

            The track is this element: one span across the whole list, so it
            cannot develop gaps when rows differ in height, inset top and bottom
            so it starts and ends at the first and last markers rather than in
            empty space. It is unchanged, and it is still the entire design on
            its own — everything below is enhancement over it. */}
        <span
          aria-hidden
          className={cn(
            "absolute top-6 bottom-6 left-6 w-px bg-gradient-to-b to-transparent md:left-1/2 md:-translate-x-1/2",
            dark
              ? "from-brand-on-dark/60 via-night-line"
              : "from-brand/50 via-border",
          )}
        />
        {/* The drawn line, which grows downward with the scroll. IT REPEATS THE
            TRACK'S POSITIONING CLASSES VERBATIM, and must keep doing so: they
            are two elements that have to occupy the same column at both
            breakpoints, and the only way to guarantee that is for the classes
            to be identical. See common/milestone-spine.tsx. */}
        <MilestoneSpine className="absolute top-6 bottom-6 left-6 w-px md:left-1/2 md:-translate-x-1/2" />

        {MILESTONES.map((milestone, index) => {
          const isRight = index % 2 === 1;
          return (
            <Reveal
              as="li"
              key={milestone.heading}
              delay={index * 60}
              className={cn(
                // md:pb-8, down from 48px. The panels added their own 20px of
                // padding top and bottom, so the gap between two steps had
                // become 48 + 40 = 88px and the band grew 240px overall. The
                // step-to-step rhythm is what matters, not the margin figure:
                // 32 + 40 lands back at the 72px it read at before.
                "relative flex gap-6 pb-12 last:pb-0 md:gap-0 md:pb-8",
                isRight ? "md:flex-row" : "md:flex-row-reverse",
              )}
            >
              {/* Spacer that pushes the copy to one side of the spine on md+.
                  It renders nothing; it only occupies half the row. */}
              <div className="hidden md:block md:w-1/2" />

              <span
                // The hook the spine lights as the drawn line reaches it. It is
                // a data attribute rather than a class because milestone-spine
                // queries for it — a Tailwind class here could be reordered or
                // removed by a styling change and silently break the halos.
                data-milestone-marker
                className={cn(
                  // size-12, down from size-14. The markers are the index, not
                  // the content: at 56px plus an 8px ring they carried more
                  // weight than the headings they number, and six of them down
                  // the middle read as the subject of the section. 48px still
                  // clears the 44px touch minimum it does not need (it is not
                  // interactive) and lets the steps lead.
                  "relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold shadow-[0_4px_14px_rgb(var(--shadow-brand)/0.35)] md:absolute md:top-1 md:left-1/2 md:-translate-x-1/2",
                  // A ring in the BAND's own colour, so the marker punches a
                  // hole in the spine rather than sitting on top of a line that
                  // runs visibly behind it.
                  dark ? "ring-8 ring-brand-navy" : "ring-8 ring-surface-alt",
                  // SOLID on the dark band, gradient on the light one. The
                  // gradient ran brand-on-dark -> brand, and navy digits on
                  // that second stop measure 2.20:1: the number vanished over
                  // the lower half of every circle. A flat brand-on-dark fill
                  // holds 6.42:1 across the whole marker.
                  dark
                    ? "bg-brand-on-dark text-brand-navy"
                    : "bg-gradient-to-br from-brand to-brand-deep text-on-brand",
                  // ── The halo the spine lights as it reaches this step ──
                  // ON THE ::after, NEVER ON THE MARKER. The marker carries
                  // md:-translate-x-1/2 to sit on the spine, so animating its
                  // own transform would throw all six off the line on desktop.
                  // The pseudo-element has a transform of its own and cannot
                  // collide. -z-10 puts the halo behind the digit, inside the
                  // stacking context `relative z-10` above already creates.
                  //
                  // A shadow rather than a border or an outline: `ring-8` and
                  // the shadow-[...] above are BOTH box-shadows on the marker,
                  // and this is the one place another can be declared without
                  // overwriting either of them.
                  "after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:opacity-0 after:shadow-[0_0_0_5px_var(--spine-halo)]",
                  // A response, not an arrival: it acknowledges the scroll that
                  // just reached it. 0.22s ease-out, per ONE MOTION STANDARD,
                  // TWO SPEEDS in DESIGN.md.
                  "motion-safe:after:scale-[0.82] motion-safe:after:transition-[opacity,transform] motion-safe:after:duration-[220ms] motion-safe:after:ease-out",
                  "data-reached:after:opacity-100 motion-safe:data-reached:after:scale-100",
                )}
              >
                {index + 1}
              </span>

              <div
                className={cn(
                  "pt-1.5 md:w-1/2 md:pt-0",
                  isRight ? "md:pl-14" : "md:pr-14",
                )}
              >
                {/* A PANEL FROM md UP. Two things made one necessary. The copy
                    was three loose elements on an open band, so each step read
                    as text that happened to be near a number rather than as one
                    item — and the honeycomb now runs underneath, which a
                    heading sitting directly on it has to compete with. A quiet
                    surface gives the step an edge and lifts it off the pattern.

                    Below md there is no panel: the timeline is a single column
                    there, the descriptions are hidden, and six bordered boxes
                    holding one heading each is furniture around nothing.

                    Same treatment the footer form uses on navy — white at 4%
                    over a 10% border — so the two dark surfaces on the site are
                    made the same way. */}
                <div
                  className={cn(
                    "md:rounded-2xl md:border md:p-5",
                    dark
                      ? "md:border-night-line md:bg-night-alt"
                      : // FULL --surface, not a translucent one. At 70% over
                        // --surface-alt this mixed to #F7F9FA, a few values off
                        // the band behind it — a card that costs a border and
                        // delivers no separation. Opaque it is L* 98.6 against
                        // the band's 95.7, the same ~3-point step the service
                        // tiles use to read as objects on their panel.
                        "md:border-border md:bg-surface md:shadow-[0_4px_20px_rgb(var(--shadow-tint)/0.05)]",
                  )}
                >
                  <h3 className={dark ? "text-on-dark" : undefined}>
                    {milestone.heading}
                  </h3>
                  {/* Short rule under each step. The timeline was six numbered
                    circles and six paragraphs; this gives each entry a mark of
                    its own and is the same device the section headings use.

                    Always on the LEFT now, because the copy always is. It used
                    to flip sides and rotate its gradient to match. */}
                  <span
                    aria-hidden
                    className={cn(
                      "mt-3 block h-0.5 w-8 rounded-full",
                      dark
                        ? "bg-gradient-to-r from-brand-on-dark to-transparent"
                        : "bg-gradient-to-r from-brand to-transparent",
                    )}
                  />
                {/* HIDDEN BELOW md, shown from md up. The six headings ARE the
                    process — Planning, Design, Development, Testing,
                    Documentation, Maintenance — and they read as a sequence
                    without elaboration. The descriptions run 15-33 words each;
                    on a phone that is six paragraphs of supporting copy for a
                    section nobody arrives to read, and it cost 2.1 screens.

                    `hidden`, not removed: the copy stays in the HTML, so a
                    crawler and reader mode still get the full process. It is
                    also not truncated — a sentence cut mid-thought reads as a
                    bug, whereas a heading alone reads as a summary. */}
                  <p
                    className={cn(
                      "measure mt-3 hidden md:block",
                      // /70 rather than /60: it has a panel under it now, but
                      // the panel is only white at 4% and the lattice still
                      // shows through. 8.4:1 against the panel.
                      dark && "text-on-dark-soft",
                    )}
                  >
                    {milestone.description}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </Section>
  );
}
