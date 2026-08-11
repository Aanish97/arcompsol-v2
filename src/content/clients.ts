/**
 * The organisations Arcompsol has shipped for.
 *
 * ── IN SIMPLE WORDS ──
 * The list of client names printed along the bottom of the image that appears
 * whenever someone shares a link to this site.
 *
 * ── BUSINESS RULES ──
 * - Every name here is derived from a signed testimonial in
 *   content/testimonials.ts. That is the rule: a name is published only if the
 *   person who gave it is quoted elsewhere on the site and can be checked. Do
 *   not add a client here who has not given a testimonial.
 * - Names are spelled as the clients themselves wrote them ("ModMed", not
 *   "Modmed"). `name` is the organisation; `person` is who vouched for it, and
 *   exists so the claim stays auditable from this file alone.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * ONE CONSUMER TODAY: app/opengraph-image.tsx. This briefly also fed a client
 * strip under the hero, which the owner removed on 2026-08-11; the module was
 * kept because the share card still needs the list and because the sourcing
 * rule above is worth keeping written down.
 *
 * A separate module rather than a field on TESTIMONIALS, because the mapping is
 * not one-to-one: Abrar Akhtar's single quote covers two companies, so six
 * organisations come from five quotes.
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
 */
export type Client = {
  /** The organisation, exactly as the client writes it. */
  name: string;
  /** Who vouched for it — keeps every name on the wall traceable to a quote. */
  person: string;
};

export const CLIENTS: Client[] = [
  { name: "Linux Foundation", person: "Sumer Johal" },
  { name: "ModMed", person: "Lance Kohler" },
  { name: "Surmount AI", person: "Logan Weaver" },
  { name: "Gitscore", person: "Abrar Akhtar" },
  { name: "Onbench", person: "Abrar Akhtar" },
  { name: "Glorvia", person: "Omer Erdogan" },
];
