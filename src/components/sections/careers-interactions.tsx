"use client";

/**
 * The two interactive bits of the careers page, isolated so the page itself
 * stays a server component.
 *
 * ── IN SIMPLE WORDS ──
 * A button that scrolls down to the job list, and a small piece of behaviour
 * that jumps you to the "work with us" section when you arrive with ?vision in
 * the URL — then tidies the URL afterwards.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * `hasVision` is passed in as a plain boolean from the server rather than read
 * with useSearchParams. useSearchParams opts the whole route out of static
 * rendering and has to sit inside a Suspense boundary; reading searchParams on
 * the server keeps the page static and needs neither.
 *
 * The scroll runs inside requestAnimationFrame. On a fresh load the effect
 * fires before layout has settled, and scrollIntoView then measures an element
 * whose final position it does not yet know — landing a few hundred pixels off.
 *
 * The timeout is cleaned up on unmount. The original left a bare setTimeout
 * that called router.replace 5s later; navigate away inside those 5 seconds and
 * it rewrote the URL of whatever page you were now on.
 *
 * ── DO NOT ──
 * - Do not swap router.replace for router.push. push adds a history entry, so
 *   Back would return the user to the ?vision URL and re-trigger the jump.
 */
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { scrollToId } from "@/lib/scroll-to";

// ScrollToButton lives in common/scroll-to-button.tsx. The home hero needs one
// too, and importing a component from a file called "careers-interactions"
// would misstate where it belongs.

export function VisionScroll({ hasVision }: { hasVision: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasVision) return;

    const frame = requestAnimationFrame(() => scrollToId("work-with-us"));
    const timer = setTimeout(() => router.replace("/careers"), 5000);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [hasVision, router]);

  return null;
}
