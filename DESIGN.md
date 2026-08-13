# Arcompsol — committed visual world

The authority for design decisions on this project. Where this file and a
skill's default guidance disagree, **this file wins** — that is what it is for.

Written 2026-08-12. Every number below was measured against the built site, not
estimated; `src/app/globals.css` carries the same values with their working.

---

## Committed decisions

### The minimal pass was REVERTED — 2026-08-12

A minimal revamp was applied and then reverted the same day, at the owner's
request, because the site felt slower afterwards. The visual world is back to
what it was: `--radius` 0.75rem, the original ten shadow values, thirteen
decorative gradients, 56/72/80 section rhythm, the 16px/700ms scroll reveal,
the hero 3D tilt, the hero click ripple, carousel autoplay with its pause
control, and click-to-flip service cards.

**Before attempting a minimal pass again, read this.** Two things went wrong,
and only one of them was about taste:

1. **Removing the hero 3D tilt broke blend isolation.** The hero image uses
   `mix-blend-multiply`. `.tilt3d-stage` created a stacking context implicitly
   (`transform-style: preserve-3d` plus a transform), which confined the blend
   to a small box. Replacing it with a plain `position: relative` div gave the
   blend the whole `.hero-light` band — both large gradient wash layers — to
   re-composite every scroll frame, and sections visibly flickered. If that
   wrapper is ever removed again, the replacement MUST carry
   `isolation: isolate`.
2. **A word-level stagger on headings was added, including the hero.** The hero
   one made the headline start invisible for 630ms, which reads as a page that
   has not loaded. `page.tsx` already warned that above-the-fold content which
   fades in reads as a slow page; that warning was correct.

Some things from the pass were kept because they were separately requested and
are unrelated to the revert: the full testimonial quotes, and today's
accessibility and copy fixes.

### Eyebrows are IN USE — deliberate override

Small uppercase wide-tracked labels above a heading are used on this site, by
the owner's explicit direction (2026-08-12). Two are live:

| Location | Label |
|---|---|
| Home hero | `SOFTWARE STUDIO` |
| Testimonials band | `TESTIMONIALS` |

Impeccable's craft floor bans eyebrows outright ("this one is a ban, not a
default: no brief earns it back"). **This project overrides that.** The owner
asked for the testimonials eyebrow specifically, having been shown the
alternative.

**Do not remove either in a polish, distill, or audit pass.** Do not raise it as
a finding again; it is settled, not outstanding.

Two further uppercase labels exist and are *not* eyebrows: `YOUR DETAILS` and
`YOUR PROJECT` are fieldset group labels in the contact form and do real
grouping work.

### Dark mode is deliberately absent

The `.dark {}` block was removed. `@custom-variant dark` is kept in
`globals.css` because shadcn primitives reference it, but no dark palette
exists and the page is light-locked. Not an oversight; do not "restore" it.

### Testimonials show the FULL quote

The owner asked for complete quotes (2026-08-12) after a pass that displayed
~20-word verbatim excerpts; the `excerpt` field was removed rather than left in
the file unused. If shortening ever returns, excerpt by taking a contiguous
verbatim run of `text` — never a paraphrase, never spliced fragments. These are
attributed statements by named people at real companies.

The cost is real and is not a content problem: the quotes run 61-80 words,
roughly 20 seconds of reading. That is survivable now only because autoplay is
gone; do not reintroduce a timer without shortening the quotes first.

---

## Palette — ink and paper, deep forest

Warm throughout. The previous scheme mixed a cool cyan and a prussian-blue
footer over neutral greys; warm paper under cool accents is what made the page
read as assembled rather than designed.

| Token | Value | Notes |
|---|---|---|
| `--brand` | `#1F5F4B` | deep forest. UI green on light. **7.19:1** on surface |
| `--brand-on-dark` | `#38B089` | the LOGO green. **6.10:1** on navy, **2.59:1** on paper |
| `--brand-deep` | `#123A2E` | gradient end, pill hover |
| `--brand-navy` | `#16211C` | footer and dark bands |
| `--surface` | `#FBFAF7` | L\* 98.3, warm paper, not pure white |
| `--surface-alt` | `#F3F0EA` | L\* 94.9 |
| `--ink` | `#15171B` | **17.19:1** on surface |
| `--ink-soft` | `#3C4149` | **9.84:1** |
| `--ink-muted` | `#5A5751` | 6.90:1 on surface, 5.63:1 on secondary |

**The logo green is not a UI colour.** At 12px on paper it measures 2.59:1 and
fails AA. It appears in the interface only on dark grounds, where it is the one
place it works. Every eyebrow used to use it and every eyebrow used to fail.

No hex literals in components. The single exception is
`src/app/opengraph-image.tsx`, because Satori resolves no CSS custom properties;
each literal there names the token it mirrors.

## Type

Poppins for headings (`--font-heading`, weights 500/600), Open Sans for body
(400/500/600, one variable file). Both through `next/font/google`, which
self-hosts — `public/fonts` was deleted. One static `Poppins-SemiBold.ttf`
survives in `src/assets/fonts` solely for the OG card; do not delete it.

Body copy is capped at 65ch by `.measure`.

## Motion

One idea: content arrives as you scroll to it, and nothing loops. Plus the
pointer-tracked hero wash (`hero-gradient.tsx`), the pointer tilt on the hero
art (`hero-visual.tsx`), and the click-to-flip service cards.

Transform and opacity only — `transition-all` appears nowhere, and no rule
animates a layout property. `prefers-reduced-motion` is honoured in CSS and in
every motion component, and smooth scrolling is gated on it too.

**Staggered heading reveal.** Words arrive left to right, 8px apart, matching
the block reveal's distance and easing so the two read as one idea. Two
variants, and the difference is load-bearing:

- **Section headings** stagger on SCROLL, keyed off the `[data-reveal]` flag
  `<Reveal>` already sets. Fade plus rise, 45ms a word. No second observer.
- **The hero** staggers on LOAD via `data-stagger="load"`, and it RISES WITHOUT
  FADING — opacity stays 1 throughout. It is above the fold, so it must never be
  invisible: an earlier fading version left the headline blank for 630ms and
  read as a page that had not loaded. 20ms a word, last word at 340ms.

Both rule sets live inside `@media (prefers-reduced-motion: no-preference)`. The
split happens at render, so the full sentence is in the server HTML for
crawlers, reader mode, and a blocked bundle.

**Luminous effects do not work on this site.** `--surface` is L\* 98.3, so
additive blending has no headroom: anything added to white is white. Three
WebGL attempts were reverted for this. Effects here must subtract light.

## Constraints that keep being rediscovered

- **Every interactive target is 44×44.** Verified at 390px, 768px and 1920px.
  The exception is the `tel` input, which is 24px tall inside a 438×68 `<label>`.
- **`resize_window` does not work in this environment.** Test responsive layout
  by loading the site in a **390px-wide iframe** — media queries respond to the
  frame's width. This found two bugs that desktop testing could not.
- **React Three Fiber does not run in this project.** Measured: `renderCalls 0`,
  `programsCompiled 0`, `useFrame` never ticks. Raw three.js with an owned rAF
  works. The leading untested hypothesis is a duplicate `three` via `stats-gl`.
- **Carousel autoplay is 6s with a WCAG 2.2.2 pause control.** The control is a
  conformance requirement, not a nicety; pause-on-hover does not satisfy it —
  it cannot be reached from a keyboard or announced to a screen reader.
- **Programmatic smooth scrolling cannot be trusted.** Measured on Chrome 151:
  `behavior:"smooth"` never started, while `"instant"` landed exactly. All
  in-page navigation goes through `lib/scroll-to.ts`, which asks for the
  animation and jumps if it does not begin. Never call `scrollIntoView()`
  directly from a component.

## Known open

- **The contact form cannot send.** No `.env`; `POST /api/email` returns 500
  `{"message":"Email is not configured"}`. Every "Let's talk" on the site leads
  to it. This is the largest outstanding problem and it is not a design issue.
- `Ownership` and `Commitment` in `content/about.ts` carry drafted copy pending
  the owner's own wording; both are marked `DRAFT` inline.
