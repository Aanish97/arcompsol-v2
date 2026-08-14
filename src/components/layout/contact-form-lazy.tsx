"use client";

/**
 * Defers the contact form's JavaScript out of the initial page load.
 *
 * ── IN SIMPLE WORDS ──
 * The form sits at the very bottom of every page. Its code is downloaded once
 * the page is otherwise ready, instead of holding up the part you can see.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The form pulls in zod, react-hook-form and react-phone-number-input — and
 * that last one carries ~82 kB of libphonenumber country metadata on its own.
 * Because the footer lives in the root layout, all of it was landing in the
 * first load of every route. Measured on /about, which has no form interaction
 * above the fold at all: 335 kB gzipped with it eager, 241 kB deferred.
 *
 * ssr: false is deliberate. The form has no content worth indexing and no
 * meaning without JavaScript — it is a control, not copy — so rendering it on
 * the server buys nothing while still shipping the hydration bundle.
 *
 * The placeholder mirrors the real form's structure — two grouped sections, a
 * paired first row, a taller message field. It is not decoration: if its height
 * does not match, the footer grows when the chunk lands and shoves the page
 * down under whoever is reading it.
 *
 * ── DO NOT ──
 * - Do not lazy-load anything above the fold this way. Deferred content that is
 *   immediately visible flashes empty first, which is worse than being slower.
 */
import dynamic from "next/dynamic";

const ContactForm = dynamic(
  () => import("./contact-form").then((m) => m.ContactForm),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="w-full max-w-xl rounded-2xl border border-night-line bg-night-alt p-6 md:p-8"
      >
        <div className="h-3 w-24 animate-pulse rounded bg-night-line/60" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="h-16 animate-pulse rounded-xl bg-night-field" />
          <div className="h-16 animate-pulse rounded-xl bg-night-field" />
        </div>
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-night-field" />
        <div className="mt-8 h-3 w-24 animate-pulse rounded bg-night-line/60" />
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-night-field" />
        <div className="mt-4 h-28 animate-pulse rounded-xl bg-night-field" />
        <div className="mt-8 h-11 w-44 animate-pulse rounded-lg bg-night-line/60" />
      </div>
    ),
  },
);

export function ContactFormLazy() {
  return <ContactForm />;
}
