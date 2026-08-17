/**
 * Dark footer panel: the enquiry form, the office details, link columns, socials.
 *
 * ── IN SIMPLE WORDS ──
 * The navy block at the bottom of every page. Left side says how to reach the
 * company, right side is the form. Underneath sit the logo, the link columns
 * and the social icons.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The left column carries the real office details — address, both phone
 * numbers, the email. Those exist in content/site.ts and were rendered by
 * nothing: in the original they sat inside a commented-out block, so the
 * column held one heading floating in a large empty area. Some people will not
 * fill in a form, and a page asking to be contacted should say how to do it
 * another way.
 *
 * This is a SERVER component, and it stays one. <ContactFormLazy /> and the
 * link columns' <SiteLink> opt into the client themselves, so the addresses,
 * headings and icons still ship as HTML with no JavaScript — a client leaf
 * inside a server component costs only that leaf. Marking this file
 * "use client" would pull all of it into the bundle for nothing.
 *
 * Route links go through SiteLink, which is next/link plus the two cases a
 * plain one gets wrong here. The original called window.location.href inside an
 * onClick on top of an <a>, forcing a full document reload — losing the client
 * cache and re-downloading the app on every footer click. mailto:, tel: and the
 * social links stay plain <a>: they leave the app entirely.
 *
 * Footer service entries with href: null render as plain text rather than
 * links, because those pages do not exist yet. See content/site.ts.
 *
 * ── DO NOT ──
 * - Do not move the #contact-form id back onto the <form>. This note used to
 *   say the opposite, and the opposite was the bug: the form is inside a
 *   next/dynamic ssr:false chunk, so an id on it is in no page's server HTML.
 *   "Let's Talk" scrolls to it by id from every page and found nothing to
 *   scroll to until the chunk hydrated. It belongs on the wrapper below.
 * - Do not make the phone numbers plain text. On a phone, a tel: link is the
 *   difference between one tap and copying digits by hand.
 */
import { BrandLogo } from "@/components/common/brand-logo";
import { Reveal } from "@/components/common/reveal";
import { SiteLink } from "@/components/common/site-link";
import { StaggerText } from "@/components/common/stagger-text";
import { InstagramIcon, LinkedInIcon } from "@/components/common/social-icons";
import { ContactFormLazy } from "@/components/layout/contact-form-lazy";
import {
  FOOTER_LOCATIONS,
  FOOTER_SECTIONS,
  SOCIAL_LINKS,
} from "@/content/site";

/* Links on the navy panel hover to --brand-blue-on-dark, not the logo green.
   The green is already doing a job on this panel — it is the colour of the
   "YOUR DETAILS" / "YOUR PROJECT" group labels and of the form's focus ring —
   so a link that lights up green is the same signal as a heading. Blue is the
   palette's colour for links, and on this ground it is the logo's own blue.
   5.70:1 on --brand-navy. */
const SOCIAL_ICONS = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
} as const;

export function SiteFooter() {
  return (
    <footer className="w-full bg-brand-navy text-on-dark">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <div className="flex flex-col">
            {/* NO EYEBROW. It read "Get in touch" directly above a heading
                that reads "Get in touch!" — the same three words twice, 4px
                apart. It also appeared on every page, so it was the single
                most-repeated eyebrow on the site. */}
            {/* The only <Reveal> in the footer. It exists so this heading
                staggers like the other three; scoped to the heading and its
                lead line, leaving the addresses and the form un-animated. */}
            <Reveal>
              <h2 className="max-w-md text-on-dark">
                <StaggerText text="Love to hear from you, Get in touch!" />
              </h2>
              <p className="measure mt-4 text-on-dark-muted">
                Tell us what you are building. We read every message and reply
                to the ones we can help with.
              </p>
            </Reveal>

            {/* sm:2 → lg:1 → xl:2. Breakpoints are viewport-wide but this
                grid lives in a column that NARROWS at lg when the footer
                splits in two, so the naive sm:grid-cols-2 is at its worst
                exactly where the viewport looks widest. */}
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-1 xl:grid-cols-2">
              {FOOTER_LOCATIONS.map((office) => (
                <li key={office.location} className="flex flex-col gap-1">
                  {/* Sentence case, NOT tracked caps. These name real places
                      and are content, but styled as eyebrows they read as two
                      more decorative labels in a footer that already had
                      several. Same information, one less uppercase rhythm. */}
                  <p className="text-sm font-semibold text-on-dark">
                    {office.location}
                  </p>
                  <p className="text-sm text-on-dark-muted">{office.address}</p>
                  {office.phone && (
                    <a
                      href={`tel:${office.phone.replace(/\s/g, "")}`}
                      className="-mx-2 inline-flex min-h-11 w-fit items-center rounded-md px-2 text-sm text-on-dark-muted transition-colors hover:text-brand-on-dark focus-ring-dark"
                    >
                      {office.phone}
                    </a>
                  )}
                  {office.phone2 && (
                    <a
                      href={`tel:${office.phone2.replace(/\s/g, "")}`}
                      className="-mx-2 inline-flex min-h-11 w-fit items-center rounded-md px-2 text-sm text-on-dark-muted transition-colors hover:text-brand-on-dark focus-ring-dark"
                    >
                      {office.phone2}
                    </a>
                  )}
                  <a
                    href={`mailto:${office.email}`}
                    className="-mx-2 inline-flex min-h-11 w-fit items-center rounded-md px-2 text-sm text-on-dark-muted transition-colors hover:text-brand-on-dark focus-ring-dark"
                  >
                    {office.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* THE ANCHOR LIVES HERE, ON SERVER-RENDERED MARKUP, and that is the
              whole point. It used to sit on the <form> itself — inside a
              next/dynamic ssr:false chunk — so it was in no page's server HTML
              and did not exist until that chunk hydrated. Verified by curl on
              2026-08-17: `id="contact-form"` appeared 0 times in the HTML of /,
              /about and /careers. The chunk landed at ~1036ms, and until it did
              `scrollToId("contact-form")` found nothing and returned silently,
              so the site's ONE conversion CTA — the header pill on every route,
              plus the hero button — did nothing at all for the first second of
              every page view.

              On a wrapper rather than the form so it survives the form being
              absent, which since the visibility gate in contact-form-lazy.tsx
              is now the normal state until someone scrolls down here.

              scroll-mt-20 moved with the id, for the reason it always had: the
              header is sticky at 73px, and without it the form lands at y=0
              with its first label behind the header. It matches #services and
              the careers anchors; keep all of them equal. */}
          <div id="contact-form" className="flex scroll-mt-20 lg:justify-end">
            <ContactFormLazy />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-10 border-t border-night-line pt-10 md:flex-row md:justify-between">
          <BrandLogo variant="white" />

          {/* A column with links is a <nav>, named by the heading it already
              renders. These are site destinations, so they belong in the
              landmark list a screen-reader user navigates by — and naming each
              one from its own heading is what keeps "Company" and "Our
              Services" tellable apart there.

              A COLUMN WITH NO LINKS IS NOT A LANDMARK. "Our Services" lists two
              entries and both carry `href: null`, because those pages do not
              exist yet — so it rendered as a navigation region containing two
              <span>s and zero links. Someone navigating by landmark was offered
              "Our Services, navigation", went there, and found nothing to
              follow. A <nav> is a promise that there is somewhere to go; this
              one could not keep it, so it is a plain <div> until an entry gets
              an href, at which point it becomes a landmark again on its own.
              The heading, the list and every pixel are identical either way. */}
          <div className="flex flex-wrap gap-12">
            {FOOTER_SECTIONS.map((section) => {
              const headingId = `footer-${section.heading.toLowerCase().replace(/\W+/g, "-")}`;
              const navigable = section.links.some((link) => link.href);
              const Column = navigable ? "nav" : "div";

              return (
                <Column
                  key={section.heading}
                  aria-labelledby={navigable ? headingId : undefined}
                  className="flex flex-col gap-1"
                >
                  <p
                    id={headingId}
                    className="text-sm font-semibold tracking-wide text-on-dark"
                  >
                    {section.heading}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        {link.href ? (
                          /* SiteLink, because this list points at the routes the
                           visitor is most likely to already be on. The footer
                           is the bottom of a ~4,650px page, so "Home" clicked
                           from here is nearly always a same-route click — and
                           through a plain <Link> that does nothing whatsoever.
                           "About Us" and "Careers" had the same dead spot on
                           their own pages. */
                          <SiteLink
                            href={link.href}
                            className="-mx-2 inline-flex min-h-11 w-fit items-center rounded-md px-2 text-sm text-on-dark-soft transition-colors hover:text-brand-on-dark focus-ring-dark"
                          >
                            {link.label}
                          </SiteLink>
                        ) : (
                          /* Pages that do not exist yet render as plain text
                           rather than as dead links. See content/site.ts. */
                          <span className="inline-flex min-h-11 w-fit items-center text-sm text-on-dark-soft">
                            {link.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </Column>
              );
            })}

            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold tracking-wide text-on-dark">
                Follow us
              </p>
              {/* size-11 boxes, not size-5 icons. The glyph stays 20px; the
                  BOX is the 44px target. -mx-3 pulls the row back so the first
                  icon still lines up with the heading above it. */}
              <ul className="-mx-3 flex gap-1">
                {SOCIAL_LINKS.map((social) => {
                  const Icon =
                    SOCIAL_ICONS[social.label as keyof typeof SOCIAL_ICONS];
                  return (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="grid size-11 place-items-center rounded-full text-on-dark-soft transition-colors hover:bg-night-line/60 hover:text-brand-on-dark focus-ring-dark"
                      >
                        <Icon className="size-5" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
