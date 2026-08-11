/**
 * Site-wide copy and navigation: routes, nav tabs, footer sections, locations.
 *
 * ── IN SIMPLE WORDS ──
 * Everything a non-developer might reasonably want to change — a menu label, an
 * office address, a phone number — lives here rather than inside a component.
 * Editing this file is a content change, and it reads as one in review.
 *
 * ── BUSINESS RULES ──
 * - The "Services" tab points at an on-page anchor that only exists on the home
 *   page, so the header hides it everywhere else (see site-header.tsx).
 * - Footer service entries are intentionally NOT links: those pages do not
 *   exist yet, and `href: null` is what renders them as plain text instead of
 *   dead links. Give one an href the day its page ships.
 *
 * ── DO NOT ──
 * - Do not point a nav tab at a "#anchor" without adding an element with that
 *   id. The header smooth-scrolls by getElementById and silently does nothing
 *   when it misses.
 */

export const ROUTES = {
  HOME: "/",
  SERVICES: "#services",
  CAREERS: "/careers",
  ABOUT: "/about",
  LETS_TALK: "#contact-form",
} as const;

export type NavItem = {
  label: string;
  href: string;
  /** Rendered as the green pill rather than a plain tab. */
  highlight?: boolean;
  /** Only shown on the home page, where the target section exists. */
  homeOnly?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: ROUTES.HOME },
  { label: "Services", href: ROUTES.SERVICES, homeOnly: true },
  { label: "Careers", href: ROUTES.CAREERS },
  { label: "About", href: ROUTES.ABOUT },
  { label: "Let's Talk", href: ROUTES.LETS_TALK, highlight: true },
];

export type FooterLink = { label: string; href: string | null };

export const FOOTER_SECTIONS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Our Services",
    links: [
      { label: "App Development", href: null },
      { label: "Cloud Solutions", href: null },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "Careers", href: "/careers" },
      { label: "About Us", href: "/about" },
    ],
  },
];

export const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/arcompsol?igsh=MWUwdnB4dXNicjAzbQ==",
  },
  {
    // The PUBLIC company URL. This was .../86436337/admin/dashboard/ — the page
    // LinkedIn shows a page's own admins. Anyone who is not an Arcompsol admin
    // hit a permission wall instead of the company profile, which is every
    // visitor the link exists for.
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/86436337/",
  },
];

export const FOOTER_LOCATIONS = [
  {
    location: "UNITED STATES",
    // Was "Comming Soon!" — a misspelling sitting in the footer of every page.
    address: "Coming soon",
    email: "arcompsol@gmail.com",
  },
  {
    location: "PAKISTAN",
    address: "305 GT road, Near Shalimar Garden, Cantt, Lahore",
    phone: "+92 300 9442848",
    phone2: "+92 320 4487749",
    email: "arcompsol@gmail.com",
  },
];
