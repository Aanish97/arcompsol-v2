"use client";

/**
 * Sticky site header: wordmark, nav tabs, and the mobile sheet's trigger.
 *
 * ── IN SIMPLE WORDS ──
 * The bar across the top. On a phone the links collapse into a panel that
 * slides in from the right. "Let's talk" is the green pill; the other tabs
 * underline when you are on that page.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The nav list is built ONCE here and rendered twice — in the bar below and in
 * the sheet, which receives it as a prop. The original built it inside a
 * `getTabs()` helper that called useRouter() itself and was then invoked twice
 * per render — a rules-of-hooks violation that also shadowed the outer
 * `router`. It happened to work, but any early return added above it would have
 * desynced the hook order and crashed on a route change. Hooks belong in the
 * component body.
 *
 * "Services" points at #services, a section that only exists on the home page,
 * so it is filtered out elsewhere — otherwise the tab is a dead link from
 * /about and /careers.
 *
 * THIS FILE OWNS "WHICH TAB IS CURRENT", and it is the only thing that may.
 * The answer needs the pathname and an IntersectionObserver over the in-page
 * sections, and it has to be identical in the bar and in the panel — so
 * `isItemActive` is computed once and handed down. Do not recompute it in the
 * sheet.
 *
 * IT ALSO OWNS HOW THAT ANSWER IS DRAWN in the bar: one underline that travels
 * between tabs rather than one per tab switching on and off. The observer above
 * updates while you scroll, with no click involved, and a marker that slides is
 * what makes that continuous. See the effect below for the whole rationale and
 * for the fallback that keeps reduced motion on the old behaviour.
 *
 * OPAQUE, with NO backdrop-filter. A backdrop-filter on a STICKY element makes
 * the browser re-sample and blur everything scrolling beneath it on every
 * frame, and the artefact is worst over dark, high-contrast content — the
 * footer visibly flickers while the rest of the page looks fine. A solid bar
 * costs nothing and is visually near-identical.
 *
 * ── WHERE THE REST OF IT LIVES ──
 * Split on review, 2026-08-17, at 460 lines:
 *
 *   nav-link.tsx          one tab, rendered by BOTH surfaces. Its own module
 *                         rather than either consumer's, or the two would
 *                         import from each other and close a cycle.
 *   site-header-sheet.tsx the hamburger and the panel it opens — 159 lines,
 *                         and it owns its own open state, which was declared
 *                         here and read only in there.
 *
 * ── DO NOT ──
 * - Do not reintroduce backdrop-blur here without scrolling over the footer to
 *   check. It is the single most expensive thing this header can do.
 * - Do not make this a server component. It reads the pathname and drives the
 *   section observer; both need the client.
 */
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/common/brand-logo";
import { NavLink } from "@/components/layout/nav-link";
import { SiteHeaderSheet } from "@/components/layout/site-header-sheet";
import { NAV_ITEMS, type NavItem } from "@/content/site";

export function SiteHeader() {
  const pathname = usePathname();
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

  /**
   * The href of the tab that is current right now, or "" when none is. Exactly
   * one non-highlight tab is always current — a hash tab wins over the path tab
   * above, and "Let's talk" is filtered out of `hashKey` so it is never
   * observed — so this is the marker's single input.
   */
  const activeKey = items.find((item) => isItemActive(item))?.href ?? "";

  const navRef = useRef<HTMLElement>(null);
  const [marker, setMarker] = useState<{
    x: number;
    y: number;
    w: number;
  } | null>(null);

  /**
   * ── The travelling underline ─────────────────────────────────────────────
   *
   * ── IN SIMPLE WORDS ──
   * One line under the nav that slides across to whichever tab you are on,
   * instead of one line per tab blinking off and another blinking on.
   *
   * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
   * THE OBSERVER ABOVE ALREADY KNOWS THE ANSWER CONTINUOUSLY. Scrolling the
   * home page moves the current tab from Home to Services and back with no
   * click involved, which is unusual — most navs only change on navigation.
   * Two independent `scale-x` underlines at opposite ends of a 422px bar do not
   * read as one thing moving, so that continuous knowledge was being spent on a
   * blink. This is the same state, drawn as one object.
   *
   * TRANSFORM ONLY, SCALED BY WIDTH. The marker is a 1px-wide box that is
   * translated into place and stretched with `scaleX`, so a tab change animates
   * on the compositor and never touches layout — the same technique
   * services-grid.tsx uses to fly the typed word into the heading. Animating
   * `left`/`width` would re-run layout on every frame of a slide that happens
   * while the page is already scrolling.
   *
   * MEASURED FROM THE <a>, NOT THE <li>. The `<a>` is what carries the tab's
   * padding and what the old `::after` was positioned against, so measuring it
   * puts the marker on the pixel the underline used to occupy. `aria-current`
   * is the selector because NavLink already sets it — a second attribute for
   * the same fact is a second thing to keep in sync.
   *
   * THE RESIZE OBSERVER IS NOT OPTIONAL. Tab widths move when the viewport
   * changes AND when Poppins/Open Sans swap in on a cold load, and both change
   * the <nav>'s own width, so watching this one element catches both.
   *
   * ── DO NOT ──
   * - Do not remove the fallback. Until this effect has measured, and forever
   *   under reduced motion, NavLink draws its own underline (`travelling` is
   *   false). A marker that teleports between tabs is not a quieter version of
   *   this effect, it is a worse version of the thing it replaced.
   * - Do not move the marker inside the <ul>. A <ul> may only contain <li>, so
   *   it is a sibling and the <nav> is the positioned ancestor both it and
   *   `offsetLeft` resolve against.
   */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const measure = () => {
      const tab = nav.querySelector<HTMLElement>('[aria-current="page"]');
      // RECTS, NOT offsetLeft/offsetWidth. The offset properties are rounded to
      // whole pixels: "Services" is 56.83px wide and reports 57, so the marker
      // was drawn a pixel wider than the tab it was under and the overhang
      // changed with the scroll position. The `::after` it replaced was
      // `inset-x-0` — the border box exactly — and a rect is the only way to
      // say that.
      const box = tab?.getBoundingClientRect();
      const origin = nav.getBoundingClientRect();
      // A ZERO WIDTH IS "NOT MEASURABLE", NOT "ZERO WIDE". This <nav> is
      // `hidden md:block`, so below md every tab measures 0x0 — mounting the
      // marker on that would suppress NavLink's own underline (`travelling`
      // reads `marker !== null`) with a scaleX(0) box in its place, and then
      // slide it in from the left edge the moment a resize crossed 768px.
      // Staying null keeps the phone on the fallback and makes the first
      // desktop frame a placement rather than a slide.
      setMarker(
        box && box.width
          ? {
              x: box.left - origin.left,
              // The old `::after` sat at `-bottom-px`: a 1px box whose bottom
              // edge is 1px below the link, so its top edge is exactly the
              // link's bottom edge. This lands on the same row.
              y: box.bottom - origin.top,
              w: box.width,
            }
          : null,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeKey]);

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
        {/* relative: the positioned ancestor the marker below is placed
            against, and the box `offsetLeft`/`offsetTop` are measured from. */}
        <nav
          ref={navRef}
          aria-label="Primary"
          className="relative hidden md:block"
        >
          <ul className="flex items-center gap-6 md:gap-8">
            {items.map((item) => (
              <li key={item.href}>
                <NavLink
                  item={item}
                  isActive={isItemActive(item)}
                  travelling={marker !== null}
                />
              </li>
            ))}
          </ul>

          {/* Rendered only once measured, and already in position on its first
              frame — mounting is not the animation, moving between tabs is.

              420ms on the site's curve: the marker crosses up to ~340px of bar,
              which is a spatial move rather than a state change, so it is timed
              like one. The transition is inline because the values it animates
              are inline; splitting them puts half the behaviour in a stylesheet
              that cannot see the other half. */}
          {marker && (
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 h-px w-px origin-left bg-ink"
              style={{
                transform: `translate3d(${marker.x}px, ${marker.y}px, 0) scaleX(${marker.w})`,
                transition: "transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          )}
        </nav>

        <SiteHeaderSheet items={items} isItemActive={isItemActive} />
      </div>
    </header>
  );
}
