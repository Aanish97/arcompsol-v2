/**
 * Client testimonials shown in the home page carousel.
 *
 * ── BUSINESS RULES ──
 * `text` is the FULL quote as the client gave it, and the full quote is what
 * the site shows.
 *
 * If shortening is ever wanted: excerpt by taking a CONTIGUOUS VERBATIM RUN of
 * `text`. Never a paraphrase, never a summary, and never fragments from
 * different parts of a quote spliced together. These are attributed statements
 * by real people at real companies, so the only permitted edit is
 * sentence-initial capitalisation where the excerpt starts mid-sentence.
 *
 * ── NO PERSONAL NAMES AND NO PHOTOGRAPHS — owner's call, 2026-08-17 ──
 * Each quote is now attributed to a ROLE at an ORGANISATION and nothing more.
 * The five people's names came out together with the three portrait files,
 * which were deleted from `src/assets` rather than left orphaned. The filenames
 * were themselves personal names, which is why they are not listed here.
 *
 * THIS DELIBERATELY GIVES UP SOMETHING, and the file it replaced said so:
 * "the names attached to them are the strongest asset on the site". A named
 * Executive Director carries more than an unnamed one. What survives is the
 * part that carried most of that weight — the seniority and the organisation —
 * so "Executive Director, Linux Foundation" is still a checkable claim about
 * who is speaking, just not about which person.
 *
 * ── DO NOT ──
 * - Do not put a personal name back in any field here. If a client later gives
 *   explicit permission to be named, that is a decision to record with a date,
 *   the way this one is — not a quiet edit.
 * - Do not add a photograph back for the same reason. `common/monogram.tsx`
 *   now draws the ORGANISATION's initials and is the intended appearance, not
 *   a placeholder waiting for an image.
 * - Do not paraphrase a quote to remove a self-identifying detail. Excerpt a
 *   contiguous run or leave it whole; rewriting someone's words and keeping the
 *   quotation marks is the one edit that is never acceptable.
 *
 * Note: the original spelled the field `organiztion`. Corrected to
 * `organization` here — the typo was load-bearing in the old component and had
 * to be matched exactly, which is the sort of thing that quietly spreads.
 * Quote text is unchanged from what each client wrote.
 */

/**
 * `role` and `organization` are separate fields, not one string.
 *
 * They were one — "Executive Director @ Linux Foundation" — which was fine
 * while a person's name sat above it doing the identifying. With the name gone
 * these two ARE the attribution, so they are set as two lines: the role reads
 * as who is speaking and the organisation as where from. Splitting them also
 * lets `content/clients.ts` check its sourcing rule against the organisation
 * without parsing a sentence.
 */
type Testimonial = {
  /** Job title, exactly as the client gave it. */
  role: string;
  /** The organisation, spelled as the client writes it ("ModMed", not "Modmed"). */
  organization: string;
  text: string;
};

export const TESTIMONIALS_SECTION = {
  eyebrow: "Testimonials",
  title: "Client Testimonials",
};

export const TESTIMONIALS: Testimonial[] = [
  {
    role: "CEO",
    organization: "Surmount AI",
    text: "Working with Arcompsol has been an incredible experience. Their developers are not only technically skilled but also proactive in finding solutions to complex problems. They helped us streamline our web application and optimize performance beyond our expectations. What stood out most was their professionalism and dedication throughout the project. I can confidently say that they deliver excellence and are a reliable partner for any software needs.",
  },
  {
    role: "Executive Director",
    organization: "Linux Foundation",
    text: "Arcompsol has excellent developers, an even better architect, Aanish, and great technical project management skills. They are very responsive and can do high-quality work under pressure. I have worked with them on multiple projects now for the past couple of years and sincerely, their communication skills and technical wrangling are amongst the best I have seen in over 25 years of software development. They are a pleasure to work with and an asset to any organization they are part of.",
  },
  {
    role: "Customer Success Manager",
    organization: "ModMed",
    text: "Very talented developers and hard workers. They always give 100% and anytime I've needed their help, They have been there to assist. They participated in the backend development (and some front end as well) of our SaaS and I'll always be grateful to have discovered Arcompsol. I highly recommend them to any future employer that needs a high-quality, hard-working software developer.",
  },
  {
    role: "Owner",
    organization: "Glorvia",
    text: "I’ve had the pleasure of collaborating with Arcompsol on a few critical projects, and every time they exceeded expectations. Their ability to handle challenging technical requirements while maintaining clear and consistent communication sets them apart. The team is detail-oriented, creative, and always willing to go the extra mile to ensure success. I would recommend them without hesitation to anyone looking for dependable and highly skilled developers.",
  },
  {
    role: "Founder",
    organization: "Gitscore & Onbench",
    text: "Arcompsol has been instrumental in scaling our platform. Their knowledge of both backend and frontend technologies is remarkable, and their problem-solving approach is second to none. They consistently deliver on time, even when deadlines are tight, and their code quality is outstanding. Beyond their technical expertise, their collaborative spirit makes them a joy to work with. I am grateful for their support and look forward to working with them again.",
  },
];
