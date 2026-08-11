/**
 * The 404 page.
 *
 * ── IN SIMPLE WORDS ──
 * What someone sees at a URL that does not exist. It says so plainly and gives
 * them the three places worth going instead.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * Without this file Next serves its own default: an unstyled black-on-white
 * "404 | This page could not be found" with no header, no footer, and no way
 * back. It looks like the site is broken rather than like the address is wrong,
 * and it is reached most often by the two visitors you least want to lose — a
 * search engine following a stale index entry, and someone who followed an old
 * link from an email.
 *
 * Real onward links, not just "go home". A dead end with a single button is
 * still a dead end if home is not where they were trying to get; the three
 * routes here are the entire site, so one of them is always right.
 *
 * The copy states the fact and stops. No "Oops!", no exclamation mark, no
 * apology — the address is wrong, which is not an emergency and not something
 * to be theatrical about.
 *
 * ── DO NOT ──
 * - Do not add `export const metadata` with a noindex robots rule here. Next
 *   already serves this with a genuine HTTP 404 status, which is the signal
 *   crawlers act on; a meta tag would be redundant and, if the two ever
 *   disagreed, misleading.
 */
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/content/site";

const DESTINATIONS = [
  { href: ROUTES.HOME, label: "Home", hint: "What we build and how we work" },
  { href: ROUTES.ABOUT, label: "About us", hint: "Who we are and what we value" },
  {
    href: ROUTES.CAREERS,
    label: "Careers",
    hint: "Open roles and what we look for",
  },
];

export default function NotFound() {
  return (
    <section className="bg-hero-glow w-full">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start px-6 py-24 md:px-8 md:py-32">
        <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">
          Error 404
        </p>

        <h1 className="mt-4 max-w-2xl">This page doesn&rsquo;t exist</h1>

        <p className="measure mt-6 text-lg leading-relaxed text-ink-soft">
          The address may have changed, or it may never have been right. Nothing
          is broken on our end.
        </p>

        {/* md, not sm. Three columns at the sm breakpoint means they first
            appear at 640px — the narrowest viewport that triggers them — which
            works out to 187px each, and "Who we are and what we value" needs
            four lines in that. At md they are 224px. */}
        <ul className="mt-12 grid w-full gap-4 md:grid-cols-3">
          {DESTINATIONS.map((destination) => (
            <li key={destination.href}>
              <Link
                href={destination.href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_12px_32px_rgb(var(--shadow-tint)/0.12)] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span
                  aria-hidden
                  className="mb-4 h-0.5 w-8 rounded-full bg-gradient-to-r from-brand to-brand-deep transition-all duration-300 group-hover:w-14"
                />
                <span className="font-heading font-semibold text-ink">
                  {destination.label}
                </span>
                <span className="mt-1 text-sm text-ink-soft">
                  {destination.hint}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Button asChild variant="brand" size="brand" className="mt-10">
          <Link href={ROUTES.HOME}>Back to home</Link>
        </Button>
      </div>
    </section>
  );
}
