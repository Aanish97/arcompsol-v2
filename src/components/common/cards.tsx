/**
 * The two static card shapes: value and job.
 *
 * ── IN SIMPLE WORDS ──
 * Small presentational components. Each takes plain data and returns a card.
 * Neither fetches, neither holds state, neither knows which page it is on.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * Both build on shadcn's <Card>, which reads the --card and --border tokens.
 * Those are re-pointed at the brand palette in globals.css, so these inherit
 * the right colours without a single hex literal here. Restyling the site
 * means editing the tokens, not hunting through card files.
 *
 * ServiceCard used to live here and now does not. It became interactive —
 * click to flip — and this file is imported by three server components, so
 * keeping it here would have forced "use client" onto the whole module and
 * pulled ValueCard and JobCard into the browser bundle for nothing. See
 * common/service-card.tsx.
 *
 * ── DO NOT ──
 * - Do not add an interactive component to this file. Put it in its own module
 *   with "use client", for the reason above.
 * - Do not put an onClick on JobCard's root. The apply action is a real button
 *   for keyboard and screen-reader users; a clickable div is reachable only by
 *   mouse.
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ValueCard({
  heading,
  description,
  featured = false,
}: {
  heading: string;
  description: string;
  /** Lead card in the grid: brand fill, larger heading, spans two columns. */
  featured?: boolean;
}) {
  return (
    <Card
      className={cn(
        "relative h-full gap-0 overflow-hidden rounded-2xl border-border p-8",
        "shadow-[0_8px_32px_rgb(var(--shadow-tint)/0.08)] transition-[transform,box-shadow] duration-300",
        "hover:-translate-y-2 hover:shadow-[0_16px_48px_rgb(var(--shadow-tint)/0.14)]",
        featured
          ? "border-transparent bg-gradient-to-br from-brand-dark to-brand-navy"
          : "bg-gradient-to-br from-surface to-surface-alt",
      )}
    >
      {/* 4px brand gradient along the top edge — the accent tying the value and
          quality grids to the primary button. Omitted on the featured card,
          which is already brand-filled and would just look banded. */}
      {!featured && (
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand to-brand-deep" />
      )}
      <CardContent className="flex h-full flex-col justify-center p-0">
        <h3
          className={cn(
            "mb-4 leading-snug",
            featured ? "text-2xl text-white md:text-3xl" : "text-ink",
          )}
        >
          {heading}
        </h3>
        <p
          className={cn(
            "measure text-[0.95rem] leading-relaxed",
            featured ? "text-base text-white/75" : "text-ink-soft",
          )}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function JobCard({
  title,
  team,
  location,
  description,
}: {
  title: string;
  team: string;
  location: string;
  description: string;
}) {
  return (
    // h-full is load-bearing, not tidiness. The grid item stretches to the
    // tallest card in the row, but this card sized to its own text — so a role
    // with a short description produced a visibly shorter card AND lifted its
    // "Apply now" out of line with the others. The flex-1 on the description
    // below can only push the button to the bottom of a card that has a
    // bottom to be pushed to.
    <Card className="flex h-full flex-col gap-0 rounded-2xl border-border p-6 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_12px_32px_rgb(var(--shadow-tint)/0.12)]">
      <CardContent className="flex flex-1 flex-col p-0">
        <h3 className="text-xl font-semibold text-ink">{title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span className="rounded-full bg-secondary px-3 py-1">{team}</span>
          <span className="rounded-full bg-secondary px-3 py-1">
            {location}
          </span>
        </div>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
        <Button
          asChild
          variant="brandOutline"
          size="brand"
          className="mt-6 self-start"
        >
          {/* mailto rather than an onClick that console.logs, which is what the
              original did — the button looked live and did nothing. */}
          <a
            href={`mailto:careers@arcompsol.com?subject=Application: ${title}`}
            className="rounded-lg focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Apply now
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
