/**
 * The Arcompsol lockup — mark plus wordmark — linking home.
 *
 * ── IN SIMPLE WORDS ──
 * The logo in the top-left, now with the company name beside it.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The logo files are a MARK, not a wordmark: both are portrait (112×124 and
 * 126×138), so they carry a symbol and no letterforms. On its own it left the
 * company name nowhere on screen except the browser tab, which is a real gap on
 * a site whose job is to be remembered by name. The text is set here rather
 * than baked into a new image so it stays selectable, searchable and crisp at
 * any zoom.
 *
 * `alt=""` on the image, with the name in adjacent text. The mark and the word
 * say the same thing, so alt text would make a screen reader announce
 * "Arcompsol Arcompsol". The link's own aria-label names the destination.
 *
 * The wordmark survives at every width — it is nine characters, and hiding the
 * company name on phones to save 80px is the wrong trade on a marketing site.
 *
 * No `sizes` prop. With intrinsic dimensions present, Next switches to density
 * descriptors (1x/2x) instead of enumerating every configured device width —
 * the width-based srcset was ~1.5 kB of markup per lockup, twice per page, to
 * offer a 3840px variant of a 40px logo.
 *
 * `priority` is set because this sits in the header and is therefore in the
 * first viewport on every route; without it Next lazy-loads the image and the
 * header visibly pops in after hydration.
 *
 * ── DO NOT ──
 * - Do not give the <Image> width/height props. A static import already carries
 *   the file's real dimensions, and passing only `height` made Next derive a
 *   width it then rounded — so the ratio it emitted stopped matching the one
 *   the browser computed, which is what triggered Next's aspect-ratio warning.
 */
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import logoGreen from "../../../public/images/logo.png";
import logoWhite from "../../../public/images/logo-white.png";

export function BrandLogo({
  variant = "green",
  className,
}: {
  variant?: "green" | "white";
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Arcompsol home"
      className={cn(
        "group flex items-center gap-3 rounded-md",
        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <Image
        src={variant === "green" ? logoGreen : logoWhite}
        alt=""
        priority
        className="h-11 w-auto md:h-12"
      />
      <span
        className={cn(
          // font-heading: the wordmark is brand, not body copy, so it stays on
          // Poppins now that Open Sans owns running text. A logotype that
          // switches typeface is a logotype that stops being one.
          "font-heading text-xl font-semibold tracking-tight transition-colors md:text-2xl",
          variant === "green"
            ? "text-brand-dark group-hover:text-brand-deep"
            : "text-white",
        )}
      >
        Arcompsol
      </span>
    </Link>
  );
}
