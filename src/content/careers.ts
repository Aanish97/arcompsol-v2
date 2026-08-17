/**
 * Careers page copy: the three qualities, the benefits carousel, and the
 * current job openings.
 *
 * ── "BYTE-IDENTICAL TO THE ORIGINAL" IS NOT A CLAIM THAT IT IS TRUE ──
 * These strings were moved verbatim from the original project's constants.ts
 * and data/openings.ts rather than rewritten, and that used to be recorded here
 * as though it settled the question of their accuracy. It does the opposite.
 * The original was itself assembled from a template, so a faithful move is
 * exactly how another company's copy reaches production intact:
 *
 *   - "Grootan", a different agency, was named in the home page's process
 *     section (home.ts:124).
 *   - "Cleta", a different company, plus a Bay Area team and a SoMa office,
 *     was the Location benefit below — on the page where people decide whether
 *     to apply, at a company whose only office is in Lahore.
 *   - The Health & Wellness benefit still promises US employee benefits (FSAs,
 *     a USD stipend). See the marker on it.
 *
 * Both of the first two were found by human review, separately, weeks apart.
 * Provenance is not verification. A string that arrived from the original has
 * been READ by nobody; treat every one here as unverified until someone who
 * knows the company has confirmed it.
 *
 * All six content modules were swept for foreign company names on 2026-08-14
 * and none remain. The sweep cannot catch claims that are merely false, only
 * ones that name somebody else.
 *
 * The LEGACY_CURRENT_OPENINGS array that sat alongside these was referenced by
 * nothing and is not carried over.
 */

export const CAREERS_HERO = {
  title: "Careers At Arcompsol",
  heading: "Be a Part Of Something Great",
  description:
    "At Arcompsol, we believe in a flat hierarchy that is conducive for maximum growth for everyone working for us. If you are motivated by challenges and enjoy an environment that is dynamic, challenging and rewarding, we will always have a place for you.",
  cta: "Explore Opportunities",
};

export const WORK_WITH_US = {
  title: "Want to work with us?",
  description: "You should have three qualities",
};

export const QUALITIES = [
  {
    heading: "Do you have a Passion to learn",
    description:
      "If you have passion to learn new things, we want to hear from you. We look forward for people who has passion for everything they do.",
  },
  {
    heading: "Do you have Confidence to take responsibilities",
    description:
      "We are surrounded with people with full of confidence. So we need it in ton. Or else you will be an odd man out. Take responsibilities to grow.",
  },
  {
    heading: "Do you Empathy towards others",
    description:
      "Empathy is flowing in us. We onboard people who takes care of fellow human, it could be your colleague or your customer.",
  },
];

export const BENEFITS = [
  {
    benefit: "Bi-Annual Dinner",
    description:
      "Working day after day on projects In a remote environment can make you feel left out, but we at Arcompsol do plan bi-annual dinners for a refreshing eve with our colleagues.",
  },
  {
    benefit: "Remote Work",
    description:
      "Work from the ease of your home, enjoy time with family, and avoid the hectic traffic.",
  },
  {
    benefit: "Market Competitive Salaries",
    description:
      "With inflation sky-high these days, Arcompsol believes in keeping care of its employees by having market-competitive salaries.",
  },
  {
    benefit: "Flexible Working hours",
    description:
      "Arcompsol understands the importance of family and the pleasure of working on your own time, and that it gives you the flexibility to enjoy with family more and more.",
  },
  {
    benefit: "Location",
    /**
     * REPLACES A DIFFERENT COMPANY'S COPY. The original named a company called
     * "Cleta", put the office in the Bay Area and SoMa, and promised catered
     * lunches and a stocked kitchen — template boilerplate that shipped as
     * fact on the page where people decide whether to apply. Flagged in review
     * on 2026-08-14 and replaced on the owner's instruction to use the real
     * DHA office.
     *
     * Nothing below is invented. The office is the one in FOOTER_LOCATIONS,
     * and the remote arrangement is the same one the "Remote Work" benefit
     * above already describes — the old copy contradicted it by claiming a
     * team spread "across the country" around a single US office.
     *
     * THE AREA, NOT THE STREET ADDRESS, on purpose: site.ts records that
     * FOOTER_LOCATIONS holds "the only place the office address is written",
     * and retyping 156-H here would create the second copy that comment exists
     * to prevent. If the office moves, this sentence stays true.
     */
    description:
      "Our office is in DHA Phase 3, Lahore. Most of the team works remotely, so it is there for the days you want a desk and a room full of colleagues, rather than somewhere you have to be every morning.",
  },
  {
    /**
     * ANOTHER COMPANY'S COPY, KNOWINGLY KEPT — the owner's call, 2026-08-14,
     * to be resolved later. This is a recorded decision, not an oversight.
     *
     * Same template as the "Cleta" entry above and not fixed alongside it,
     * because fixing it means inventing figures. Raised twice in review: FSAs
     * are a US tax instrument, the stipend is in dollars, and the coverage
     * percentages are specific enough that a candidate could act on them. That
     * makes it the most consequential of the three carried-over strings, not
     * the least — Grootan was a wrong name and Cleta a wrong office, but this
     * one states benefits the company may not provide, to people deciding
     * whether to apply.
     *
     * Three ways out when it is picked up, in preference order: the owner's
     * real figures; the benefit rewritten with no numbers, currency or FSAs;
     * or the entry deleted. Five benefits read as fine.
     *
     * DO NOT rewrite this by guessing at a Pakistani equivalent, and do not
     * treat the fact that it has survived review as evidence it is true — it
     * has survived review precisely because everyone who looked at it flagged
     * it. Whatever it says next has to come from somebody who knows what
     * Arcompsol actually offers.
     */
    // Leading space removed. benefits.tsx trims it at render, so it was
    // invisible — which is why it survived; the workaround hid the dirt.
    benefit: "Health & Wellness",
    description:
      "* 100% employer-paid medical coverage and 99% employer-paid dental and vision coverage for you and all your dependents.FSAs available too.\n* $60 per month for however you prefer to stay in shape.",
  },
];

export interface JobOpening {
  id: string;
  title: string;
  team: string;
  location: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
}

export const CURRENT_OPENINGS: JobOpening[] = [
  {
    id: "backend-engineer-1",
    title: "Backend Engineer",
    team: "Engineering",
    location: "Remote",
    description:
      "Join our engineering team to build scalable backend systems and APIs. Work with modern technologies and contribute to high-impact projects that serve thousands of users.",
    requirements: [
      "3+ years of backend development experience",
      "Proficiency in Node.js, Python, or Java",
      "Experience with databases and cloud platforms",
      "Strong problem-solving skills",
    ],
    benefits: [
      "Competitive salary",
      "Remote work flexibility",
      "Professional development opportunities",
    ],
  },
  {
    id: "frontend-engineer-1",
    title: "Frontend Engineer",
    team: "Engineering",
    location: "Remote",
    description:
      "Create beautiful and intuitive user interfaces using modern frontend technologies. Collaborate with designers and backend engineers to deliver exceptional user experiences.",
    requirements: [
      "3+ years of frontend development experience",
      "Expertise in React, Vue, or Angular",
      "Strong CSS and JavaScript skills",
      "Experience with responsive design",
    ],
    benefits: [
      "Competitive salary",
      "Remote work flexibility",
      "Latest development tools and equipment",
    ],
  },
  {
    id: "fullstack-engineer-1",
    title: "Fullstack Engineer",
    team: "Engineering",
    location: "Remote",
    description:
      "Work across the entire technology stack, from frontend user interfaces to backend services. Take ownership of features from conception to deployment.",
    requirements: [
      "4+ years of fullstack development experience",
      "Proficiency in both frontend and backend technologies",
      "Experience with modern development practices",
      "Strong communication and collaboration skills",
    ],
    benefits: [
      "Competitive salary",
      "Remote work flexibility",
      "Opportunity to work on diverse projects",
    ],
  },
];

export const OPENINGS_SECTION = {
  title: "Current Openings",
  subtitle: "Join our team and work on projects that reach real users",
};
