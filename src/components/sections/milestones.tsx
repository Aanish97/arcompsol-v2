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
 * The spine is ONE absolutely positioned element on the list, not a per-row
 * border. Per-row borders were the previous approach and they break the moment
 * two rows have different heights, because each segment is only as tall as its
 * own row and gaps appear between them.
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
    <Section width="wide" className={dark ? "bg-brand-navy" : "bg-surface-alt"}>
      <Reveal className="flex flex-col items-center">
        {/* NO EYEBROW. It read "Our process" above a heading that reads
            "How We Work?" — the label restated the headline. */}
        <SectionHeading className={dark ? "text-white" : undefined}>
          {MILESTONES_SECTION.title}
        </SectionHeading>
        <SectionDescription className={cn("mt-4", dark && "text-white/60")}>
          {MILESTONES_SECTION.description}
        </SectionDescription>
      </Reveal>

      <ol className="relative mt-16 w-full max-w-4xl">
        {/* The spine. One element spanning the whole list, so it cannot develop
            gaps when rows differ in height. Inset top and bottom so it starts
            and ends at the first and last markers rather than in empty space. */}
        <span
          aria-hidden
          className={cn(
            "absolute top-6 bottom-6 left-6 w-px bg-gradient-to-b to-transparent md:left-1/2 md:-translate-x-1/2",
            dark
              ? "from-brand-on-dark/60 via-white/15"
              : "from-brand/50 via-border",
          )}
        />

        {MILESTONES.map((milestone, index) => {
          const isRight = index % 2 === 1;
          return (
            <Reveal
              as="li"
              key={milestone.heading}
              delay={index * 60}
              className={cn(
                "relative flex gap-6 pb-12 last:pb-0 md:gap-0",
                isRight ? "md:flex-row" : "md:flex-row-reverse",
              )}
            >
              {/* Spacer that pushes the copy to one side of the spine on md+.
                  It renders nothing; it only occupies half the row. */}
              <div className="hidden md:block md:w-1/2" />

              <span
                className={cn(
                  "relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold shadow-[0_4px_14px_rgb(var(--shadow-brand)/0.35)] md:absolute md:top-0 md:left-1/2 md:-translate-x-1/2",
                  // A ring in the BAND's own colour, so the marker punches a
                  // hole in the spine rather than sitting on top of a line that
                  // runs visibly behind it.
                  dark ? "ring-8 ring-brand-navy" : "ring-8 ring-surface-alt",
                  // SOLID on the dark band, gradient on the light one. The
                  // gradient ran brand-on-dark -> brand, and navy digits on
                  // that second stop measure 2.20:1: the number vanished over
                  // the lower half of every circle. A flat brand-on-dark fill
                  // holds 6.10:1 across the whole marker.
                  dark
                    ? "bg-brand-on-dark text-brand-navy"
                    : "bg-gradient-to-br from-brand to-brand-deep text-white",
                )}
              >
                {index + 1}
              </span>

              <div
                className={cn(
                  "pt-1.5 md:w-1/2",
                  isRight ? "md:pl-14 md:text-left" : "md:pr-14 md:text-right",
                )}
              >
                <h3 className={dark ? "text-white" : undefined}>
                  {milestone.heading}
                </h3>
                {/* Short rule under each step. The timeline was six numbered
                    circles and six paragraphs; this gives each entry a mark of
                    its own and is the same device the section headings use. It
                    hangs on the side the copy is aligned to. */}
                <span
                  aria-hidden
                  className={cn(
                    "mt-3 block h-0.5 w-8 rounded-full",
                    dark
                      ? "bg-gradient-to-r from-brand-on-dark to-transparent"
                      : "bg-gradient-to-r from-brand to-transparent",
                    isRight ? "md:mr-auto" : "md:ml-auto md:rotate-180",
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
                    dark && "text-white/60",
                    isRight ? "md:mr-auto" : "md:ml-auto",
                  )}
                >
                  {milestone.description}
                </p>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </Section>
  );
}
