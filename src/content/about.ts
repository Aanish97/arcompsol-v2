/**
 * About page copy: the hero, the "Who We Are" intro, and the five values.
 * Strings are byte-identical to the original constants.ts.
 */

export const ABOUT_HERO = {
  title: "About Us",
  description:
    "At Arcompsol, we believe in a flat hierarchy that is conducive for maximum growth for everyone working for us. If you are motivated by challenges and enjoy an environment that is dynamic, challenging and rewarding, we will always have a place for you.",
};

export const WHO_WE_ARE = {
  title: "Who We Are",
  description:
    "Who we are is best described by what we value in our coworkers, and who we as individuals continually aspire to be. These personal attributes codify the most important traits we look for in future coworkers.",
};

export const VALUES = [
  {
    heading: "High Integrity",
    description:
      "We do the right thing even when it's the harder option, and especially when no one's looking.",
  },
  {
    heading: "Low Ego",
    description:
      "Improving global outcomes is our top priority at work, and it is also the foundation for individual success.",
  },
  {
    heading: "Candor with Empathy",
    description:
      "We say what we mean, directly, candidly, and sincerely, but always with empathy and respect.",
  },
  /**
   * APPROVED BY THE OWNER AS WRITTEN, 2026-08-14. These are the company's
   * words now. They are not drafts and the note that said so is gone.
   *
   * Kept as a record because of how they got here. Both shipped for a while
   * marked `// DRAFT — pending the owner's own wording`, survived an audit and
   * two rounds of code review in that state, and read well enough that nobody
   * would have guessed they were unapproved — which is exactly why a draft in
   * a comment is a bad place to keep one. Review is what surfaced it; the
   * owner then read both sentences and adopted them.
   *
   * The distinction worth preserving: the three values above were AUTHORED by
   * the owner, these two were RATIFIED by him. If the values are ever
   * revisited, that is the difference between them.
   */
  {
    heading: "Ownership",
    // "outcome, not the task" mirrors "what we mean" / "with empathy" above:
    // each value names the easy version and then the one we hold to.
    description:
      "We own the outcome, not just the task, and we fix what is ours before anyone has to ask.",
  },
  {
    heading: "Commitment",
    // The original ran two clauses to say one thing. The difficult part IS the
    // commitment, so the sentence ends on it.
    description:
      "We finish what we start, and we stay through the part of a project that is hard.",
  },
];
