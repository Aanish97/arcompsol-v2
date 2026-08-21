"use client";

/**
 * The mobile navigation panel: the hamburger, and the sheet it opens.
 *
 * ── IN SIMPLE WORDS ──
 * Below the `md` breakpoint the nav tabs are replaced by a single button. This
 * is that button and the panel that slides in from the right when it is
 * pressed — the links, the green "Let's talk" action, and a block at the bottom
 * with the email, the phone number and the two social accounts.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * SPLIT OUT OF site-header.tsx ON REVIEW, 2026-08-17. The panel was 159 of that
 * file's 460 lines and shares nothing with the bar except `NavLink` and the
 * items list — so the bar's file is now the bar, the observer and the
 * active-tab logic, and this is the panel.
 *
 * THE OPEN STATE LIVES HERE, not in the header. It was declared in
 * site-header.tsx and read in exactly three places, all of them inside this
 * panel. Lifting it out would be state held by a component that cannot see what
 * it is for.
 *
 * `items` and `isItemActive` come in as props because they are the HEADER's
 * decisions: which tabs exist on this route (Services is home-only) and which
 * one is current (a hash tab wins over the path tab while its section is on
 * screen). Both are derived from the pathname and an IntersectionObserver that
 * belong to the bar. Do not recompute either here — two answers to "which tab
 * is current" is exactly the drift this split must not introduce.
 *
 * ── DO NOT ──
 * - Do not drop the `onNavigate` close handler. Navigating with the panel still
 *   open leaves it covering the page you just moved to.
 * - Do not give this its own copy of NavLink. See layout/nav-link.tsx — the
 *   hash interception is what makes in-page anchors land at the right offset,
 *   and a second copy of it rots.
 */
import { Mail, Menu, Phone } from "lucide-react";
import { useState } from "react";

import { BrandLogo } from "@/components/common/brand-logo";
import { InstagramIcon, LinkedInIcon } from "@/components/common/social-icons";
import { NavLink } from "@/components/layout/nav-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CONTACT, SOCIAL_LINKS, type NavItem } from "@/content/site";

/**
 * Same label -> mark map the footer uses. These are brand logos, not lucide
 * glyphs (lucide has no Instagram or LinkedIn export in this version), and the
 * two surfaces must not drift to different marks for the same account.
 */
const SOCIAL_ICONS = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
} as const;

export function SiteHeaderSheet({
  items,
  isItemActive,
}: {
  items: NavItem[];
  isItemActive: (item: NavItem) => boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          // size-11, because `icon-lg` is size-9 (36px) and this is the
          // ONLY navigation control that exists below md — the one control
          // on the site where a missed tap has nowhere else to go. Set here
          // rather than on the shared variant, which other call sites size
          // their own way (see the carousel arrows).
          className="size-11 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      {/* --surface, not the popover white. Every band on the site is warm
          paper; a pure-white panel sliding over it reads as a different
          product. p-0 because this panel sets its own bands — a header
          rule, a nav block, and a footer pinned to the bottom — and the
          default padding would inset their rules off the panel edges.

          w-76, not w-[19rem]. Identical output (76 × 0.25rem = 19rem =
          304px; Tailwind v4 generates the spacing scale dynamically, so
          this needs no config), but it sits on the same scale as the
          sm:w-80 beside it instead of reading as an arbitrary value next
          to a token. It was the only arbitrary rem spacing value in src/. */}
      <SheetContent side="right" className="w-76 gap-0 bg-surface p-0 sm:w-80">
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        {/* The wordmark, so the open panel still says whose site this is —
            it covers the header that was carrying it. Its height matches
            the bar's min-h-16 so the rule lands where the header's does,
            and the pr-14 keeps it clear of the close button, which the
            Sheet renders absolutely at top-3 right-3. */}
        <div className="flex min-h-16 items-center border-b border-border px-5 pr-14">
          <BrandLogo />
        </div>

        {/* A labelled group, not a bare stack. At this width the rows are
            the only thing on screen, and a quiet caption over them gives
            the panel a top edge to start reading from instead of four
            links floating under a rule. */}
        {/* Named by the caption it already had, rather than by a second
            hand-written aria-label that would drift from it. */}
        <nav
          aria-labelledby="sheet-menu-caption"
          className="flex flex-col gap-1 px-3 pt-5 pb-3"
        >
          <p
            id="sheet-menu-caption"
            className="px-4 pb-2 text-xs font-semibold tracking-[0.12em] text-ink-muted uppercase"
          >
            Menu
          </p>
          <ul className="flex flex-col gap-1">
            {items
              .filter((item) => !item.highlight)
              .map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    isActive={isItemActive(item)}
                    onNavigate={() => setIsOpen(false)}
                    variant="sheet"
                  />
                </li>
              ))}
          </ul>
        </nav>

        {/* The CTA is lifted out of the row list and given the full width.
            It is the one action on the panel rather than a fifth
            destination, and inline it read as another list item. Still a
            NavLink, so #contact-form goes through scrollToId like
            everywhere else. */}
        {items
          .filter((item) => item.highlight)
          .map((item) => (
            <div key={item.href} className="px-3 pb-4">
              <NavLink
                item={item}
                isActive={false}
                onNavigate={() => setIsOpen(false)}
                variant="sheet"
              />
            </div>
          ))}

        {/* mt-auto pins this to the bottom, and --surface-alt separates it
            from the nav as its own band rather than another rule across
            the same ground. The panel is full height and the nav fills its
            top third, so without this the lower half is empty — and a
            phone is the one device where tapping a number to call is the
            shortest path to the same outcome as the form. */}
        <div className="mt-auto border-t border-border bg-surface-alt px-5 py-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-ink-muted uppercase">
            Get in touch
          </p>

          {/* Two ways to reach the same company — a list, so it is
              announced as "list, 2 items" rather than as two links that
              happen to sit near each other. */}
          <ul className="mt-2 flex flex-col">
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="group/row -mx-2 flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm text-ink-soft transition-colors hover:text-brand focus-ring"
              >
                {/* A tinted tile rather than a bare glyph: at 14px an icon
                    on its own reads as a bullet, and the tile gives the two
                    rows a shared left edge for the labels to hang off. */}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover/row:bg-brand group-hover/row:text-on-brand">
                  <Mail className="size-4" />
                </span>
                <span className="truncate">{CONTACT.email}</span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="group/row -mx-2 flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm text-ink-soft transition-colors hover:text-brand focus-ring"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover/row:bg-brand group-hover/row:text-on-brand">
                  <Phone className="size-4" />
                </span>
                <span className="truncate">{CONTACT.phone}</span>
              </a>
            </li>
          </ul>

          {/* The same two socials the footer carries. The footer is the
              only other place they live, and it is a long scroll away from
              an open nav panel. */}
          <ul className="mt-4 flex items-center gap-2 border-t border-border pt-4">
            {SOCIAL_LINKS.map((social) => {
              const Icon =
                SOCIAL_ICONS[social.label as keyof typeof SOCIAL_ICONS];
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex size-11 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-brand/10 hover:text-brand focus-ring"
                  >
                    <Icon className="size-4.5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
