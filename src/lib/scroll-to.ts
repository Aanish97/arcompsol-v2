/**
 * The one way this site scrolls to an in-page target.
 *
 * ── IN SIMPLE WORDS ──
 * "See what we do", "Let's talk", and the Services tab in the nav all move you
 * down the page to a section. This is the code that moves you, and it makes
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

export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    target.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    return;
  }

  // Listen for the browser to START scrolling, rather than measuring how far it
  // got. This distinction is the whole fix: a smooth scroll EASES IN, so over a
  // short distance it can legitimately move under a pixel or two in the grace
  // window. The first version tested displacement and so cut real glides dead
  // partway through, turning every nav click into a hard jump on any browser
  // where smooth scrolling actually works.
  //
  // A scroll event is unambiguous. If one fires, the browser is animating and
  // this must not interfere. If none fires, it refused, and the jump is the
  // only way the visitor arrives at all.
  const before = window.scrollY;
  let started = false;
  const onScroll = () => {
    started = true;
  };
  window.addEventListener("scroll", onScroll, { once: true, passive: true });

  target.scrollIntoView({ behavior: "smooth" });

  window.setTimeout(() => {
    window.removeEventListener("scroll", onScroll);
    if (!started && window.scrollY === before) {
      target.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    }
  }, SMOOTH_GRACE_MS);
}
