"use client";

/**
 * The country flag in the footer's phone field, fetched from flagcdn.com.
 *
 * ── IN SIMPLE WORDS ──
 * The little flag next to the country code comes from a flag service on the
 * internet. This site no longer keeps its own copies. If the service is down,
 * blocked, or has no flag for the country, the field draws the flag as an emoji
 * instead — which is a character, like a letter, so there is nothing to fetch
 * and nothing to break.
 *
 * ── BUSINESS RULES ──
 * Flags come from an API, and this repo keeps no flag files at all — the
 * owner's call, 2026-08-14, reversing the self-hosted approach recorded in
 * DESIGN.md. `public/flags` was deleted in the same pass. The emoji path below
 * is what keeps that deletion from being a regression.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * TWO SELECTABLE COUNTRIES HAVE NO FLAG ON flagcdn. Measured, not guessed: all
 * 265 flags that used to sit in public/flags were requested from flagcdn.com and
 * cross-referenced against the 245 countries `libphonenumber-js` actually offers
 * in the picker. AC (Ascension Island, +247) and TA (Tristan da Cunha, +290)
 * return 404. A bare `flagUrl="https://flagcdn.com/{xx}.svg"` therefore ships a
 * broken image icon for two real, choosable countries — the kind of defect
 * nobody finds, because nobody scrolls to Ascension Island while testing.
 *
 * So this is a `flagComponent`, not a `flagUrl`, and it covers three failure
 * modes with one mechanism: the two known gaps, skipped before the request is
 * made; flagcdn being down, rate-limited, or blocked by a corporate filter; and
 * anything else that makes the <img> fire `error`.
 *
 * THE FALLBACK IS A CHARACTER, NOT A FILE. `flagEmoji` maps the ISO code to the
 * two Unicode regional indicators the OS renders as a flag — 'A' is U+1F1E6, so
 * "PK" is U+1F1F5 U+1F1F0. Verified against `country-flag-icons/unicode` for all
 * 245 countries: identical output, which is why this is five lines here instead
 * of a dependency (that package is only in node_modules transitively, via this
 * very library — importing it directly would be reaching through react-phone-
 * number-input's own dependency tree).
 *
 * KNOW WHAT THE EMOJI DOES ON WINDOWS: it renders the two letters, "AC", not a
 * flag, because Windows ships no glyphs for regional indicator pairs. That is
 * the intended floor, not an oversight — the country code in a bordered box
 * still says which country is selected, next to a "+247" that says it again.
 * A broken-image icon says only that the site is broken.
 *
 * `failed` STORES THE COUNTRY CODE, NOT A BOOLEAN. Comparing it to the current
 * country means switching country automatically retries the CDN, so one failed
 * request does not condemn the rest of the session to emoji. A boolean would
 * need an effect to reset it; this needs none.
 *
 * NO `loading="lazy"`, and this is the counter-intuitive one. The form is in the
 * footer of every page, always below the fold, so deferring one ~400B SVG looks
 * free — it was written that way first. Measured on the production build,
 * scrolled to the centre of the viewport, sampled to six seconds: the flag NEVER
 * requested. Not slow, never. `naturalWidth` stayed 0 and
 * `Network.requestWillBeSent` recorded nothing, while a `fetch()` to the same
 * URL from the same page returned fine. Flipping that same element to `eager` at
 * runtime loaded it immediately, and a fresh lazy <img> appended beside it
 * behaved identically — so it is the attribute, not this component.
 *
 * What makes it disqualifying rather than merely disappointing: a request that
 * is never made never fires `error`, so the fallback cannot catch it. The lazy
 * version fails to a permanently blank flag with no console error and no
 * recovery — the worst shape a bug can take.
 *
 * ── DO NOT ──
 * - Do not add `loading="lazy"`. See above; it silently blanks the flag and
 *   disables the fallback in the process.
 * - Do not replace this with `flagUrl` pointing straight at flagcdn. That is the
 *   version with the two broken flags and no fallback at all.
 * - Do not re-add a flags directory to public/ to "fix" AC and TA. Keeping 265
 *   files for two of them is the trade that was explicitly reversed.
 * - Do not drop `alt`. The library wraps this in an `aria-hidden` div today, so
 *   the text goes nowhere — but that is the library's decision to change, not
 *   ours to pre-empt by shipping an image with no accessible name.
 */
import { useState } from "react";

/**
 * flagcdn.com: Cloudflare-served, no key, `access-control-allow-origin: *`,
 * and `cache-control: public, max-age=2678400` (31 days). The SVGs are 3:2
 * (900x600), which is the ratio this library's CSS lays out. Lowercase codes
 * only; uppercase 404s.
 *
 * ── LICENSING, CHECKED RATHER THAN ASSUMED (2026-08-14) ──
 * This comment previously said "no attribution", which was written from habit
 * and was not accurate. The verified position:
 *
 *   - The images are PUBLIC DOMAIN. flagpedia.net/terms: "The flag images
 *     provided on our website are in the public domain and can be used freely
 *     without restriction." They are derived from Wikimedia Commons vectors.
 *   - Attribution is REQUESTED, NOT REQUIRED. flagcdn.com asks only that "we
 *     appreciate backlink to https://flagpedia.net". Nothing conditions use on
 *     it, so nothing here is obliged to carry a credit — but a courtesy link
 *     in the footer would be a reasonable thing to add, and is a content
 *     decision rather than a legal one.
 *
 * This matters because the approach it replaced DID carry an obligation: the
 * self-hosted SVGs came from `country-flag-icons`, which is MIT, and MIT
 * requires the notice to travel with copies — so `public/flags` should have
 * shipped a LICENSE file and never did. Code review caught that. Deleting the
 * directory is what actually resolved it: the obligation attached to the
 * copies, and there are no copies now.
 */
const CDN_URL = "https://flagcdn.com/{xx}.svg";

/** Selectable in the picker, absent from flagcdn. Verified 2026-08-14. */
const CDN_MISSING = new Set(["AC", "TA"]);

/** ISO 3166-1 alpha-2 to its regional-indicator pair. "PK" -> U+1F1F5 U+1F1F0. */
const REGIONAL_INDICATOR_A = 0x1f1e6;
const flagEmoji = (country: string) =>
  String.fromCodePoint(
    ...[...country].map(
      (letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - 65,
    ),
  );

type CountryFlagProps = {
  /** Two-letter ISO 3166-1 alpha-2 code, uppercase, from the library. */
  country: string;
  /** The library's localised country name, passed through as `alt`/`title`. */
  countryName: string;
  /** `PhoneInputCountryIconImg` — the library's own class, and load-bearing:
      it is what sizes the flag to its container. Always forward it. */
  className?: string;
};

export function CountryFlag({
  country,
  countryName,
  className,
}: CountryFlagProps) {
  const [failed, setFailed] = useState<string | null>(null);

  if (failed === country || CDN_MISSING.has(country)) {
    return (
      // data-flag-fallback is read by phone-field.tsx, which drops the
      // library's flag border for this branch. That border is drawn 3:2 around
      // the <img>; around a glyph that renders roughly square it frames empty
      // space either side and reads as a broken image, which is the exact
      // impression this branch exists to avoid.
      <span
        data-flag-fallback
        className={className}
        title={countryName}
        // leading-none, or the line box is taller than the 1em container and
        // the glyph sits low enough to clip against the field's baseline.
        style={{ fontSize: "1em", lineHeight: 1, textAlign: "center" }}
      >
        {flagEmoji(country)}
      </span>
    );
  }

  return (
    // A raw <img>, not next/image. Three reasons, none of them laziness: this
    // component is handed to a third-party library that renders its flag slot
    // itself; the optimizer buys nothing on a ~400B SVG and would need a
    // remotePatterns entry to try; and the `onError` fallback above — the
    // entire reason this component exists — is not something next/image
    // exposes.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={CDN_URL.replace("{xx}", country.toLowerCase())}
      alt={countryName}
      decoding="async"
      onError={() => setFailed(country)}
    />
  );
}
