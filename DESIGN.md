# Arcompsol — committed visual world

The authority for design decisions on this project. Where this file and a
skill's default guidance disagree, **this file wins** — that is what it is for.

Written 2026-08-12, palette re-derived from the logo 2026-08-13. Every number
below was measured against the built site, not estimated; `src/app/globals.css`
carries the same values with their working.

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
   blend the whole hero band — both large gradient wash layers — to
   re-composite every scroll frame, and sections visibly flickered. If that
   wrapper is ever removed again, the replacement MUST carry
   `isolation: isolate`. (The band was `.hero-light` then and is `.hero-band`
   now; the hazard is the same and `.hero-band` carries the isolation.)
2. **A word-level stagger on headings was added, including the hero.** The hero
   one made the headline start invisible for 630ms, which reads as a page that
   has not loaded. `page.tsx` already warned that above-the-fold content which
   fades in reads as a slow page; that warning was correct.

Some things from the pass were kept because they were separately requested and
are unrelated to the revert: the full testimonial quotes, and today's
accessibility and copy fixes.

### The "How We Work" honeycomb — deliberate override, 2026-08-13

A hexagonal field drifts slowly behind the milestones band on both pages, with
scattered cells fading up and down. Owner-requested. It overrides two rules this
file and `globals.css` had previously settled, and both overrides are scoped to
this one band:

1. **"Nothing loops."** The Motion section below says the site's single idea is
   that content arrives as you scroll to it. This loops — 30s of drift, 9s of
   pulse, forever. It is the only looping animation on the site.
2. **"No tiled lattice."** `globals.css` bans a tiled hairline lattice outright
   as a generated-UI signature. This is one. The ban still stands everywhere
   else, and the field is deliberately NOT a reusable utility — it is one
   component (`common/hex-field.tsx`) that only `sections/milestones.tsx`
   renders.

**The field runs UNDER the copy, and the mask is what makes that safe.** It
covers the whole band, dimmed to 14% through a column 480px either side of
centre — where all the text is — and at full strength out in the margins. The
column is measured in PIXELS from the centre because the copy it covers is a
fixed 896px `max-w-4xl` list; a percentage mask is right at one viewport width
and wrong at every other, and an early attempt proved it by dimming everything
except the four corners at 1920.

The dim went 28 → 20 → 14 over three passes, each time because copy sitting on
a pattern reads as part of the pattern long before it fails a contrast check.
**Numbers passing AA is the floor here, not the goal.**

Tints are contrast-budgeted, not chosen by eye: `--brand` at 17% on the paper
band (it must SUBTRACT light on an L\* 95.7 surface) and `--brand-on-dark` at
20% on navy. At full strength a line mixes to `#CFD7CF` on paper (`--ink-muted`
4.90:1) and `#1D3E32` on navy (white 11.8:1). Raise either and re-measure both.
Under `prefers-reduced-motion` the lattice stays and nothing moves.

A travelling-wave version was built and dropped the same day. One thing from it
is worth keeping: its wave had to be a CSS mask on a **rendered** element,
because a CSS animation on an element inside SVG `<defs>` never advances in
Chrome — measured, `playState: "running"` with `currentTime` pinned at 0.

### The milestones band was reworked around it — 2026-08-13

Three changes, in the same pass, all because the pattern now runs underneath:

- **Each step is a panel from `md` up** (white/4% on navy, opaque `--surface` on
  paper). Loose text on a lattice competes with it; a surface lifts it off.
  Below `md` there is no panel — one column, no descriptions, so it would be
  furniture around nothing.
- **Position alternates, text alignment does not.** Steps 1/3/5 used to be set
  right-aligned to hug the spine, giving three of six descriptions a ragged left
  edge. `testimonials.tsx` already argues this for centred text; right-aligned
  body copy is the same fault. Do not re-add `md:text-right`.
- **Markers are `size-12`, not `size-14`,** and the section description is
  `white/75` rather than `white/60` (9.74:1) — it is the one line in the band
  with no panel under it.

### The services band is typed into being — 2026-08-13

Owner-requested, and it replaced a box-and-cards version built the same day.
Scroll to the services band and an unlit QWERTY board types **A‑R‑C‑O‑M‑P‑S‑O‑L**
one key at a time; Enter goes down and flies off; the unused keys drop away; the
eight that spell the name let go and the typed word flies up into the heading,
which finishes reading **"Services we provide at Arcompsol"**; the cards arrive
and the emptied board leaves the layout so they rise into its space.
`sections/services-grid.tsx`.

- **The keys are driven by class names, not React state.** Eighteen transitions
  in three seconds through React would re-render six flip-cards eighteen times
  for something that touches only a class. Same discipline as the hero pointer
  effects. React owns one thing: whether the cards have arrived.
- **The heading is ONE SENTENCE in two fields** (`titleLead` + `titleWord` in
  `content/home.ts`) because the second half is delivered by the animation. It
  is complete in the server HTML either way.
- **`.wordmark-word` is a separate class from `.stagger-word`, and that is a
  cascade requirement.** `[data-reveal="shown"] .stagger-word` is declared
  outside any `@layer`, and unlayered styles beat layered ones regardless of
  source order — a rule in `@layer components` holding those words back could
  never win. `StaggerText` takes a `className` prop for exactly this.
- **The word is moved with FLIP, scaled by WIDTH,** onto the *last* word span —
  the slot reads "at Arcompsol" and measuring the whole slot lands the word
  straddling the space. The readout is set in the heading's own face, size, case
  and colour, so the scale resolves to ~1 and the flight is near-pure
  translation.
- **The gap the board leaves is closed with a transform, not an animated
  height.** The grid is translated up by the board's height; on the last frame
  the board leaves the flow and the transform is cancelled in the same task, so
  the two cancel out and nothing jumps. Animating height would re-run layout
  every frame on a panel holding six flip-cards.
- **One curve here is not the site's.** `--kbd-overshoot` is used by the strike,
  restrike and Enter only — a key has to pass its resting height and spring
  back. Everything else runs on `cubic-bezier(.16,1,.3,1)`, and the cards arrive
  on `<Reveal>`'s exact values so they land like every other card grid.
- **The cards are held until Enter, but only for someone watching.** The hold
  spends up to ~2.2s of empty panel to buy the reveal, and that is only worth
  spending on a reader who can see the board. Two checks release it early:
  arriving with the board off screen, and scrolling past it mid-sequence. **Do
  not remove either without looking at the section on a phone first.**
- `.pop-item` and `.wordmark-word` are both in the `<noscript>` block in
  `layout.tsx`. Without it the band is empty AND the heading stops at "Services
  we provide". **Add any future hidden-until-scrolled state to that rule in the
  same change.**

### Service cards are a control only where they flip — 2026-08-13

The root renders a real `<button>` at `lg`, where the flip exists, and a plain
`<div>` below it, where both faces are already in normal flow and there is
nothing to reveal. It used to be a `<button>` at every width, which gave every
phone six tab stops that announced as buttons and did nothing when pressed. An
element type is a promise about behaviour; the card makes it only where it can
keep it.

Hover feedback is **220ms**, not the 500ms it was — a response is judged on how
quickly it acknowledges you, not on how smoothly it finishes. There is a real
`:active` press state, which below `lg` is the only feedback a tap gets at all.

### /about and /careers, brought onto the theme — 2026-08-13

**The about hero was still painted in the PREVIOUS brand.** Its band was three
colour literals inline — `rgba(31,95,75,0.16)`, the old `#1F5F4B`, over two
`rgba(255,255,255,…)` washes — inside an arbitrary-value bracket, which is why
the palette sweep never reached it: it is not a colour utility, it is a string.
It is now `.about-hero` in `globals.css`, built from `--brand` and `--surface`,
so the photo fades into the page's own paper rather than into a white the
palette does not contain. **Any colour written inside `bg-[...]` is invisible to
a theme change — put it in a named class.**

**/about ran two `--surface-alt` bands back to back.** The values grid and the
process band were the same colour with nothing between them, so 2,440px read as
one slab with a heading in the middle of it. The values band is `--surface` now.
Bands are what give a page its rhythm; two of the same colour in a row are one
band.

**/careers had no dark band at all** — surface, surface-alt, surface,
surface-alt, then the navy footer, so the whole page read as one sheet and the
footer arrived as the first change of ground. **Benefits is now the dark band**,
on `--brand-navy` with `--night-alt` cards. It is the middle of the page and the
section about what working here is like, which is the same argument that puts
the dark milestones band in the middle of the home page.

`CarouselControls` gained a `tone` prop in the same change, and it is not
cosmetic: the dots are `--ink` at 20% and the arrows are shadcn's `outline`
(`--border` on `--background`), so on a navy band every control vanished.

### The last WCAG 2.2.2 failure is gone — 2026-08-13

The benefits carousel autoplayed at 6s with no pause control, matching what
testimonials did before it. The longest benefit runs ~40 words — about 12s of
reading — so it was taken away from the reader twice over. **Neither carousel
has a timer now**, which is what finally clears the criterion: the play/pause
control was removed by owner decision on 2026-08-12, and a 6s auto-advance with
no keyboard- or screen-reader-reachable way to stop it is exactly what 2.2.2
prohibits. With no timer there is nothing to pause.

If a timer is ever wanted back on either, it needs BOTH an interval matched to
the reading time AND `pausable` on the controls — not one or the other.

### The hero gradient was removed — 2026-08-13

The landing hero's washes followed the cursor (`common/hero-gradient.tsx`, a
client component with a rAF-throttled pointermove listener and a click ripple).
Removed at the owner's request. The band is now `.hero-band`, a plain section
carrying the same two radials at their rest positions — it looks like the old
hero standing still, and the page drops the listener and its bundle.

**`.hero-band` carries `isolation: isolate` and that must stay.** The hero
illustration is `mix-blend-multiply`; without a stacking context the blend gets
the whole band to re-composite on every scroll frame and sections visibly
flicker. This file already records that as one of the two things that broke the
last time hero layers were removed. `.tilt3d-stage` inside creates one too — keep
both, they are belt and braces.

`hero-gradient.tsx` was left in place at first — imported by nothing, like
`pausable` was before it, kept as the one-line way back. **It was deleted on
2026-08-14** at the owner's request, so there is no longer a way back that does
not involve rewriting it. The behaviour it held is described above and the
component was a ~200-line client component: two absolutely-positioned wash
layers moved on the compositor by a rAF-throttled `pointermove` listener, plus
a third layer fired on click.

Its CSS went too, on the same day: the "Hero light" block and the detached
`.hero-light-ripple` rule, 108 lines across two places in `globals.css`. They
had no consumer left and were shipping 17 selectors to every visitor. Nothing
named `hero-light` remains anywhere in the project.

### No dark band except the footer — 2026-08-13

The home page ran dark milestones → white testimonials → dark footer, and
/careers briefly ran dark benefits → white openings → dark footer. **One light
band trapped between two dark ones reads as a gap in the page rather than as a
section of it** — the owner's call, and it is right.

Both are light now. The only dark ground on the site is the footer, which is
where a page should land rather than something it passes through twice.

Rhythm comes from PANELS AND TEXTURE instead of alternating grounds:

| Band | Ground | What differentiates it |
|---|---|---|
| Services | `--surface` | tiles on a `--secondary` slab |
| How we work | `--surface-alt` | the honeycomb field |
| Benefits (/careers) | `--surface-alt` | the honeycomb field |
| Testimonials | `--surface` | plain, one quote card |
| Footer | `--brand-navy` | the only dark ground |

### One motion standard, two speeds — 2026-08-13

- **Arrivals** — content coming onto the page — 0.7s on
  `cubic-bezier(.16,1,.3,1)`.
- **Responses** — hover, press, focus, a dot changing width — 0.22s on plain
  `ease-out`.

A response is judged on how quickly it acknowledges you, not on how smoothly it
finishes; the arrival curve spends its first third barely moving, which on a
cursor reads as the page thinking about it. **Getting these the wrong way round
is the commonest reason an interface feels sluggish.** Interaction timings were
a mix of 300ms defaults and 500ms arrival curves across five files before this.

Documented exceptions, all at their call sites: `--kbd-overshoot` on the
keyboard strike, the 460ms card flip, the 30s honeycomb drift.

### Carousels autoplay again, WITH their pause controls — 2026-08-13

Owner-requested intervals: **testimonials 7s, benefits 5s**. Both carry
`pausable`.

**The timer and the button are one decision.** WCAG 2.2.2: anything moving on
its own for more than five seconds needs a control that stops it, and
pause-on-hover does not count — it cannot be reached from a keyboard or
announced to a screen reader. Do not restore one without the other.

Know the trade on testimonials: the quotes run 61-80 words, 18-24s of reading
against a 7s interval, so a reader who is neither hovering nor focused — most
touch readers — will lose a quote about a third of the way in. It cannot be
tuned away at any interval short of ~20s. The mitigations are the hover/focus
stop, the pause button, and `paused`, which holds while a quote is expanded.
**Do not shorten the quotes to suit the timer** — they are attributed statements
by named people.

### The styling pass — 2026-08-14

Scoped deliberately. The brief was "add animations throughout", and the honest
answer is that this site did not need more animation — it needed the animation
it has to be shared rather than bespoke, and it had just been reported as laggy.
So everything added here is ONE-SHOT and compositor-only. Nothing new loops.

**Every eyebrow carries the same mark.** The home hero had a gradient rule
trailing its label; the four other eyebrows were bare, so the same element read
as two different things depending on the page. `SectionEyebrow` now owns the
rule and draws it in on arrival — `scaleX` from the outer edge, keyed off the
`[data-reveal]` flag the section already sets, so it needs no observer and no
extra element.

**It takes an `align` prop, and that is not cosmetic.** A single trailing rule
on a CENTRED label hangs off one side and pulls the label off axis — the home
hero's own note says exactly this, which is why its rule is `lg`-only there.
Centred eyebrows get one rule on each side, mirrored, growing outward from the
label. Left-aligned ones get the trailing rule alone, because a leading rule
would push the first word off the reading edge the heading starts from.

**Both secondary heroes had no arrival at all.** They sit above the fold, so
they cannot wait for an observer, and nothing else animated them — the page
simply appeared. `/about` and `/careers` now carry `data-stagger="load"`, the
same rise the home hero uses, which rises WITHOUT fading. Verified: the words
animate `stagger-rise` at `opacity: 1` throughout.

**The about hero's photograph was invisible.** At a 90/96% wash the office was a
rumour and the band read as a plain tint with a smudge in it — the site was
paying for an image nobody could see. Now 82% easing to 93% behind the densest
copy. Measured first: at 82%, even a black pixel underneath leaves the ground at
~`#CDD1D3`, where the heading holds ~11:1 and the body ~7:1.

**The careers hero states how many roles are open.** It was four stacked blocks
of centred prose with no fact in it. The count is derived from
`CURRENT_OPENINGS`, so it cannot go stale, it is pluralised properly, and it
hides at zero rather than announcing an empty list. Blue, because it is
information and the green beside it is the thing you can press. Its CTA also
gained the arrow the home hero's primary CTA has — both are the one green button
on their page and should behave identically.

### Tinted bands feather; they do not butt — 2026-08-14

A tinted band meeting a paper band draws a **hard horizontal line across the
full width of the page**. It is only a 2.9 L\* step — `#FAFBFC` to `#F0F3F6` —
but a straight edge that wide reads as an edge however small the difference
either side of it, and the eye lands on it every time it scrolls past.

`.band-soft` fades the tint in at the top and back out at the bottom over ~170px
each end, so the two bands meet in paper rather than at a line. The middle is
still the full tint, so the section still reads as its own ground — it just has
no seam. **Both ends, deliberately:** an alt band is almost always between two
paper bands, and feathering only the top moves the seam to the bottom.

Where the band below is the navy footer the fade to paper is harmless — that
boundary is a deliberate change of ground and wants its hard edge.

**Band order is now checked, not assumed.** `/careers` had drifted to THREE
`--surface-alt` bands in a row — qualities, benefits and openings — which is
1,700px of one colour with two headings sitting in the middle of it. It happened
because Benefits was moved to navy and then back, and nothing was watching the
sequence. Benefits is `--surface` now and the page alternates again.

**Two of the same ground in a row is one band with a heading in it.** Check the
sequence whenever a band changes colour:

| | home | /about | /careers |
|---|---|---|---|
| 1 | hero — paper | hero — photo | hero — paper |
| 2 | services — paper + panel | values — paper | qualities — **tint** |
| 3 | how we work — **tint** + hex | how we work — **tint** + hex | benefits — paper + hex |
| 4 | testimonials — paper | footer — navy | openings — **tint** |
| 5 | footer — navy | | footer — navy |

### Band order is checked by the machine now — 2026-08-14

Writing the rule down did not stop it drifting three times, and it was never
going to: **band order is a property of the PAGE while the ground is chosen per
SECTION**, in six call sites, two of them (`Milestones`, `Benefits`) shared
across routes. Nobody can see the sequence from any one of those files, so
nobody can see the collision either. A note in this file just moves the burden
onto remembering to re-read it.

`components/dev/band-check.tsx` walks `main > section` after paint and warns
when two neighbours share a ground. Development only — the production bundle
does not contain it.

**It checks a constraint rather than computing a value**, and that is
deliberate. A component that mechanically alternated would be wrong on home,
which runs paper → paper → tint → paper on purpose because the services band
carries its own panel. Checking leaves the design free; computing would have to
be fought.

**Only an opaque PANEL exempts a band. A texture does not.** The first version
exempted anything containing `.hexfield`, and when the exact `/careers` bug was
reproduced to test it — three tinted bands with the honeycomb on the middle one
— it stayed silent. A check that cannot fail is worse than no check, because it
reads as coverage. The honeycomb is 17% lines masked to 14% through the middle:
texture, not a ground.

Verified both ways before being trusted: silent on the corrected pages, and on
the reproduced bug it names both seams — `"Want to work with us?" and
"Benefits"`, `"Benefits" and "Current Openings"`.

### The audit pass — 2026-08-14

An `/impeccable audit` scored the site 18/20 and four fixes followed. Three of
them changed a system primitive rather than a screen, which is why they are
here.

**`focus-ring` / `focus-ring-dark` are THE focus indicator. Nothing else.**
The ring was hand-written at 14 call sites and had already drifted — the footer
and the mobile menu rows had dropped `ring-offset-2` while the rest kept it.
That drift was forced: Tailwind's ring offset paints `--tw-ring-offset-color`,
which defaults to white, so on navy it drew a white halo and had to go. An
`outline` shows the real ground through its offset instead, so one class works
on paper and navy alike, it follows `border-radius` for free (several sites had
been carrying `focus-visible:rounded-lg` purely to reshape the ring), and it
does not composite into `box-shadow` and eat a card's hover elevation.

The same pass found shadcn's inherited `focus-visible:ring-ring/50` FAILING
WCAG 2.2 on every ground: with `--ring` mapped to `--brand` it composites to
`#8aa89f`, measuring **2.48:1 on `--surface`, 2.42:1 on `--surface-alt`, 2.34:1
on `--secondary`** against the 3:1 a focus indicator needs. Every button on the
site was affected. `button.tsx` now uses `focus-ring` (8.36 / 7.78 / 7.14:1),
so buttons and links finally indicate focus the same way. A button on a dark
band takes `focus-ring-dark`; the contact form's submit is the only one.

**Every band is a named region.** `<section aria-labelledby>` pointing at its
own heading, on all 14 bands. An unnamed `<section>` is not exposed as a region
at all — it is a `<div>` with extra letters, and it never reaches the landmark
list. `aria-labelledby` rather than `aria-label` so the name cannot drift from
the heading.

**Repeated groups are lists.** Nav, footer columns, socials, services, values,
qualities, openings. The carousels are deliberately NOT lists: their
`role="group"` / `aria-roledescription="slide"` pattern already describes them
and list markup fights it.

**The services sequence waits for the scroll to stop.** Measured: starting on
intersection put the second keystroke 92ms late, because the first keystrokes
landed while the scroll was still carrying. It now waits 120ms of quiet with a
700ms cap — the cap is load-bearing, or a slow continuous scroll past the band
never starts it and lands on an empty board. Gaps are now within 7ms of nominal.

**Embla is read with `useSyncExternalStore`, not mirrored into state.** Both
carousels seeded state from an effect body, costing a second render on mount
and every reInit, and the old cleanup leaked the `reInit` listener. `npm run
lint` is clean and should stay that way.

### anime.js, for one thing only — 2026-08-14

**The first animation library in this project, and it earns its place on one
section.** Everything else here is CSS, and stays CSS. The survey that preceded
this found only two candidates worth a dependency: the process spine, and the
services keyboard's hand-rolled sequencer (~15 absolute `setTimeout`s handing
between keyframe sets on `animationend`). The keyboard was NOT converted — the
payoff there is maintainability, not visible quality, and it works.

**The spine draws with the scroll.** `common/milestone-spine.tsx` animates
`stroke-dashoffset` on a line down the process timeline, linked to scroll
position through anime.js's `onScroll` with `sync: 0.35`. Progress 0 is the
list's top a fifth of a screen above the fold; progress 1 is its bottom at the
middle of the screen — that pairing keeps the drawn head near what you are
reading. Each marker takes a halo as the line reaches it, and loses it if you
scroll back up.

**TWO LINES ON ONE COLUMN, and this is the part to preserve.** The original
gradient track is untouched and is still the entire design on its own; the drawn
line sits over it. Every failure mode therefore lands on the design that shipped
before this: verified in all four combinations —

| | JS | no JS |
|---|---|---|
| motion OK | draws on scroll | fully drawn (`<noscript>`) |
| reduced motion | fully drawn, anime.js never runs | fully drawn |

The track measured 1283px tall and present in all four. **Do not merge the two
elements into one animated line.**

**Cost, measured against `next build`: +16,583 bytes gzipped** (+44,087 raw),
in its own chunk, loaded on `/` and `/about` only — `/careers` does not
reference it. That number depends on importing the SUBPATHS, `animejs/animation`
and `animejs/events`. Importing `animejs` instead pulls the timeline, draggable,
WAAPI and text engines in with it.

`createDrawable` is deliberately unused. `pathLength={1}` on the line renders it
unnecessary — it renormalises the path to one unit, so `stroke-dasharray: 1`
with a 1→0 offset is an exact draw at any height, with nothing to measure and
nothing to recompute on resize.

Two bugs found by measuring, both invisible on a desktop review:

1. **An absolutely positioned `<svg>` with `top` and `bottom` set ignores
   `bottom`** and takes its intrinsic viewBox height (CSS 2.1 §10.6.5). The
   spine rendered 100px against a 1283px track. It now sits inside a positioning
   wrapper and fills it with `size-full`.
2. **Below `md` the last marker sits outside the drawn range** — measured at
   1.0333 at 375px, because the markers are in flow there and `last:pb-0` ends
   the list level with marker 6, which `bottom-6` then cuts above. Its halo
   never fired while the other five worked. Offsets are clamped to `[0,1]`, so a
   step past the end of the line is reached when the line finishes. At 1280px
   the same marker is at 0.8772 and is unaffected.

### Two people got their initials back — 2026-08-14

The 2026-08-14 audit's only P1: **two of the five testimonials rendered a shared
`Placeholder.png`** — a generic silhouette beside the real name and real
employer of a real person, on the one section of the site whose entire job is
credibility. Three had photographs, which made the two that did not more
conspicuous, not less. It had survived earlier reviews precisely because it
looked consistent.

`common/monogram.tsx` now draws their initials instead — derived from the name,
so a future testimonial without a photo is handled with nothing to remember.

**The disc is brand-tinted, not grey.** A neutral disc sitting beside three
full-colour portraits reads as an image that failed to load; the same disc in
the section's own green reads as a decision. `bg-brand/10` is a colour utility
resolved through the token, not a literal in a bracket. Measured on the painted
pixels: **6.64:1** for `--brand` initials on the disc.

It repeats the portrait's box **verbatim** — `size-12 lg:size-16`, the ring, the
offset — so the two sit identically in the row. Change one and change the other
in the same edit.

`avatar` is now `StaticImageData | null`, and null MEANS "we have no photo of
this person". Drop a real photograph in and set it; nothing else changes.
`Placeholder.png` is deleted — a shared placeholder file is how this defect
spread in the first place.

### The last two values are still ours — 2026-08-14

`content/about.ts` carried `// DRAFT — pending the owner's own wording` on
**Ownership** and **Commitment**. The audit pulled it up because the copy reads
well enough that nobody would notice it was never approved: two of five stated
company values were the writer's words presented as the company's.

Both have had a craft pass — the rhythm of the three the owner did write, no
claim added or removed. "We own the outcome, not just the task" and "we stay
through the part of a project that is hard" now land the way the others do.

**This fixes how they read, NOT whose words they are.** The note in the file
says so and stays until the owner replaces them. Recorded as knowingly open, not
as closed.

### The hero art moves on phones now — 2026-08-14

The pointer tilt in `hero-visual.tsx` is gated on `(hover: hover) and (pointer:
fine)`, which is right — there is no pointer to follow on a touch screen. But
that gate meant **the one piece of art on the home page was completely static on
every phone**, and static on desktop the moment you stopped moving the mouse.

A scroll parallax now runs alongside it, ungated except for reduced motion. The
art lags the page by 14px across the hero's exit; the glow lags by 28px.

**The glow travels FURTHER than the art, which inverts the tilt's rule on
purpose.** Under rotation, the layer further from the camera sweeps a smaller
screen arc — that is why the glow is the quieter one there. Under translation, a
background reads as distant precisely because it crosses LESS of the screen, and
a larger positive Y cancels more of the scroll. Perspective widens the gap: at
`perspective: 1100px` the art at z=+40 shows 1.038× of its Y and the glow at
z=-90 shows 0.924×.

**It drives two custom properties; it does not touch `transform`.** Both layers
already carry a `translateZ` placing them in the 3D stage, and the stage carries
the tilt rotation. A second `transform` declaration replaces rather than adds,
so animating `transform` here would have dropped the `translateZ` and silently
flattened the stage into a picture. `globals.css` composes both into one
`translate3d`, with a `0px` fallback — so no JS, a blocked bundle and reduced
motion all resolve to the exact transforms that shipped before this. Verified:
reduced motion leaves both properties **unset** and the matrices identical.

**Cost: +382 bytes gzipped**, because `animejs/animation` and `animejs/events`
were already in this route's chunk for the process spine. Had this been the
first use it would have been ~16.5 kB. **If the spine is ever removed, re-measure
before keeping this** — the parallax alone does not justify the dependency.

`sync: 0.65`, tighter than the spine's 0.35. The parameter maps to a per-frame
lerp between 0.01 and 0.2, so higher tracks the scroll more closely; visible lag
on a parallax reads as the art sliding after you have stopped. It is not 1:1
because a mouse wheel arrives in discrete jumps, which would step.

### "at Arcompsol" is green — all of it — 2026-08-14

Owner-requested. It was only the last word, on the recorded grounds that this
was "the same treatment the hero gives 'with Innovation'". **It was not** — the
hero's accent span wraps `with ${headAccent}`, joining word included, so the two
headings disagreed for exactly as long as the comment claimed they matched. They
now agree. `--brand` on `--secondary` measures **7.14:1**.

It is `text-brand` on the span in `page.tsx`, and the CSS rule is gone. A
token-mapped colour utility satisfies the rule below — what that rule bans is a
LITERAL inside a bracket, which no palette change can reach.

### The honeycomb stopped being wallpaper — 2026-08-14

Four changes, all of them numbers. **No new elements, no new animations, no
bundle** — the field still runs exactly three animations, as it did before.

**It had a beat you could count.** Both pulse layers ran at 9s, offset by half a
cycle. That is antiphase, which sounds varied and is not: the PAIR returned to
the same state every 4.5s and did so forever. The periods are now **9s and 11s**
— co-prime, so the combined state repeats every 99s.

**It had a repeat you could find.** Both pulse patterns were 3×3 lattice steps,
so the second reinforced the first's grid instead of breaking it: measured
**6.7 identical tiles across a 1920 band**. Group 2 is now 4×5 (384×277.15), so
the combined arrangement only repeats every LCM(288, 384) = 1152px — **1.67
times across the same band**.

**The pulse was below the threshold of being noticed.** Measured on a 400px
strip of the left margin — the field's best case, no copy so the mask is at full
strength — the peak moved the picture by a **mean of 2.7/255, about 1%**. The
section was running two permanent animations for a change at the edge of
perception.

`--hex-cell` is now **15% on paper and 19% on navy**, up from 11%/15%. It was
tried at 20%/24% first and brought back on the owner's call. The measured cost
of that decision, same strip and method:

| cell tint | pulse peak, mean px shift |
|---|---|
| 11% (original) | 2.659 |
| **15% (shipped)** | **2.833** |
| 20% (tried) | 3.806 |

**The response is not linear in the tint** — the four points from 11 to 15 buy
about a seventh of what the nine points from 11 to 20 do, so 15% is much closer
to the original than to the trial value. Recorded because it is exactly the kind
of number someone will interpolate. (I predicted 15% would keep "most" of the
gain when suggesting it; measurement says a seventh.)

The LINE did not move at any point; 17% and 20% stand, because the line is what
sits under running copy everywhere and has no mask protecting it specially.

**The two layers were interchangeable.** Both crested at opacity 1. Group 2 now
peaks at 0.65 and is sparser per unit area, so they read as a near layer and a
far one rather than as one layer blinking twice.

Contrast re-measured as the rule in `globals.css` demands, at the field's
mid-height in the centre column, pulse at peak, every non-field element hidden
so the darkest remaining pixel IS the ground:

| tone | worst ground | heading | body |
|---|---|---|---|
| paper | `#E7ECF0` | 15.04:1 | 8.60:1 (`--ink-soft`) |
| navy | `#142220` | 16.41:1 | 6.77:1 (white/60) |

Identical at 1920 and 375. **Mobile is checked deliberately**: below `md` the
step panels lose their opaque background and the step headings sit directly on
the field. `--ink-muted` measures 4.09:1 there and is not used in this section —
check before adding it.

**The margins got darker and that is the trade.** At full strength a lit cell
crossed by a lattice line now measures `#B6C5CF`, where `--ink-muted` would be
2.75:1. That is acceptable only because no copy is there by layout, and it is
now a rule: **do not put text in the margins of this band.**

Rejected in the same pass: a **third pulse group** (removed once already for
performance; the two changes above buy the same variety for free), **two-speed
parallax** (the largest visual gain available, but a fourth permanent animation
and roughly double the page's biggest raster surface), and **coupling the field
to the spine's scroll progress** (ends `hex-field.tsx`'s zero-JS server
component, which is what keeps `Milestones` a server component). **Diagonal
drift** was offered and not taken — the downward direction is documented as
deliberate, "it reads in the same direction as the process it sits behind".

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

## Palette — drawn from the mark

**Applied 2026-08-13.** Every colour is derived from the two that are actually
in `public/images/logo.png`, read from the pixels: 5,229 opaque pixels of
`#38B089` in the four bars, 569 of `#6597CE` in the two dots. The greens are
that green held at its own hue and saturation and stepped down in lightness; the
blues are the same for the dots. Every swatch is the mark at a different weight.

### Green — the four bars

| Token | Value | On `--surface` | Role |
|---|---|---|---|
| `--brand` | `#1B5542` | **8.36:1** | buttons, links, eyebrows, focus ring |
| `--brand-mid` | `#20654E` | 6.63:1 | hover, secondary buttons, second fill |
| `--brand-deep` | `#11362A` | 12.7:1 | gradient ends, pressed states |
| `--brand-on-dark` | `#38B089` | 2.62:1 ✗ | **the mark.** 6.42:1 on navy — dark grounds only |

### Blue — the two dots

**The site had no blue before this.** `--brand-blue` existed but held `#2E7C63`,
a green, with a comment admitting the name was historical. It is a blue again —
the mark's `#6597CE`, not the `#00BDFF` cyan that was removed for being the only
cool note on a warm page.

| Token | Value | On `--surface` | Role |
|---|---|---|---|
| `--brand-blue` | `#2F5F93` | **6.38:1** | links, informational states, second series |
| `--brand-blue-soft` | `#3972B2` | 4.76:1 | large text and 24px+ only |
| `--brand-blue-deep` | `#1B3755` | 11.7:1 | gradient ends |
| `--brand-blue-on-dark` | `#6597CE` | 2.95:1 ✗ | the dots. 5.70:1 on navy — dark grounds only |

**Blue is not for buttons.** A secondary action belongs to the same family as
the primary, one step lighter — that is what `--brand-mid` is for, and the
`brandOutline` button points at it. Blue marks a different *kind* of thing, not
a quieter version of the same thing.

**Where the blue actually is (added 2026-08-13).** It was introduced with the
palette and then used nowhere but a few 6–11% decorative washes — three of its
four tokens were dead. It now has three jobs, and they are the ones this section
claimed for it:

| Where | Token | Why it is blue and not green |
|---|---|---|
| Honeycomb lit cells | `--brand-blue` / `--brand-blue-on-dark` | The lattice is green and the cells are blue **because that is what the mark is**: four green bars, two blue dots. The field was green throughout, which made it a texture in the brand colour; split the way the logo is split, it becomes the logo's own structure at wall scale. |
| Job metadata chips (team, location) | `--brand-blue` on `/10` | Facts *about* the job. Green on this site means "you can do something with this" — buttons, links, focus, hover. Metadata in the same green makes the reader work out which greens are clickable. 5.51:1 on the tint, 5.15:1 on `--surface-alt`. |
| Footer link hover | `--brand-blue-on-dark` | Green is already taken on that panel — it is the `YOUR DETAILS` group labels and the form's focus ring — so a link lighting up green is the same signal as a heading. 5.70:1 on `--brand-navy`. |

The focus ring stays `--brand` and is not a candidate: a focus ring is an
affordance, and it should match the colour the interface already uses to mean
"this is interactive". That is a separate decision recorded above.

### Ink, surfaces and grounds

| Token | Value | L\* | Notes |
|---|---|---|---|
| `--ink` | `#12181D` | 7.9 | **17.26:1** on surface |
| `--ink-soft` | `#39424A` | 27.5 | 9.88:1 |
| `--ink-muted` | `#5A646D` | 41.8 | 5.83:1 on surface, 4.98:1 on secondary |
| `--ink-faint` | `#9AA6AF` | 67.5 | muted copy on dark bands, 7.01:1 on navy |
| `--surface` | `#FAFBFC` | 98.6 | page ground, not pure white |
| `--surface-alt` | `#F0F3F6` | 95.7 | alternating bands |
| `--secondary` | `#E4EAEF` | 92.4 | panels that hold cards |
| `--border` | `#D5DDE4` | 87.7 | hairlines |
| `--brand-dark` | `#16241F` | 12.8 | headings on tinted bands |
| `--brand-navy` | `#111C1A` | 9.2 | footer and dark bands. White holds 17.43:1 |
| `--night-alt` | `#182725` | 14.3 | cards and panels ON the dark bands |

### THE SURFACES ARE COOL, and that was the trade

They were warm — `#FBFAF7` and `#F3F0EA` — with an accent deliberately warmed to
match. But the logo is cool: the green sits at hue 160° and the blue at 211°.
Warm paper under cool accents is the mixed-temperature pairing this file already
identified as making a page read as assembled rather than designed, so following
the mark honestly meant cooling the paper with it.

**You can have warm paper or logo-faithful accents. Both together is the one
option that does not work.** If the warm paper is ever wanted back, the accents
have to be re-warmed with it — do not revert one half.

### The logo colours are signatures, not UI colours

`#38B089` measures **2.62:1** on the paper and `#6597CE` **2.95:1** — both fail
AA outright as text. They appear in the interface only on dark grounds, where
they measure 6.42:1 and 5.70:1. That is why each has a darker twin. Do not
re-introduce either as a colour for text on light.

Worst pairing anywhere on the site is `--ink-muted` on `--secondary` at 4.98:1;
AA needs 4.5:1.

### On the dark bands — and no more `white/xx`

The footer and the dark milestones band painted with raw `white/55`, `white/6`,
`border-white/10` and so on — 49 of them across ten components, which
`globals.css` had flagged and nothing had fixed. Two problems: a translucent
white is a **different colour on every ground it sits on**, so `text-white/55`
on the panel and on a card inside that panel were quietly two different greys;
and none of it was in the palette, so re-theming could not reach any of it.

| Token | Value | On `--brand-navy` | Role |
|---|---|---|---|
| `--on-dark` | `#EEF3F1` | **15.54:1** | headings, primary copy |
| `--on-dark-soft` | `#B7C4C1` | 9.69:1 | body copy |
| `--on-dark-muted` | `#8C9A97` | 5.96:1 | labels, captions, meta |
| `--night-alt` | `#182725` | L\* 14.3 | cards and panels ON a dark band |
| `--night-field` | `#1C2E2B` | L\* 17.3 | form inputs |
| `--night-line` | `#2B3D39` | L\* 24.1 | borders and rules on dark |

All three text values clear AA on all three dark grounds. The surfaces are
spaced 5.1 and 3.0 L\* apart, so a panel inside a band and a field inside a
panel actually separate — they were translucent whites at 3% and 6% before.

**`--on-brand` is a different role from `--on-dark`.** It is the colour of text
on a brand FILL — a green button, the nav pill, a numbered marker — and it
points at `--surface`, so a button label is made of the same material as the
page. 8.7:1 on `--brand`. Do not use `--on-dark` there or `--on-brand` on a navy
band; they are near-neighbours that mean different things.

`--danger` / `--danger-on-dark` replace the contact form's `text-red-300` and
`border-red-400`, which were a Tailwind ramp on a panel this palette owns.

### Where hex literals are still allowed

No hex literals in components. Two exceptions, both because the renderer cannot
read CSS custom properties, and both of which must be updated BY HAND when the
tokens above change:

- `src/app/opengraph-image.tsx` — Satori resolves no variables. Each literal
  names the token it mirrors.
- `src/app/api/email/route.ts` — Outlook renders with Word's engine and Gmail
  strips `<head><style>`, so every rule is inline on the element. Its literals
  are collected in ONE `C` map at the top of the file, keyed by the token each
  one copies; the markup never writes a raw hex. Update that map and the whole
  email follows. Before this it carried four literals belonging to no token at
  all — `#f4f6f8` and `#ffffff` for the grounds, `#68737e` for every muted
  label, `#cbd8d2` under the links — close enough to look deliberate, wrong
  enough that the mail never matched the site.

  The email is also **one type family**, not two. Its subject was set in a
  serif (Iowan Old Style / Palatino / Georgia) — the largest element in the
  message, in a face this brand does not own. It now takes the same grotesque
  stack as the body at 600. No web font can load in email, so that stack is
  standing in for Poppins and Open Sans both; do not reintroduce a second
  family to create hierarchy that weight and size already carry.

## Type

Poppins for headings (`--font-heading`, weights 500/600), Open Sans for body
(400/500/600, one variable file). Both through `next/font/google`, which
self-hosts — `public/fonts` was deleted. One static `Poppins-SemiBold.ttf`
survives in `src/assets/fonts` solely for the OG card; do not delete it.

Body copy is capped at 65ch by `.measure`.

## Motion

One idea: content arrives as you scroll to it. Plus the pointer tilt AND scroll
parallax on the hero art (`hero-visual.tsx`), the typed-keyboard sequence that
opens the services band (`sections/services-grid.tsx`), the click-to-flip
service cards, and the process spine that draws with the scroll
(`common/milestone-spine.tsx`). The pointer-tracked hero wash that used to sit
at the top of this list is gone — see "The hero gradient was removed" above.

Nothing loops **except the "How We Work" honeycomb**, which is the single
documented exception above. Do not add a second one on the strength of it.

Transform and opacity only — `transition-all` appears nowhere, and no rule
animates a layout property. **One exception, and it is the whole reason the
spine exists: `stroke-dashoffset`.** It is neither a transform nor a layout
property; it changes what is DRAWN of a path without moving, resizing or
repainting anything around it, and it is the only property that can express "the
line has got this far". It applies to one 2px SVG line. Do not read it as
permission to animate paint properties generally.

`prefers-reduced-motion` is honoured in CSS and in every motion component, and
smooth scrolling is gated on it too.

**Two things are SCROLL-LINKED and nothing else is** — the process spine and the
hero art's parallax. Everything else is triggered, runs on its own clock and
finishes. Progress that tracks the scrollbar is the one kind of motion that
cannot be waited out, so both are confined to decoration: a line carrying no
information the six numbered steps do not already carry, and an illustration
drifting 14px. Neither moves anything a reader has to follow.

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

- **The contact form SENDS — smoke-tested 2026-08-14.** This entry used to read
  "the contact form cannot send. No `.env`". Both halves are now out of date.
  `.env` carries `SMTP_EMAIL` and `SMTP_TOKEN`, and a real submission through
  `POST /api/email` returned 200 `{"message":"Sent"}` in 4.0s with nothing in
  the server log — which is only reachable when `client.sendAsync` resolves,
  because every SMTP failure takes the catch branch and returns 500
  `{"message":"Error sending email"}`.

  The test was addressed so that BOTH recipients resolved to the sending
  account (`CONTACT_TO` is unset, so `inboxFor()` falls back to `SMTP_EMAIL`,
  and the form's own email field was set to the same address). Nothing went to
  an outside inbox. Repeat it that way.

  Still unconfirmed: whether it lands in the inbox or in spam. The API cannot
  tell you that and neither can a passing build — someone has to look. Note
  that mail from the account to itself is the easy case; a stranger's address
  is the one that exercises SPF/DKIM on this domain.
- **`Ownership` and `Commitment` in `content/about.ts` are still the writer's
  words, not the owner's.** Both had a craft pass on 2026-08-14 and now read
  like the three the owner wrote, which makes this *less* visible rather than
  more — the note above them in the file is the only thing left flagging it.
  Two of five stated company values. Replace them and delete the note.
- **Two testimonials have no photograph** — Omer Erdogan and Abrar Akhtar. They
  render an initials monogram, which is a designed answer rather than a
  placeholder, but a real portrait is still the better one. Set `avatar` in
  `content/testimonials.ts` when the photos arrive; nothing else changes.
