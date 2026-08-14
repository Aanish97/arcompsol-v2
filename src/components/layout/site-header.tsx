"use client";

/**
 * Sticky site header: wordmark, nav tabs, and the mobile sheet.
 *
 * ── IN SIMPLE WORDS ──
 * The bar across the top. On a phone the links collapse into a panel that
 * slides in from the right. "Let's talk" is the green pill; the other tabs
 * underline when you are on that page.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The nav list is built ONCE in the component body and rendered twice, in the
 * bar and in the sheet. The original built it inside a `getTabs()` helper that
 * called useRouter() itself and was then invoked twice per render — a rules-of-
 * hooks violation that also shadowed the outer `router`. It happened to work,
 * but any early return added above it would have desynced the hook order and
 * crashed on a route change. Hooks belong in the component body.
 *
 * "Services" points at #services, a section that only exists on the home page,
 * so it is filtered out elsewhere — otherwise the tab is a dead link from
 * /about and /careers.
 *
 * Hash links are intercepted rather than left to the browser: a plain #anchor
 * jumps instantly and, on a Next route that has not painted the target yet,
 * jumps to the wrong offset. The scroll itself goes through lib/scroll-to,
 * shared with the hero buttons and the careers page — read its header before
 * changing anything about how this navigates.
 *
 * OPAQUE, with NO backdrop-filter. A backdrop-filter on a STICKY element makes
 * the browser re-sample and blur everything scrolling beneath it on every
 * frame, and the artefact is worst over dark, high-contrast content — the
 * footer visibly flickers while the rest of the page looks fine. A solid bar
 * costs nothing and is visually near-identical.
 *
 * ── DO NOT ──
 * - Do not reintroduce backdrop-blur here without scrolling over the footer to
 *   check. It is the single most expensive thing this header can do.
 * - Do not make this a server component. It reads the pathname and holds the
 *   sheet's open state; both need the client.
 * - Do not drop the sheet's onClick close handler. Navigating with the panel
 *   still open leaves it covering the page you just moved to.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Menu, Phone } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/common/brand-logo";
import { InstagramIcon, LinkedInIcon } from "@/components/common/social-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CONTACT, NAV_ITEMS, SOCIAL_LINKS, type NavItem } from "@/content/site";
import { scrollToId } from "@/lib/scroll-to";
import { cn } from "@/lib/utils";

/**
 * Same label -> mark map the footer uses. These are brand logos, not lucide
 * glyphs (lucide has no Instagram or LinkedIn export in this version), and the
 * two surfaces must not drift to different marks for the same account.
 */
const SOCIAL_ICONS = {
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
} as const;

/**
 * ONE component for both renders, because both must navigate identically —
 * the hash interception below is the whole reason in-page anchors land at the
 * right offset, and a second copy of it in the sheet would rot.
 *
 * `variant` only changes how it LOOKS. "bar" is the horizontal desktop tab
 * with its hover underline; "sheet" is a full-width row in the mobile panel,
 * where a centred label with an underline reads as a divider rather than as
 * the page you are on (measured from the panel: four centred labels with a
 * full-width rule under the active one).
 */
function NavLink({
  item,
  isActive,
  onNavigate,
  variant = "bar",
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
  variant?: "bar" | "sheet";
}) {
  const isAnchor = item.href.startsWith("#");
  const sheet = variant === "sheet";

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      onClick={(event) => {
        if (isAnchor) {
          event.preventDefault();
          scrollToId(item.href.slice(1));
        }
        onNavigate?.();
      }}
      className={cn(
        // min-h-11 = the 44px minimum. With py-2 these measured 39px tall, so
        // every item in the primary nav — including the only CTA in the header
        // — was under the touch minimum. inline-flex + items-center keeps the
        // label optically centred while the box grows to meet it.
        "relative inline-flex min-h-11 min-w-11 items-center transition-colors duration-220 ease-out",
        // Brand ring, not the UA default. Nothing here removed the outline, so
        // focus WAS visible — it just did not match the ring every other
        // control on the site uses, which reads as an untouched corner.
        "focus-ring",

        sheet
          ? // A ROW, not a tab: full width, left-aligned, 48px tall. A finger
            // gets the whole width of the panel instead of the width of the
            // word, and the labels share one left edge to read down.
            "min-h-12 w-full justify-start rounded-xl px-4 text-[0.9375rem]"
          : "justify-center text-[15px]",

        item.highlight
          ? cn(
              "bg-brand font-medium text-on-brand",
              sheet
                ? // Squarer and shadowed, so the one action in the panel sits
                  // forward of the flat rows above it rather than reading as
                  // a green-filled fifth row.
                  "min-h-12 justify-center rounded-xl shadow-[0_8px_20px_rgb(var(--shadow-tint)/0.18)] hover:bg-brand-deep"
                : "rounded-lg px-4 hover:scale-105 hover:bg-brand-deep hover:shadow-[0_12px_32px_rgb(var(--shadow-tint)/0.12)]",
            )
          : "text-ink-soft hover:text-ink",

        // The sliding underline is a desktop-tab affordance. In the panel the
        // active state is a tinted row with a brand rule down its left edge —
        // the same "this one" language the quote cards use.
        !item.highlight &&
          !sheet &&
          "after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform hover:after:scale-x-100",
        !item.highlight &&
          !sheet &&
          isActive &&
          "font-medium text-ink after:scale-x-100",

        !item.highlight && sheet && "hover:bg-surface-alt hover:text-ink",
        // Brand tint, not the grey surface: the panel's ground IS --surface and
        // its footer band is --surface-alt, so a --surface-alt active row was
        // the same value as furniture elsewhere in the panel and read as a
        // container rather than as "you are here". The left rule is the same
        // marker the quote cards use.
        !item.highlight &&
          sheet &&
          isActive &&
          "bg-brand/10 font-semibold text-brand before:absolute before:inset-y-2.5 before:left-0 before:w-1 before:rounded-r-full before:bg-brand",
      )}
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeHash, setActiveHash] = useState<string | null>(null);

  const items = NAV_ITEMS.filter((item) => !item.homeOnly || pathname === "/");

  /**
   * The in-page tabs, as one string. A plain string rather than the array so
   * the effect below has a dependency that is stable across renders and can be
   * checked statically — `items` is rebuilt every render and would tear the
   * observer down and back up on each one.
   */
  const hashKey = items
    .filter((item) => item.href.startsWith("#") && !item.highlight)
    .map((item) => item.href)
    .join("|");

  /**
   * Underlines an in-page tab while its section is on screen.
   *
   * `pathname === item.href` can never be true for "#services" — a pathname is
   * never a hash — so that tab had no active state at all, on the one page it
   * appears on. This watches the section instead of recording the click:
   * clicking scrolls there and the underline follows, and it also clears
   * itself when you scroll away, which a click-only flag would not.
   *
   * The rootMargin is a band across the middle of the viewport rather than the
   * whole of it. A tall section is on screen for most of the page otherwise,
   * so the tab would stay lit while you read something else entirely.
   */
  useEffect(() => {
    const hrefs = hashKey ? hashKey.split("|") : [];
    const targets = hrefs
      .map((href) => ({ href, node: document.getElementById(href.slice(1)) }))
      .filter((entry): entry is { href: string; node: HTMLElement } =>
        Boolean(entry.node),
      );

    // No observer and no state write. A route without in-page tabs is handled
    // by `activeTab` below, which ignores a stale hash rather than clearing it
    // here — setting state straight from an effect costs an extra render pass
    // on every navigation.
    if (!targets.length) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const href = `#${entry.target.id}`;
          if (entry.isIntersecting) visible.add(href);
          else visible.delete(href);
        }
        // Order by the nav, not by observer callback order, so two overlapping
        // sections resolve the same way on every scroll.
        setActiveHash(targets.find((t) => visible.has(t.href))?.href ?? null);
      },
      { rootMargin: "-25% 0px -55% 0px" },
    );

    for (const { node } of targets) observer.observe(node);
    return () => observer.disconnect();
  }, [hashKey]);

  /**
   * The hash that counts right now — DERIVED, so a hash left over from the
   * previous route simply stops matching instead of needing to be cleared.
   * Leaving /  for /about drops "#services" from the nav, and without this the
   * stale value would still suppress the "About" underline below.
   */
  const activeTab =
    activeHash && hashKey.split("|").includes(activeHash) ? activeHash : null;

  /**
   * Whether a tab is the current one. A hash tab wins over the path tab: on the
   * home page `pathname === "/"` is true the whole time, so without this both
   * "Home" and "Services" would be underlined at once while you read services.
   */
  const isItemActive = (item: NavItem) =>
    item.href.startsWith("#")
      ? activeTab === item.href
      : pathname === item.href && !activeTab;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface">
      {/* max-w-6xl + px-6 to MATCH Section width="wide" and the footer. This was
          max-w-5xl/px-5, so above 1152px the logo sat 64px inside the left edge
          of the headline directly beneath it, and 4px off on mobile. Nothing
          announces a misaligned grid, but the header is the one element on
          screen during every scroll — it is the reference edge for the page. */}
      {/* py trimmed as the mark grew. The logo went 36/40px -> 44/48px, and at
          the old md:py-4 that made an 80px bar — the point where the header
          starts eating the viewport rather than framing it. 48 + 24 = 72px,
          which is the comfortable band for a marketing nav. */}
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-6 py-3 md:px-8">
        <BrandLogo />

        {/* md, not sm. The lockup is 184px and the nav 422px; at a 640px
            viewport only 592px is available, so showing both there overflows
            by 14px and wraps the nav to two lines. At 768px there is 98px of
            slack. Below md the hamburger covers it. Re-measure if either the
            mark or the nav labels grow. */}
        {/* aria-label because THERE ARE TWO <nav>s in this header — this one
            and the one inside the sheet. Unnamed, assistive tech lists them as
            "navigation" and "navigation" and neither can be told from the
            other. The layout classes move to the <ul>; the <nav> keeps only
            the breakpoint switch, or `hidden md:flex` would be fighting a
            child that is now doing the flexing. */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6 md:gap-8">
            {items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} isActive={isItemActive(item)} />
              </li>
            ))}
          </ul>
        </nav>

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
          {/* p-0 because this panel sets its own bands: a header rule, a nav
              block, and a footer pinned to the bottom. The default padding
              would inset those rules off the panel edges. */}
          {/* --surface, not the popover white. Every band on the site is warm
              paper; a pure-white panel sliding over it reads as a different
              product. p-0 because this panel sets its own bands, and the
              default padding would inset their rules off the panel edges. */}
          <SheetContent
            side="right"
            className="w-[19rem] gap-0 bg-surface p-0 sm:w-80"
          >
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
                className="px-4 pb-2 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-muted uppercase"
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
              <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-muted uppercase">
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
      </div>
    </header>
  );
}
