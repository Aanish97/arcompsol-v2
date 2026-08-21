"use client";

/**
 * Development-only: warns when two neighbouring bands share a ground.
 *
 * ── IN SIMPLE WORDS ──
 * Every page is a stack of full-width bands, and two touching bands in the same
 * colour are not two bands — they are one tall band with a heading stranded in
 * the middle of it. This notices when that happens and says so in the console
 * while you are building. It ships nothing to visitors.
 *
 * ── WHY THIS EXISTS ──
 * THIS HAS DRIFTED THREE TIMES. `/about` ran two `--surface-alt` bands together;
 * `/careers` ran three; and the second one only appeared because a band was
 * moved to navy and then back, weeks apart, by which point nobody was looking at
 * the sequence.
 *
 * It keeps happening for a structural reason, not a careless one: **band order
 * is a property of the PAGE, but the ground is chosen per SECTION** — in six
 * different call sites, two of them (`Milestones`, `Benefits`) shared across
 * pages. Nobody can see the sequence from any one of those files, so nobody can
 * see the collision either. Writing the rule down in DESIGN.md does not fix
 * that; it just moves the burden onto remembering to re-read it.
 *
 * So the rule is checked where it is actually true: against the rendered page,
 * after CSS has resolved. That is the only place the answer exists, because the
 * grounds come from classes, the classes come from props, and two of the
 * sections are shared.
 *
 * ── WHY NOT JUST ALTERNATE AUTOMATICALLY ──
 * Because the real rule is a CONSTRAINT, not a formula. Home runs
 * paper → paper → tint → paper on purpose: the services band is paper *and*
 * carries a tinted panel inside it, which is its own ground. A component that
 * mechanically alternated would be wrong there and would have to be fought.
 * Checking the constraint leaves the design free; computing the value would not.
 *
 * ── ONLY AN OPAQUE PANEL EXEMPTS A BAND — A TEXTURE DOES NOT ──
 * A band is exempt when it carries its own interior SURFACE: an opaque slab
 * across the content column, like the `--secondary` panel behind the service
 * tiles. That is why home's hero and services bands are both paper and still
 * read as two bands.
 *
 * A BACKDROP DOES NOT COUNT, and getting this wrong made the first version of
 * this file useless. It exempted any band containing `.hexfield`, which meant
 * that when the exact `/careers` bug was reproduced to test it — three tinted
 * bands with the honeycomb on the middle one — it stayed silent. The honeycomb
 * is 17% lines masked to 14% through the middle; it is texture, not a ground,
 * and it does not stop two tinted bands reading as one slab.
 *
 * Detected by measurement rather than by a flag, so a new panel is covered
 * without anyone remembering to annotate it.
 *
 * ── DO NOT ──
 * - Do not make this throw, and do not render anything. A visual check that
 *   breaks the page is worse than the thing it is checking for.
 * - Do not move it out of the dev guard. It walks every section and reads
 *   computed styles; that is fine once in development and pointless in
 *   production.
 */
import { useEffect } from "react";

/** How much of a band an inner surface must span to count as its own ground. */
const PANEL_COVERAGE = 0.6;

export function BandOrderCheck() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    // After paint, so the values read are the ones actually on screen.
    const id = window.setTimeout(() => {
      const bands = [
        ...document.querySelectorAll<HTMLElement>("main > section"),
      ];
      if (bands.length < 2) return;

      const label = (el: HTMLElement) =>
        el.querySelector("h1, h2")?.textContent?.trim().slice(0, 40) ??
        "(no heading)";

      /**
       * Does this band carry an interior surface of its own — a panel, or a
       * backdrop? Measured, not declared: any descendant with a different
       * background that covers most of the band's width counts.
       */
      const hasOwnGround = (band: HTMLElement) => {
        const ground = getComputedStyle(band).backgroundColor;

        // MEASURED AGAINST THE CONTENT COLUMN, NOT THE BAND. Bands are
        // full-bleed; panels live inside the max-width column, so the services
        // panel is 1088px inside a 1920px band — 57%, which failed a 60% test
        // and produced a false positive on the home page the first time this
        // ran. The column is what a panel can actually fill.
        const column = band.querySelector<HTMLElement>(":scope > div");
        const reference = (column ?? band).getBoundingClientRect().width || 1;

        return [...band.querySelectorAll<HTMLElement>("div, section")].some(
          (child) => {
            const bg = getComputedStyle(child).backgroundColor;
            if (bg === ground || bg === "rgba(0, 0, 0, 0)") return false;
            return (
              child.getBoundingClientRect().width / reference >= PANEL_COVERAGE
            );
          },
        );
      };

      for (let i = 1; i < bands.length; i++) {
        const above = bands[i - 1];
        const below = bands[i];
        if (
          getComputedStyle(above).backgroundColor !==
          getComputedStyle(below).backgroundColor
        ) {
          continue;
        }
        if (hasOwnGround(above) || hasOwnGround(below)) continue;

        console.warn(
          `[band-order] ${location.pathname}: "${label(above)}" and "${label(
            below,
          )}" share a ground and neither carries a panel or backdrop.\n` +
            `Two touching bands in one colour read as a single band with a ` +
            `heading in the middle. Give one of them a different ground, or a ` +
            `surface of its own. See DESIGN.md → "Tinted bands feather".`,
          { above, below },
        );
      }
    }, 400);

    return () => window.clearTimeout(id);
  }, []);

  return null;
}
