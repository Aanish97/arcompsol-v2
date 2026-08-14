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
 * by named people at real companies, so the only permitted edit is
 * sentence-initial capitalisation where the excerpt starts mid-sentence.
 *
 * The cost of full quotes is real and is not a content problem: they run 61-80
 * words, 18-24 seconds of reading at 200wpm, against a 6s autoplay interval. A
 * reader loses the quote mid-sentence unless they hover, focus, or press pause.
 * Raising the interval or dropping autoplay is the fix, not trimming the words.
 *
 * Note: the original spelled the field `organiztion`. Corrected to
 * `organization` here — the typo was load-bearing in the old component and had
 * to be matched exactly, which is the sort of thing that quietly spreads.
 * Testimonial text and attributions are otherwise unchanged.
 */
import type { StaticImageData } from "next/image";

import lanceKohler from "@/assets/Lance_Kohler.jpeg";
import loganWeaver from "@/assets/Logan_Weaver.png";
import sumerJohal from "@/assets/Sumer_Johal.png";

/**
 * `avatar: null` means WE DO NOT HAVE A PHOTO OF THIS PERSON, and the card
 * draws their initials instead (see common/monogram.tsx).
 *
 * It is null rather than a shared placeholder image on purpose. Two of these
 * five pointed at one `Placeholder.png` — a generic silhouette beside the real
 * name and real company of a real person, which is the quiet kind of wrong that
 * survives review precisely because it looks consistent. The 2026-08-14 audit
 * flagged it as the site's only P1.
 *
 * Drop a real photo in and set it here; nothing else has to change.
 */
type Testimonial = {
  avatar: StaticImageData | null;
  name: string;
  organization: string;
  social: string;
  text: string;
};

export const TESTIMONIALS_SECTION = {
  eyebrow: "Testimonials",
  title: "Client Testimonials",
};

export const TESTIMONIALS: Testimonial[] = [
  {
    avatar: loganWeaver,
    name: "Logan Weaver",
    organization: "CEO of Surmount AI",
    social: "",
    text: "Working with Arcompsol has been an incredible experience. Their developers are not only technically skilled but also proactive in finding solutions to complex problems. They helped us streamline our web application and optimize performance beyond our expectations. What stood out most was their professionalism and dedication throughout the project. I can confidently say that they deliver excellence and are a reliable partner for any software needs.",
  },
  {
    avatar: sumerJohal,
    name: "Sumer Johal",
    organization: "Executive Director @ Linux Foundation",
    social: "",
    text: "Arcompsol has excellent developers, an even better architect, Aanish, and great technical project management skills. They are very responsive and can do high-quality work under pressure. I have worked with them on multiple projects now for the past couple of years and sincerely, their communication skills and technical wrangling are amongst the best I have seen in over 25 years of software development. They are a pleasure to work with and an asset to any organization they are part of.",
  },
  {
    avatar: lanceKohler,
    name: "Lance Kohler",
    organization: "Customer Success Manager @ ModMed",
    social: "",
    text: "Very talented developers and hard workers. They always give 100% and anytime I've needed their help, They have been there to assist. They participated in the backend development (and some front end as well) of our SaaS and I'll always be grateful to have discovered Arcompsol. I highly recommend them to any future employer that needs a high-quality, hard-working software developer.",
  },
  {
    avatar: null,
    name: "Omer Erdogan",
    organization: "Owner of Glorvia",
    social: "",
    text: "I’ve had the pleasure of collaborating with Arcompsol on a few critical projects, and every time they exceeded expectations. Their ability to handle challenging technical requirements while maintaining clear and consistent communication sets them apart. The team is detail-oriented, creative, and always willing to go the extra mile to ensure success. I would recommend them without hesitation to anyone looking for dependable and highly skilled developers.",
  },
  {
    avatar: null,
    name: "Abrar Akhtar",
    organization: "Founder of Gitscore & Onbench",
    social: "",
    text: "Arcompsol has been instrumental in scaling our platform. Their knowledge of both backend and frontend technologies is remarkable, and their problem-solving approach is second to none. They consistently deliver on time, even when deadlines are tight, and their code quality is outstanding. Beyond their technical expertise, their collaborative spirit makes them a joy to work with. I am grateful for their support and look forward to working with them again.",
  },
];
