"use client";

/**
 * An internal link that knows where you already are.
 *
 * ── IN SIMPLE WORDS ──
 * A normal link, except for two cases a plain one gets wrong: pointing at a
 * section of the current page, and pointing at the page you are already on.
 * The first scrolls you down to the section; the second takes you back to the
 * top instead of doing nothing at all.
 *
 * ── BUSINESS RULES ──
 * - An in-page anchor ("#services", "#contact-form") scrolls rather than
 *   navigates, so the URL does not grow a hash the header then has to reconcile
 *   with its own section observer.
 * - A link to the route you are on returns you to the top of it. "Home" and the
 *   logo are the whole reason: they are the site's universal "start again"
 *   control and they must behave like one on every page, including the one they
 *   point at.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * NEXT'S <Link> IS A NO-OP WHEN THE DESTINATION IS THE CURRENT ROUTE. Not a
 * slow navigation, not a warning — nothing happens. Measured on 2026-08-17 from
 * scrollY 4647 at the bottom of the home page: the header wordmark, the nav's
 * "Home" tab, the footer's "Home" link and the footer wordmark all left the
 * page exactly where it stood. This is the file that fixes all four, which is
 * why it is one component and not four copies of an onClick.
 *
 * MODIFIED CLICKS ARE LEFT ALONE. cmd/ctrl/shift/alt-click and middle-click are
 * a request for a new tab or window, and interception swallowed them: cmd+click
 * on the Services tab used to scroll the tab you were in and open nothing. The
 * guard is on every branch, not just the same-route one, because the hash
 * branch had the same bug.
 *
 * IT IS A CLIENT COMPONENT AND ITS CONSUMERS NEED NOT BE. site-footer.tsx is
 * deliberately a server component and says so; passing its links through here
 * puts only this leaf in the bundle, not the footer's markup, its content
 * imports or its icons.
 *
 * ── DO NOT ──
 * - Do not use this for an external or non-route href (mailto:, tel:, https:).
 *   It compares `href` to the pathname, which is meaningless for those, and
 *   next/link is already correct for them.
 * - Do not add a second copy of the same-route check in a consumer. That is the
 *   duplication this file exists to prevent.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

import { scrollToId, scrollToTop } from "@/lib/scroll-to";

type SiteLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  /** Ran after any click that this component handled or let through — the
   *  mobile sheet closes on it. */
  onNavigate?: () => void;
};

export function SiteLink({
  href,
  onNavigate,
  children,
  ...rest
}: SiteLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      onClick={(event) => {
        // The browser's own job: open a new tab, a new window, or a download.
        // Nothing below may run for these.
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }

        if (href.startsWith("#")) {
          event.preventDefault();
          scrollToId(href.slice(1));
        } else if (href === pathname) {
          event.preventDefault();
          scrollToTop();
        }

        onNavigate?.();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
