"use client";

/**
 * One navigation tab, rendered in the header bar and in the mobile sheet.
 *
 * ── IN SIMPLE WORDS ──
 * A link in the site's navigation. It looks like a horizontal tab in the bar
 * across the top and like a full-width row in the panel that slides in on a
 * phone, but it is the same component in both places and it navigates the same
 * way in both places.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * ONE component for both renders, because both must navigate identically — and
 * navigation itself is not decided here at all. `SiteLink` owns it: in-page
 * anchors scroll, a link to the route you are already on returns you to the top
 * of it, and modified clicks are left to the browser. This file is appearance
 * and nothing else.
 *
 * THAT IS ALSO WHY THIS IS ITS OWN MODULE. site-header.tsx renders it in the
 * bar and site-header-sheet.tsx renders it in the panel; leaving it in either
 * one would make the other import from its sibling and close a cycle. Split out
 * on review, 2026-08-17.
 *
 * `variant` only changes how it LOOKS. "bar" is the horizontal desktop tab
 * with its hover underline; "sheet" is a full-width row in the mobile panel,
 * where a centred label with an underline reads as a divider rather than as
 * the page you are on (measured from the panel: four centred labels with a
 * full-width rule under the active one).
 *
 * ── DO NOT ──
 * - Do not copy this into either consumer to "simplify" the imports. Both
 *   surfaces must render the same tab, and two copies of it diverge.
 * - Do not swap `SiteLink` back for a plain next/link. That is what made the
 *   "Home" tab dead on the home page — see site-link.tsx for the measurement.
 */
import { SiteLink } from "@/components/common/site-link";
import { type NavItem } from "@/content/site";
import { cn } from "@/lib/utils";

export function NavLink({
  item,
  isActive,
  onNavigate,
  variant = "bar",
  travelling = false,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
  variant?: "bar" | "sheet";
  /**
   * The bar is drawing ONE marker that slides between tabs, so this tab must
   * not also draw its own active underline — see site-header.tsx.
   *
   * It only suppresses the ACTIVE line. The hover line stays, because it
   * answers a different question ("you could go here") and the header showed
   * both at once before this existed: hovering tab B while tab A was current
   * already lit two underlines.
   *
   * False is the honest default and it is what reduced motion and the first
   * frame before measurement both get — a tab that underlines itself, exactly
   * as before.
   */
  travelling?: boolean;
}) {
  const sheet = variant === "sheet";

  return (
    <SiteLink
      href={item.href}
      onNavigate={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        // min-h-11 = the 44px minimum. With py-2 these measured 39px tall, so
        // every item in the primary nav — including the only CTA in the header
        // — was under the touch minimum. inline-flex + items-center keeps the
        // label optically centred while the box grows to meet it.
        // The property list is explicit because this element animates movement
        // as well as colour. It was `transition-colors`, which carries neither
        // — so the pill branch below moved on the first frame of hover while
        // its background eased over 220ms. One control, two speeds, and the
        // untransitioned half is the half the eye notices.
        //
        // `translate` IS LISTED SEPARATELY FROM `transform`, AND IT HAS TO BE.
        // Tailwind v4 compiles `-translate-y-px` to the standalone `translate`
        // property, not to `transform` — so a list naming only `transform`
        // animates nothing and the lift snaps. Measured in the browser: with
        // `transform` alone the computed transitionProperty came back
        // "color, background-color, box-shadow, transform" while the element's
        // `translate` sat outside it. Tailwind's own `transition-transform`
        // shorthand expands to `transform, translate, scale, rotate` for this
        // exact reason; an explicit list has to spell out what it replaces.
        "relative inline-flex min-h-11 min-w-11 items-center transition-[color,background-color,box-shadow,transform,translate] duration-220 ease-out",
        // Brand ring, not the UA default. Nothing here removed the outline, so
        // focus WAS visible — it just did not match the ring every other
        // control on the site uses, which reads as an untouched corner.
        "focus-ring",

        sheet
          ? // A ROW, not a tab: full width, left-aligned, 48px tall. A finger
            // gets the whole width of the panel instead of the width of the
            // word, and the labels share one left edge to read down.
            // 0.9375rem = 15px. No token lands there — the sm step is 14px and
            // the base step is 16px — so the arbitrary value stays.
            //
            // BOTH BRANCHES IN rem, NOT px. They used to be the same size
            // written two ways: this one in rem, the desktop one below in
            // pixels. That looks like untidiness and is not. A pixel font-size
            // ignores the reader's browser font-size setting; a rem one scales
            // with it. So anyone who had raised their default text size got it
            // honoured in the mobile panel and silently overridden in the
            // header nav.
            //
            // Do not write the pixel form in a comment here to illustrate the
            // point. Tailwind v4 scans comments as source, so naming a utility
            // in prose EMITS it — the first draft of this note put the dead
            // class back into the stylesheet.
            "min-h-12 w-full justify-start rounded-xl px-4 text-[0.9375rem]"
          : "justify-center text-[0.9375rem]",

        item.highlight
          ? cn(
              "bg-brand font-medium text-on-brand",
              sheet
                ? // Squarer and shadowed, so the one action in the panel sits
                  // forward of the flat rows above it rather than reading as
                  // a green-filled fifth row.
                  "min-h-12 justify-center rounded-xl shadow-[0_8px_20px_rgb(var(--shadow-tint)/0.18)] hover:bg-brand-deep"
                : // A LIFT, NOT A SCALE. This is the only conversion control
                  // in the header and it was the one primary action on the
                  // site with its own hover language: ui/button.tsx's `brand`
                  // and `outline` variants and the service cards all raise a
                  // pixel, grow the shadow, and drop back to 0 on press. Four
                  // controls saying the same thing and a fifth saying
                  // something else reads as an oversight, because it was one.
                  //
                  // The scale was also 5% on a box containing text, which
                  // resamples the label for the length of the transition —
                  // "Let’s talk" went soft every time a pointer crossed it.
                  //
                  // active:duration-75 matches service-card.tsx: a press is
                  // acknowledged fast and released on the site's own curve.
                  "rounded-lg px-4 hover:-translate-y-px hover:bg-brand-deep hover:shadow-[0_12px_32px_rgb(var(--shadow-tint)/0.12)] active:translate-y-0 active:duration-75",
            )
          : "text-ink-soft hover:text-ink",

        // The hover underline is a desktop-tab affordance. In the panel the
        // active state is a tinted row with a brand rule down its left edge —
        // the same "this one" language the quote cards use.
        //
        // duration/easing are named rather than left to Tailwind's 150ms and
        // default curve. Every other transition in this file runs 220ms on the
        // site's own ease-out; this one was the exception and nothing said so.
        !item.highlight &&
          !sheet &&
          "after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-220 after:ease-out hover:after:scale-x-100",
        // The WEIGHT change always applies; only the LINE is conditional. The
        // travelling marker replaces the line and nothing else, so a current
        // tab still sets in medium while the marker is doing the pointing.
        !item.highlight && !sheet && isActive && "font-medium text-ink",
        !item.highlight &&
          !sheet &&
          isActive &&
          !travelling &&
          "after:scale-x-100",

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
    </SiteLink>
  );
}
