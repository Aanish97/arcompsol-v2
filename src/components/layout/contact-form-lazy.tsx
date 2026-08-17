"use client";

/**
 * Keeps the contact form's JavaScript out of the page until someone needs it.
 *
 * ── IN SIMPLE WORDS ──
 * The form sits at the very bottom of every page. Its code is not downloaded
 * when the page loads — it is fetched when you scroll near the footer, or the
 * moment you click anything that takes you there.
 *
 * ── BUSINESS RULES ──
 * - The form must be ready by the time a visitor reaches it. It is the only way
 *   to contact the company from the site, so a skeleton where the form should be
 *   is a lost enquiry.
 * - "Let's talk" is the one conversion CTA, in the header on every route and in
 *   the hero. Clicking it must start the download in the same tick it starts
 *   the scroll.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The form pulls in zod, react-hook-form and react-phone-number-input — and
 * that last one carries ~82 kB of libphonenumber country metadata on its own.
 * Because the footer lives in the root layout, all of it was landing in the
 * first load of every route. Measured on /about, which has no form interaction
 * above the fold at all: 335 kB gzipped with it eager, 241 kB deferred.
 *
 * DEFERRING WAS NOT ENOUGH. next/dynamic only moves the chunk off the critical
 * path; it still fetched on every single page view. Measured 2026-08-17: 125 kB
 * arriving at ~1036ms on every route, 24% of a 515 kB cold load, for a form most
 * visitors never scroll to. So the import is now gated on someone actually
 * heading for it.
 *
 * TWO TRIGGERS, AND BOTH ARE LOAD-BEARING. The observer covers ordinary
 * scrolling. The click listener covers the visitor who skips the scroll
 * entirely by pressing "Let's talk" at the top of a 4,650px page — the highest
 * intent visitor on the site, and the one the observer serves worst, because it
 * cannot fire until the footer is already nearly in view.
 *
 * `rootMargin: 1200px` is measured, not guessed: the footer form sits ~4,000px
 * down the home page and the viewport bottom is ~900px at rest, so 1200px is
 * comfortably short of triggering on load and still starts the fetch roughly a
 * screen and a half before the form is read.
 *
 * ssr: false is deliberate. The form has no content worth indexing and no
 * meaning without JavaScript — it is a control, not copy — so rendering it on
 * the server buys nothing while still shipping the hydration bundle.
 *
 * THE PLACEHOLDER'S HEIGHT IS A CORRECTNESS REQUIREMENT, NOT A DETAIL. If it
 * does not match the real form, the footer grows when the chunk lands and
 * shoves the page down under whoever is reading it.
 *
 * That used to be nearly invisible: the swap happened at ~1036ms, long before
 * anyone had scrolled 4,000px to look at it. Gating the import moved the swap
 * to the moment the reader arrives, so a mismatch that used to be theoretical
 * now happens directly under their eyes — the gate made an existing 45px error
 * matter, and this is where it was paid for.
 *
 * Measured against the mounted form in a production build on 2026-08-17:
 * placeholder 566px, form 611px. The gap was three wrong assumptions — a group
 * label is 20px not 12, a field is 68px not 64 (20px caption + 8px gap + 40px
 * control), and the message block is 130px not 112. Corrected to 610px against
 * a 611px form. To re-measure, mount the form and compare the two boxes; do not
 * eyeball it.
 *
 * Do not name a utility class in these comments. Tailwind v4 scans comments as
 * source, so writing one in prose emits dead CSS — pixels only, as above.
 *
 * ── DO NOT ──
 * - Do not put the #contact-form id back inside the form. It lives on the
 *   wrapper in site-footer.tsx precisely because the form is usually not
 *   mounted; an anchor inside this chunk is an anchor that does not exist.
 * - Do not lazy-load anything above the fold this way. Deferred content that is
 *   immediately visible flashes empty first, which is worse than being slower.
 * - Do not drop the click listener as "belt and braces". Without it, pressing
 *   "Let's talk" starts a ~4,000px glide and only asks for the chunk once the
 *   glide is nearly over.
 */
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

/**
 * Shared by BOTH waiting states — before the chunk is asked for, and while it
 * is in flight. One definition, or the footer changes height at the handover
 * between them, which is the exact shift the placeholder exists to prevent.
 */
function FormPlaceholder() {
  return (
    // EVERY HEIGHT HERE IS MEASURED OFF THE REAL FORM, NOT ESTIMATED. Read the
    // block above this component before changing any of them.
    //
    // The outer padding, border, radius and ground are copied from the form's
    // own root so the two are the same box.
    <div
      aria-hidden
      className="w-full max-w-xl rounded-2xl border border-night-line bg-night-alt p-6 md:p-8"
    >
      {/* Group label — 20px. */}
      <div className="h-5 w-24 animate-pulse rounded bg-night-line/60" />
      {/* Name + Email. 68px is a field: 20px caption, 8px gap, 40px control. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="h-17 animate-pulse rounded-xl bg-night-field" />
        <div className="h-17 animate-pulse rounded-xl bg-night-field" />
      </div>
      {/* Mobile. */}
      <div className="mt-4 h-17 animate-pulse rounded-xl bg-night-field" />
      {/* Group label. */}
      <div className="mt-8 h-5 w-24 animate-pulse rounded bg-night-line/60" />
      {/* Subject. */}
      <div className="mt-4 h-17 animate-pulse rounded-xl bg-night-field" />
      {/* Message — 130px, the one block that is not a plain field: its control
          is a textarea of several rows rather than a single line. */}
      <div className="mt-4 h-[130px] animate-pulse rounded-xl bg-night-field" />
      {/* Submit — 44px, the touch minimum this project holds every target to. */}
      <div className="mt-8 h-11 w-44 animate-pulse rounded-lg bg-night-line/60" />
    </div>
  );
}

const ContactForm = dynamic(
  () => import("./contact-form").then((m) => m.ContactForm),
  { ssr: false, loading: () => <FormPlaceholder /> },
);

export function ContactFormLazy() {
  const ref = useRef<HTMLDivElement>(null);
  const [wanted, setWanted] = useState(false);

  useEffect(() => {
    if (wanted) return;
    const node = ref.current;
    if (!node) return;

    const want = () => setWanted(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) want();
      },
      { rootMargin: "1200px 0px" },
    );
    observer.observe(node);

    // CAPTURE PHASE, so this runs before the link's own handler calls
    // scrollToId — the fetch and the glide start in the same tick instead of
    // the fetch waiting for the glide to finish.
    //
    // Delegated from the document rather than wired into SiteLink or
    // ScrollToButton, because "when does the contact form need to exist" is
    // this component's business and not a navigation concern. A link component
    // that imports the form to warm it has just undone the code splitting.
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      // Both routes to the form: the nav/sheet tabs are real anchors, the two
      // hero CTAs are <button>s with no href (see common/scroll-to-button.tsx).
      if (
        target.closest(
          'a[href="#contact-form"],[data-scroll-target="contact-form"]',
        )
      )
        want();
    };
    document.addEventListener("click", onClick, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick, true);
    };
  }, [wanted]);

  // w-full max-w-xl so the wrapper is the form's own box: the observer needs
  // something with real height to watch, and the footer's grid cell needs the
  // same width whichever child is in it.
  return (
    <div ref={ref} className="w-full max-w-xl">
      {wanted ? <ContactForm /> : <FormPlaceholder />}
    </div>
  );
}
