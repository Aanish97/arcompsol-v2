/**
 * Home page copy: hero, the six services, and the six delivery milestones.
 *
 * SERVICES and MILESTONES were previously declared inside the component bodies
 * of HomePage.tsx and MilestonesList.tsx. Hoisting them out means editing a
 * service name no longer touches a file full of layout, and the arrays are not
 * rebuilt on every render.
 *
 * MILESTONES is shared by the home and about pages — both render the same
 * "How We Work?" section, so it must stay a single source.
 */
import aiAndMl from "../../public/images/ai-and-ml.png";
import bigData from "../../public/images/big-data.png";
import devOps from "../../public/images/devops.png";
import mobileDevelopment from "../../public/images/mobile-development.png";
import uiUxDesign from "../../public/images/ui-ux-design.png";
import webDevelopment from "../../public/images/web-development.png";
import { CONTACT_CTA } from "@/content/site";

/**
 * The hero.
 *
 * `label` replaced an `eyebrow` that held the full 50-character sentence
 * "Building products, services & everything in between" — inside a rounded
 * pill. A pill is a tag: two to four words. At sentence length it became a
 * band as wide as the column, competing with the headline directly beneath it
 * and consuming an entire line on narrow screens. The sentence itself was
 * fine; it was in the wrong component, and it now opens `description`.
 *
 * `label` is a positioning word, not a claim — change it here if "studio"
 * misdescribes the company.
 *
 * The two CTAs point at anchors that exist on THIS page (#contact-form in the
 * footer, #services below). Neither is a placeholder, because a hero button
 * that goes nowhere is worse than no hero button at all — and until now there
 * was no hero button at all.
 *
 * The description carried "world-class ... solutions that drive growth and
 * success" — four filler words in the single most-read sentence on the site,
 * and 27 words where a hero subhead wants 20. The replacement claims only what
 * the testimonials already say out loud: on time, and reachable while it
 * happens. Do not put an unfalsifiable adjective back in here.
 *
 * primaryCta is imported, not written. See CONTACT_CTA in content/site.ts.
 */
export const HOME_HERO = {
  label: "Software studio",
  heading: "Power Your Business with Innovation",
  description:
    "Building products, services and everything in between. We ship scalable software on time, and stay reachable while we do it.",
  primaryCta: CONTACT_CTA,
  secondaryCta: "See what we do",
};

/**
 * The six services. `description` is NEW copy — the original carried titles
 * only, so there is no earlier version of these sentences to preserve.
 *
 * Each one is written to a budget: roughly 110–150 characters, because it has
 * to fit the back of a card whose height is set by the front. Longer copy
 * overflows the shortest tile in the bento grid, which is the one in the last
 * row. Say what the service is and one concrete thing about how it is done —
 * these are read in about two seconds, while the reader's cursor is resting.
 */
export const SERVICES = [
  {
    title: "Web Development",
    image: webDevelopment,
    description:
      "Sites and web applications built on React, Next.js and Node, from a marketing page to the product your customers sign into every day.",
  },
  {
    title: "Mobile Development",
    image: mobileDevelopment,
    description:
      "Apps for iOS and Android, released to both stores from one codebase, with native modules where the platform genuinely needs them.",
  },
  {
    title: "UI/UX Design",
    image: uiUxDesign,
    description:
      "Research, wireframes and a design system. We find out what people actually do with the product before deciding what the screen looks like.",
  },
  {
    title: "AI and ML",
    image: aiAndMl,
    description:
      "Models trained on your own data for forecasting, classification and document extraction, connected to the systems your team already works in.",
  },
  {
    title: "Big Data",
    image: bigData,
    description:
      "Pipelines that collect, clean and warehouse what you already record, so a question about last quarter takes seconds instead of a week.",
  },
  {
    title: "DevOps",
    image: devOps,
    description:
      "Continuous delivery, containers and infrastructure as code, so releasing becomes routine instead of an evening someone has to stay late for.",
  },
];

/**
 * ONE SENTENCE, SPLIT ACROSS TWO FIELDS: "Services we provide" + "at
 * Arcompsol". Read them together and change them together.
 *
 * The split exists because the second half is DELIVERED BY THE KEYBOARD. It is
 * the word the animation types out, and it flies into the heading when the
 * board clears (sections/services-grid.tsx). The heading is complete in the
 * server HTML either way — a crawler, reader mode and a blocked bundle all get
 * the whole sentence; only the arrival is animated.
 */
export const SERVICES_SECTION = {
  titleLead: "Services we provide",
  titleWord: "at Arcompsol",
  description:
    "When it comes to design, our approach is simple: Everything is Human-centric, be it UI or UX",
};

export const MILESTONES_SECTION = {
  title: "How We Work?",
  description:
    // "Grootan" — a DIFFERENT agency — was named here, carried over verbatim
    // from the original (MilestonesList.tsx:304). It read as a competitor's
    // name in the middle of Arcompsol's own process section.
    "It’s simple: we love seeing your business grow. From planning and consulting to documentation and support, Arcompsol always keeps in close touch with our clients and keeps them involved in the entire process.",
};

export const MILESTONES = [
  {
    heading: "Planning and Consulting",
    description:
      "We work with you to understand the scope of your work and find the right solutions to meet your IT challenges with our customized solutions.",
  },
  {
    heading: "Visual and Technical Design",
    description:
      "Our design process starts with understanding your business objectives, goals and priorities so that it helps to find the user needs and align them with real-life user stories.",
  },
  {
    heading: "Development",
    description:
      "We turn your ideas into a reality, while we work on your project it will be placed on the development server where you get to watch the whole process, live.",
  },
  {
    heading: "Testing",
    description:
      "After the development and integration, we go underground for a little while (not literally) to make sure everything is working properly.",
  },
  {
    heading: "Documentation",
    description:
      "The documentation process goes with requirement gathering, authoring, testing, deployment with the documentation part.",
  },
  {
    heading: "Maintenance and Support",
    description:
      "Completing your project is just the beginning - monitoring and ongoing maintenance are parts of the process. We monitor the project performance and perform updates and offer Maintenance and Support at your request.",
  },
];
