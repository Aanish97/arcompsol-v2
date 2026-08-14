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
   * THESE TWO ARE STILL OURS, NOT THE OWNER'S — read them before a launch.
   *
   * They were written here as drafts and marked as such. The 2026-08-14 audit
   * pulled the marker up as a finding: two of five stated company values were
   * in the writer's words rather than the owner's, and they read well enough
   * that nobody would notice. The wording below is a craft pass over those
   * drafts — the rhythm of the three above, no claim added or removed — which
   * fixes how they read but NOT whose words they are.
   *
   * The three values above came from the owner. Replace these two with his
   * wording and delete this block; that is the only thing that closes it.
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
