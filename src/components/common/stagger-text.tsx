/**
 * Splits a line into words so each can be animated independently.
 *
 * THE SPACE LIVES OUTSIDE THE SPAN. Word spans are `inline-block` because an
 * inline box cannot be transformed, and an inline-block absorbs the whitespace
 * inside it — `<span>word </span>` produces a line that will not wrap at that
 * space. A separate text node keeps line breaking, selection and `text-balance`
 * intact.
 *
 * Screen readers concatenate adjacent text nodes, so this is still announced as
 * one sentence. Do not "fix" that with aria-hidden spans plus an aria-label on
 * the parent; that drops the real text from the accessibility tree.
 *
 * The animation is CSS, keyed off `[data-reveal]` / `[data-stagger]` — see
 * globals.css, which also explains why `.wordmark-word` must be its own class.
 */
import { Fragment } from "react";

export function StaggerText({
  text,
  offset = 0,
  className = "stagger-word",
}: {
  text: string;
  /** Start index, so a heading split across elements keeps one continuous count. */
  offset?: number;
  /** Which rule set drives the words. See `.wordmark-word` in globals.css. */
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
