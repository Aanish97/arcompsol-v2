/**
 * The initials that stand in for a testimonial portrait we do not have.
 *
 * ── IN SIMPLE WORDS ──
 * Two of the people who gave us testimonials have not sent a photo. Rather than
 * put a generic grey silhouette next to their name, this draws their initials in
 * the brand green on a soft green disc, at exactly the size and with exactly the
 * ring the real portraits have. It reads as a designed choice rather than as a
 * picture that failed to load.
 *
 * ── BUSINESS RULES ──
 * - These are REAL, NAMED people at named companies. A stock placeholder beside
 *   a real attribution quietly undermines the one section on the site whose
 *   whole job is credibility — flagged by the 2026-08-14 audit as its only P1.
 * - Initials come from the name, never from a hardcoded list. Add a testimonial
 *   without a photo and it is handled; nothing to remember and nothing to keep
 *   in sync.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * THE GROUND IS BRAND-TINTED, NOT GREY. A neutral disc sitting beside three
 * full-colour portraits reads as an image that did not load; the same disc in
 * the section's own green reads as a decision. `bg-brand/10` is a colour
 * UTILITY resolved through the token, not a literal in a bracket, so it moves
 * with the palette — see the rule recorded 2026-08-13.
 *
 * IT MIRRORS THE PORTRAIT'S BOX EXACTLY — `size-12 lg:size-16`, `rounded-full`,
 * `ring-2 ring-brand/25 ring-offset-2 ring-offset-surface-alt`. The ring is what
 * makes a portrait read as inset into the card rather than pasted onto it, and a
 * monogram that skipped it would sit differently in the row from its neighbours.
 * If the portrait's classes ever change, change these in the same edit.
 *
 * `aria-hidden`, for the same reason the portraits carry `alt=""`: the person's
 * name is the very next element in the accessibility tree, and initials
 * announced before it would read as "O E Omer Erdogan".
 *
 * ── DO NOT ──
 * - Do not reintroduce a shared placeholder image. That is the defect this
 *   replaced, and one file used by several people is exactly how it survived a
 *   previous review — it looked deliberate because it looked consistent.
 * - Do not letter-space this negatively. Two uppercase glyphs at 16px need air
 *   between them, which is the opposite of what a display heading needs.
 */
import { cn } from "@/lib/utils";

/**
 * First letter of the first word plus first letter of the last word, so
 * "Omer Erdogan" gives OE. A single-word name gives one letter rather than
 * padding it out — one strong initial beats a letter that is not in the name.
 */
function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Monogram({
  name,
  className,
}: {
  /** The person's full name. Only the initials are rendered. */
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand/10 font-heading font-semibold tracking-wide text-brand select-none",
        // Matched to the portrait beside it, deliberately verbatim.
        "size-12 ring-2 ring-brand/25 ring-offset-2 ring-offset-surface-alt lg:size-16",
        "text-base lg:text-xl",
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
