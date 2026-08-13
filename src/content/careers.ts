/**
 * Careers page copy: the three qualities, the benefits carousel, and the
 * current job openings.
 *
 * Every string is byte-identical to the original project's constants.ts and
 * data/openings.ts — this is a move, not a rewrite. The LEGACY_CURRENT_OPENINGS
 * array that sat alongside these was referenced by nothing and is not carried
 * over.
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
    description:
      "We have a distributed team, with Cleta working across the country. Those located in the Bay Area love our sunny, beautiful SoMa office. In addition to catered lunches, our kitchen is perennially stocked with snacks and drinks. Special requests welcome!",
  },
  {
    benefit: " Health & Wellness",
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
