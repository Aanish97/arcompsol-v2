/**
 * The one way this site scrolls the page itself — to a section, or to the top.
 *
 * ── IN SIMPLE WORDS ──
 * "See what we do", "Let's talk", and the Services tab in the nav all move you
 * down the page to a section; "Home" and the logo move you back to the top when
 * you are already on that page. This is the code that moves you, and it makes
 * sure you actually arrive even when the browser refuses to animate.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * SMOOTH SCROLLING CANNOT BE TRUSTED TO HAPPEN. Measured on Chrome 151 against
 * this page: `scrollTo({behavior:"smooth"})` and `scrollIntoView()` under a
 * `scroll-behavior: smooth` stylesheet both left scrollY at 0 for the full
 * duration — sampled every 120ms for 1.7s, never moved a pixel — while the
 * identical call with `behavior:"instant"` landed exactly on target. The
 * animation was not cancelled part-way; it never started. Every in-page button
 * on the site was dead as a result, and nothing about it looked broken in the
 * markup.
 *
 * So this asks for the animation, then checks whether the browser ACCEPTED it —
 * by watching for a scroll event, not by measuring displacement. Only if
 * nothing at all happens does it jump. The visitor always arrives, and a real
 * glide is never interrupted.
 *
 * Reduced motion is honoured HERE rather than left to CSS, because a hard-coded
 * `behavior:"smooth"` in JavaScript overrides the stylesheet and is gated by no
 * media query. Asking matchMedia directly is the only way the preference
 * survives.
 *
 * ── DO NOT ──
 * - Do not call `scrollIntoView()` directly from a component. It is exactly the
 *   call that silently does nothing; every caller must come through here.
 * - Do not drop the verification timer because "smooth works in my browser".
 *   It did not work in the one this was written against.
 * - Do not go back to testing DISPLACEMENT instead of a scroll event. Smooth
 *   scrolling eases in; over a short distance it moves less than 2px in the
 *   first 120ms, and a displacement test therefore kills the very animation it
 *   is supposed to be protecting.
 * - Do not point a caller at an id inside an `overflow-hidden` box. scrollIntoView
 *   walks up scrolling each ancestor scrollport, and inside a clipped box the
 *   target already counts as visible, so the document never moves. Anchors
 *   belong on the outer <Section>.
 */

/** How long to wait before deciding the animation is not going to happen. */
const SMOOTH_GRACE_MS = 120;

/**
 * Ask for the smooth version, check the browser ACCEPTED it, and fall back to
 * the instant one only if it did not. The reasoning is the file header above;
 * this is where it is actually implemented.
 *
 * ONE COPY, TWO CALLERS. `scrollToId` and `scrollToTop` differ only in the two
 * calls they pass in — the grace window, the scroll-event probe and the
 * reduced-motion branch are identical in both, and written out twice they are
 * exactly the kind of pair that gets fixed in one place and left rotting in the
 * other. Add a third way to scroll by calling this, not by copying it.
 */
function scrollVerified(smooth: () => void, instant: () => void) {
  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    instant();
    return;
  }

  const before = window.scrollY;
  let started = false;
  const onScroll = () => {
    started = true;
  };
  window.addEventListener("scroll", onScroll, { once: true, passive: true });

  smooth();

  window.setTimeout(() => {
    window.removeEventListener("scroll", onScroll);
    if (!started && window.scrollY === before) instant();
  }, SMOOTH_GRACE_MS);
}

export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  scrollVerified(
    () => target.scrollIntoView({ behavior: "smooth" }),
    () => target.scrollIntoView({ behavior: "instant" as ScrollBehavior }),
  );
}

/**
 * Back to the top of the page.
 *
 * ── IN SIMPLE WORDS ──
 * What clicking "Home", or the logo, does when you are ALREADY on the home page
 * and 4,000px down it.
 *
 * ── WHY IT EXISTS (change at your peril) ──
 * NEXT'S <Link> DOES NOTHING WHEN THE DESTINATION IS THE ROUTE YOU ARE ON. The
 * App Router treats it as a no-op: no re-render, no scroll, no error. Measured
 * on 2026-08-17 from scrollY 4647 at the bottom of the home page — the header
 * wordmark, the nav's "Home" tab, the footer's "Home" link and the footer
 * wordmark all left the page exactly where it was. Four dead controls, and the
 * two in the footer sit directly beside the contact form, which is the one
 * place someone is most likely to want the top of the page back.
 *
 * ── DO NOT ──
 * - Do not swap this for `window.scrollTo(0, 0)`. The whole reason this file
 *   exists is that this site's smooth scrolling cannot be assumed to run; a
 *   bare call is the version that silently does nothing.
 */
export function scrollToTop() {
  // Already there. Nothing would animate, so the verification above would
  // always take the fallback branch — harmless, but it reads as a bug to the
  // next person stepping through it.
  if (window.scrollY === 0) return;

  scrollVerified(
    () => window.scrollTo({ top: 0, behavior: "smooth" }),
    () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }),
  );
}
