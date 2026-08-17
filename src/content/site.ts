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

/**
 * The one label for the one contact action, used by the header button and the
 * hero's primary CTA alike.
 *
 * Exported rather than repeated so the header and the hero cannot diverge —
 * they once carried different capitalisation AND different apostrophe
 * characters for the same button. content/home.ts imports this.
 *
 * U+2019 is the correct apostrophe for an English contraction. Sentence case,
 * because every other control on the site is sentence case.
 */
export const CONTACT_CTA = "Let’s talk";

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: ROUTES.HOME },
  { label: "Services", href: ROUTES.SERVICES, homeOnly: true },
  { label: "Careers", href: ROUTES.CAREERS },
  { label: "About", href: ROUTES.ABOUT },
  { label: CONTACT_CTA, href: ROUTES.LETS_TALK, highlight: true },
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

/**
 * The one email and phone number, referenced rather than retyped.
 *
 * The footer, the mobile nav panel and the contact form's failure message all
 * print these. They were literals in three files, which is how a changed
 * address ends up updated in one place and stale in the others — the address
 * moved from arcompsol@gmail.com to aanish@arcompsol.com on 2026-08-12 and the
 * form's error toast still carried the old one.
 */
export const CONTACT = {
  email: "aanish@arcompsol.com",
  phone: "+92 300 9442848",
} as const;

export const FOOTER_LOCATIONS = [
  {
    // Sentence case in the DATA, not via CSS — styling an all-caps string as
    // normal text leaves it shouting.
    location: "United States",
    address: "Coming soon",
    email: CONTACT.email,
  },
  {
    location: "Pakistan",
    /**
     * CONFIRMED BY THE OWNER ON 2026-08-14, exactly as written.
     *
     * The office moved from "305 GT road, Near Shalimar Garden, Cantt, Lahore"
     * to this address in commit 7fe4f2e — which was titled "standardize code
     * formatting and improve readability across components". A real business
     * fact, changed on every page of a public site, inside a formatting
     * commit, with nothing recorded about where it came from. Review caught it
     * and could not verify it from the diff, which is the correct outcome: a
     * reviewer has no way to check an address, so the only defence is that the
     * change says who confirmed it and when.
     *
     * That is what this comment is for. The email two blocks up carries the
     * same kind of note for the same reason. If this address changes again,
     * the change is not finished until this line is updated with it.
     *
     * THE ONLY PLACE THE OFFICE ADDRESS IS WRITTEN — verified 2026-08-14, not
     * assumed: no JSON-LD, no schema.org LocalBusiness or PostalAddress, no
     * metadata, manifest or OG copy anywhere in the repo. careers.ts names the
     * AREA only ("DHA Phase 3, Lahore") specifically so it does not become a
     * second copy. Confirming this string once therefore settles every surface
     * it renders on; if you add structured data later, that stops being true.
     *
     * No trailing ", Pakistan" — the `location` field directly above already
     * reads "Pakistan" and renders 40px higher in the same block.
     */
    address: "156-H Commercial Area, Sector Y DHA Phase 3, Lahore",
    phone: CONTACT.phone,
    phone2: "+92 320 4487749",
    email: CONTACT.email,
  },
];
