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
 * This is a SERVER component. Only <ContactFormLazy /> is interactive and it
 * opts into the client itself, so the addresses, link columns and icons ship as
 * HTML with no JavaScript. Marking this file "use client" would pull all of it
 * into the bundle for nothing.
 *
 * Links go through next/link. The original called window.location.href inside
 * an onClick on top of an <a>, forcing a full document reload — losing the
 * client cache and re-downloading the app on every footer click.
 *
 * Footer service entries with href: null render as plain text rather than
 * links, because those pages do not exist yet. See content/site.ts.
 *
 * ── DO NOT ──
 * - Do not move the #contact-form id off the form element. The "Let's Talk" nav
 *   tab scrolls to it by id from every page.
 * - Do not make the phone numbers plain text. On a phone, a tel: link is the
 *   difference between one tap and copying digits by hand.
 */
import Link from "next/link";

import { BrandLogo } from "@/components/common/brand-logo";
import { InstagramIcon, LinkedInIcon } from "@/components/common/social-icons";
import { ContactFormLazy } from "@/components/layout/contact-form-lazy";
import {
  FOOTER_LOCATIONS,
  FOOTER_SECTIONS,
  SOCIAL_LINKS,
} from "@/content/site";

const SOCIAL_ICONS = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
} as const;

export function SiteFooter() {
  return (
    <footer className="w-full bg-brand-navy text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <div className="flex flex-col">
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-brand-on-dark uppercase">
              Get in touch
            </p>
            <h2 className="mt-4 max-w-md text-white">
              Love to hear from you, Get in touch!
            </h2>
            <p className="measure mt-4 text-white/60">
              Tell us what you are building. We read every message and reply to
              the ones we can help with.
            </p>

            {/* sm:2 → lg:1 → xl:2. Breakpoints are viewport-wide but this
                grid lives in a column that NARROWS at lg when the footer
                splits in two, so the naive sm:grid-cols-2 is at its worst
                exactly where the viewport looks widest. */}
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-1 xl:grid-cols-2">
              {FOOTER_LOCATIONS.map((office) => (
                <div key={office.location} className="flex flex-col gap-2">
                  <p className="text-xs font-semibold tracking-[0.14em] text-white/80 uppercase">
                    {office.location}
                  </p>
                  <p className="text-sm text-white/55">{office.address}</p>
                  {office.phone && (
                    <a
                      href={`tel:${office.phone.replace(/\s/g, "")}`}
                      className="text-sm text-white/55 transition-colors hover:text-brand-on-dark"
                    >
                      {office.phone}
                    </a>
                  )}
                  {office.phone2 && (
                    <a
                      href={`tel:${office.phone2.replace(/\s/g, "")}`}
                      className="text-sm text-white/55 transition-colors hover:text-brand-on-dark"
                    >
                      {office.phone2}
                    </a>
                  )}
                  <a
                    href={`mailto:${office.email}`}
                    className="text-sm text-white/55 transition-colors hover:text-brand-on-dark"
                  >
                    {office.email}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="flex lg:justify-end">
            <ContactFormLazy />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-10 border-t border-white/10 pt-10 md:flex-row md:justify-between">
          <BrandLogo variant="white" />

          <div className="flex flex-wrap gap-12">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.heading} className="flex flex-col gap-3">
                <p className="text-sm font-semibold tracking-wide text-white">
                  {section.heading}
                </p>
                {section.links.map((link) =>
                  link.href ? (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-brand-on-dark"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span key={link.label} className="text-sm text-white/70">
                      {link.label}
                    </span>
                  ),
                )}
              </div>
            ))}

            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold tracking-wide text-white">
                Follow us
              </p>
              <div className="flex gap-4">
                {SOCIAL_LINKS.map((social) => {
                  const Icon =
                    SOCIAL_ICONS[social.label as keyof typeof SOCIAL_ICONS];
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="text-white/70 transition-colors hover:text-brand-on-dark"
                    >
                      <Icon className="size-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
