/**
 * The organisations Arcompsol has shipped for.
 *
 * ── IN SIMPLE WORDS ──
 * The list of client names printed along the bottom of the image that appears
 * whenever someone shares a link to this site.
 *
 * ── BUSINESS RULES ──
 * - Every name here must be backed by a testimonial in content/testimonials.ts
 *   from someone at that organisation. That is the rule: a client is published
 *   only if a quote from them is on the site and can be read. Do not add a
 *   client here who has not given one.
 * - Names are spelled as the clients themselves wrote them ("ModMed", not
 *   "Modmed").
 *
 * ── THE RULE USED TO NAME A PERSON, AND NO LONGER CAN ──
 * There was a `person` field holding who vouched for each client, so the claim
 * stayed auditable from this file alone. Personal names were removed from the
 * testimonials on 2026-08-17 (owner's call — see content/testimonials.ts), and
 * keeping them here would have republished exactly what that change removed,
 * in a file that ships to a public repository.
 *
 * The audit still works, one step further out: every organisation below appears
 * as `organization` on a quote in content/testimonials.ts. Check it there.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * ONE CONSUMER: app/opengraph-image.tsx. The list lives in its own module
 * because the sourcing rule above is worth keeping written down, and because
 * the share card is not the only place it could reasonably be used.
 *
 * A separate module rather than a field on TESTIMONIALS, because the mapping is
 * not one-to-one: the "Gitscore & Onbench" quote covers two organisations, so
 * six names come from five quotes.
 *
 * Deliberately NAMES, not logo images. The repo has no licensed logo file for
 * any of these companies, and a wall of logos redrawn or scraped from elsewhere
 * is a trademark problem, not a design decision.
 *
 * ── DO NOT ──
 * - Do not reorder this to put the biggest name last. The share card sets these
 *   on one line that gets skimmed, not finished, so `Linux Foundation` leads.
 * - Do not let this grow past ~6 entries without checking the card still
 *   renders on one line at 1200px — Satori will not wrap it for you.
 * - Do not add a person's name back to this type. See above.
 */
export type Client = {
  /** The organisation, exactly as the client writes it. */
  name: string;
};

export const CLIENTS: Client[] = [
  { name: "Linux Foundation" },
  { name: "ModMed" },
  { name: "Surmount AI" },
  { name: "Gitscore" },
  { name: "Onbench" },
  { name: "Glorvia" },
];
