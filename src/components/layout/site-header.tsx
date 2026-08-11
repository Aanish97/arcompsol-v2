"use client";

/**
 * Sticky site header: wordmark, nav tabs, and the mobile sheet.
 *
 * ── IN SIMPLE WORDS ──
 * The bar across the top. On a phone the links collapse into a panel that
 * slides in from the right. "Let's Talk" is the green pill; the other tabs
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
 * jumps to the wrong offset. scrollIntoView after a guard on the element does
 * the smooth scroll and no-ops safely when the id is absent.
 *
 * ── DO NOT ──
 * - Do not make this a server component. It reads the pathname and holds the
 *   sheet's open state; both need the client.
 * - Do not drop the sheet's onClick close handler. Navigating with the panel
 *   still open leaves it covering the page you just moved to.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

import { BrandLogo } from "@/components/common/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_ITEMS, type NavItem } from "@/content/site";
import { cn } from "@/lib/utils";

function scrollToAnchor(href: string) {
  const target = document.getElementById(href.slice(1));
  target?.scrollIntoView({ behavior: "smooth" });
}

function NavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const isAnchor = item.href.startsWith("#");

  return (
    <Link
      href={item.href}
      onClick={(event) => {
        if (isAnchor) {
          event.preventDefault();
          scrollToAnchor(item.href);
        }
        onNavigate?.();
      }}
      className={cn(
        "relative text-[15px] transition-all duration-300",
        item.highlight
          ? "rounded-lg bg-brand px-4 py-2 font-medium text-white hover:scale-105 hover:bg-brand-deep hover:shadow-[0_4px_12px_rgb(var(--shadow-brand)/0.35)]"
          : "py-2 text-ink-soft hover:text-ink",
        !item.highlight &&
          "after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform hover:after:scale-x-100",
        !item.highlight && isActive && "font-medium text-ink after:scale-x-100",
      )}
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => !item.homeOnly || pathname === "/");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/6 bg-white/95 backdrop-blur-md">
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
        <nav className="hidden items-center gap-6 md:flex md:gap-8">
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-70">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <nav className="flex flex-col gap-6 p-8">
              {items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  onNavigate={() => setIsOpen(false)}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
