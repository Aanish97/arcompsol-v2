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
import { CONTACT } from "@/content/site";
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
        "shadow-[0_8px_32px_rgb(var(--shadow-tint)/0.08)] transition-[transform,box-shadow] duration-220 ease-out",
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
            featured ? "text-2xl text-on-dark md:text-3xl" : "text-ink",
          )}
        >
          {heading}
        </h3>
        <p
          className={cn(
            "measure text-[0.95rem] leading-relaxed",
            featured ? "text-base text-on-dark-soft" : "text-ink-soft",
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
    <Card className="flex h-full flex-col gap-0 rounded-2xl border-border p-6 transition-[transform,border-color,box-shadow] duration-220 ease-out hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_12px_32px_rgb(var(--shadow-tint)/0.12)]">
      <CardContent className="flex flex-1 flex-col p-0">
        <h3 className="text-xl font-semibold text-ink">{title}</h3>
        {/* A META LINE, NOT PILLS. Two rounded chips is the same badge shape
            the careers hero just lost, and repeating it six times across a grid
            is what makes a page look assembled from a component library rather
            than designed. A hairline between two words does the same job — it
            separates them — using the rule device the rest of this site already
            speaks in.

            BLUE because these are FACTS ABOUT the job, not things you can do
            with it. Green on this site means "you can act on this": buttons,
            links, focus, hover. Metadata in the same green makes the reader
            work out which greens are clickable. 6.38:1 on --surface.

            Uppercase needs the tracking — capitals have no ascenders or
            descenders to tell their shapes apart at 12px. */}
        <p className="mt-2 flex items-center gap-2.5 text-xs font-semibold tracking-[0.1em] text-brand-blue uppercase">
          <span>{team}</span>
          <span aria-hidden className="h-3 w-px bg-brand-blue/30" />
          <span>{location}</span>
        </p>

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
          {/* CONTACT.email, NOT a literal. This was a hardcoded
              `careers@arcompsol.com` — a fourth copy of the company address in
              a fourth file, which is the exact failure content/site.ts exists
              to prevent: "how a changed address ends up updated in one place
              and stale in the others". Applications now land in the same inbox
              as enquiries (owner's call, 2026-08-17). If a separate careers
              mailbox is ever set up, add it to CONTACT and point this at that
              field — do not retype an address here. */}
          {/* NO className. `Button asChild` renders through Radix Slot, which
              CONCATENATES the child's classes with the button's rather than
              running them through tailwind-merge — so anything set here lands
              ALONGSIDE the base instead of replacing it. This carried
              `rounded-lg focus-ring`: the first was already on the base (it
              shipped twice in the HTML), and the second would now paint a
              second focus outline over the one the base draws. */}
          <a href={`mailto:${CONTACT.email}?subject=Application: ${title}`}>
            Apply now
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
