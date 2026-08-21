/**
 * The initials that mark a testimonial, drawn from the client organisation.
 *
 * NOT A PLACEHOLDER. Personal names and portraits came off the testimonials on
 * 2026-08-17 and the image files were deleted, so there is no photograph this
 * stands in for and no avatar branch to fall back from. See
 * content/testimonials.ts.
 *
 * `aria-hidden` because the attribution is the very next element in the
 * accessibility tree — announced, this would read as "L F Executive Director
 * Linux Foundation".
 *
 * Do not letter-space this negatively. Two uppercase glyphs at 16px need air
 * between them, which is the opposite of what a display heading needs.
 */
import { cn } from "@/lib/utils";

/**
 * First letter of the first word plus first letter of the last word, so
 * "Linux Foundation" gives LF and "Gitscore & Onbench" gives GO. A single-word
 * name gives one letter rather than padding it out — "ModMed" is M, because one
 * strong initial beats a letter that is not in the name.
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
  /** The organisation. Only the initials are rendered. */
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand/10 font-heading font-semibold tracking-wide text-brand select-none",
        "size-12 ring-2 ring-brand/25 ring-offset-2 ring-offset-surface-alt lg:size-16",
        "text-base lg:text-xl",
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
