/**
 * Splits a line into words so they arrive one after another on scroll.
 *
 * ── IN SIMPLE WORDS ──
 * A section heading fades in a word at a time as you reach it, left to right,
 * instead of the whole line appearing at once.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * Not a client component, and it adds no observer. The split happens at render,
 * so the complete sentence is in the server HTML — a crawler, reader mode, and
 * a browser with JavaScript blocked all get the real heading. The animation is
 * driven by CSS keyed off `[data-reveal="shown"]`, the flag <Reveal> already
 * sets, so one IntersectionObserver still serves the whole section.
 *
 * THE SPACE LIVES OUTSIDE THE SPAN. Word spans are `inline-block` because an
 * inline box cannot be transformed, and an inline-block absorbs whitespace
 * inside it — `<span>word </span>` produces a line that will not wrap at that
 * space. A separate text node keeps line breaking, selection and `text-balance`
 * intact.
 *
 * Screen readers concatenate adjacent text nodes, so the heading is announced
 * as one sentence. Do not "fix" this with aria-hidden spans plus an aria-label
 * on the parent; that drops the real text from the accessibility tree.
 *
 * ── DO NOT ──
 * - Do not use this on body copy. A paragraph revealing word by word is a
 *   reading obstacle; this is for headings short enough that the stagger
 *   finishes before the eye settles.
 * - Do not FADE the hero. It is above the fold, so `data-stagger="load"`
 *   animates transform only and never opacity — the words are legible from the
 *   first frame. A fading hero reads as a page that has not loaded; measured at
 *   630ms to assemble, which is exactly how it read.
 * - Do not raise the per-word step past 45ms. See globals.css — the last word
 *   of an eight-word heading is already 315ms behind the first.
 */
import { Fragment } from "react";

export function StaggerText({
  text,
  offset = 0,
  className = "stagger-word",
}: {
  text: string;
  /**
   * Starting index, so a heading split across several elements keeps ONE
   * continuous count. The hero's accent is its own <span>; without this its
   * words restart at 0 and fire on top of the opening words.
   */
  offset?: number;
  /**
   * Which rule set drives the words. Defaults to `.stagger-word`, the scroll
   * reveal keyed off `[data-reveal]`.
   *
   * IT IS A PROP BECAUSE THE CASCADE LEAVES NO ALTERNATIVE. The services
   * heading's last words are released by the keyboard animation rather than by
   * scroll, and `[data-reveal="shown"] .stagger-word` is declared OUTSIDE any
   * `@layer` — unlayered styles beat layered ones no matter the source order,
   * so a rule added in `@layer components` to hold those words back could never
   * win against it. A separate class sidesteps the conflict entirely instead of
   * fighting it with specificity. See `.wordmark-word` in globals.css.
   */
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span
            className={className}
            style={{ "--word": offset + index } as React.CSSProperties}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
