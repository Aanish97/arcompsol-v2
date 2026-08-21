"use client";

/**
 * The six service tiles, and the keyboard that types the heading's last word.
 *
 * ── IN SIMPLE WORDS ──
 * Scroll to the services band and a keyboard is sitting there, unlit. It types
 * A-R-C-O-M-P-S-O-L on its own — each key jumps up on a real keycap and stays
 * up. Then Enter is pressed: it goes DOWN like a real key, darkens, and comes
 * back. The board fades out the moment it lands, the typed word lifts into the
 * heading — which finishes reading "Services we provide at Arcompsol" — and the
 * cards rise into the space the board was holding. Once, on first scroll.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * THE KEYS ARE DRIVEN BY CLASS NAMES, NOT BY REACT STATE. Nine keystrokes, an
 * Enter, a dissolve and a clear is eighteen transitions inside three seconds,
 * and routing each through React would re-render the whole grid — six cards,
 * each with two faces and two images — eighteen times for an effect that
 * touches nothing but a class. The same discipline hero-visual.tsx uses, for
 * the same reason. React owns one thing here: whether the cards have arrived.
 *
 * THE WORD IS MOVED WITH FLIP, AND IT MOVES THE REAL ELEMENT. Its start box and
 * the heading slot's box are both measured, and the readout is transformed from
 * one to the other, left edge to left edge. The readout is set in the heading's
 * own face, size, case and colour, so the two are the same word throughout and
 * the scale resolves to about 1 — the flight is close to a pure translation.
 * Scaled by WIDTH rather than height, so the two overlap exactly at the moment
 * they cross-fade.
 *
 * A REPEATED LETTER NEEDS ITS OWN ANIMATION. "ARCOMPSOL" has two O's, and by
 * the second one that key is already up. Replaying the strike would drop it to
 * the board and lift it again, which reads as the letter being deleted and
 * retyped. `is-restrike` bumps it from where it stands. Any word with a repeat
 * needs this.
 *
 * ENTER IS NOT A LETTER KEY, AND IT NO LONGER PRETENDS TO BE. It used to rise,
 * turn green, grow a bevel stack and fly off the top — the letter-key treatment,
 * which is right for a letter because staying up is how it spells the word.
 * Enter spells nothing; it is a command, so it does what a command key does and
 * only that: down, darker, no side wall, back. See `.kbd-enter.is-tapped`.
 *
 * THE BOARD LEAVES AS ONE ELEMENT. There were two staggered exits — the unused
 * keys dropping one by one, then the lit ones lifting one by one — up to 27
 * delayed animations that stretched the tail out about a second past the point
 * where the visitor already knew what had happened. One fade on `.kbd-rows`
 * says the same thing sooner. The readout is deliberately NOT in that fade: it
 * is still carrying the word.
 *
 * ── DO NOT ──
 * - Do not wrap the cards in <Reveal>. It sets its own opacity and transform on
 *   the same element, so the two would fight over one property.
 * - Do not remove `.pop-item` or `.services-wordmark` from the <noscript> block
 *   in layout.tsx. Both start invisible and JavaScript reveals them; without
 *   that rule a blocked bundle leaves the band empty AND leaves the heading
 *   reading "Services we provide at" with nothing after it.
 * - Do not give the keyboard a tab stop or a label. It is an animation of a
 *   keyboard, not a keyboard: nothing here can be typed on.
 */
import { useEffect, useRef, useState } from "react";

import { ServiceCard } from "@/components/common/service-card";
import { SERVICES } from "@/content/home";

/** What gets typed. Every letter of it must exist in ROWS below. */
const WORD = "ARCOMPSOL";

/**
 * A real QWERTY layout, because a keyboard with invented key positions reads as
 * a grid of letters. The rows are offset in CSS the way a keyboard's are.
 */
const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

/* ── Timing ──────────────────────────────────────────────────────────────
   THE ORDER IS: type → Enter → board clears and hands the word to the heading
   → cards. Everything after Enter is measured FROM Enter, so the tail can be
   re-timed without re-deriving each step from the one before it.

   The board empties itself and gives the word away BEFORE the cards arrive.
   That order is the point: the keyboard finishes its business and leaves, and
   the cards come into the space it was holding — rather than appearing over the
   top of a board that is still clearing itself. */

/** Before the first keystroke — long enough to register the board unlit. */
const START_MS = 260;
/** Between keystrokes. Below ~90ms it stops reading as typing and starts
 *  reading as a ripple; above ~180ms it reads as hesitation.
 *
 *  IT ALSO SETS HOW MANY KEYS ARE ANIMATING AT ONCE, which is why it moved up
 *  from 100ms. A strike runs 440ms, so at 100ms apart five keys were mid-strike
 *  simultaneously and each new one landed before the last had settled — the
 *  strokes ran together into one ripple rather than reading as separate presses.
 *  At 145ms it is three, each keystroke has room to finish its rise, and the
 *  compositor has fewer transforms in flight per frame. */
const STEP_MS = 145;
/** The beat before Enter. A typist pauses at the end of a word — so this has to
 *  stay LONGER than STEP_MS, or Enter arrives faster than the letters did and
 *  reads as a stumble rather than a decision. */
const ENTER_GAP_MS = 210;

/**
 * How long the Enter keystroke takes, start to finish. Must match
 * `kbd-enter-press` in globals.css — the board leaves the moment it lands, so
 * this figure is what everything after it is measured from.
 */
const ENTER_PRESS_MS = 200;
/** Enter lands → the board fades out. Immediately, by 40ms. */
const EXIT_AFTER_ENTER_MS = ENTER_PRESS_MS + 40;
/** Enter lands → the typed word lifts off toward the heading. */
const HANDOFF_AFTER_ENTER_MS = ENTER_PRESS_MS + 120;
/**
 * Enter → the cards. AFTER the board has begun clearing and the word is in the
 * air, so the sequence resolves in the order it reads.
 *
 * KNOW WHAT THIS COSTS. The cards hold their layout space while hidden, so
 * anyone scrolling in faster than the board types sees an empty panel where
 * they will appear — about 2.2s of it, from the section entering view. That is
 * the reason the typing is 100ms a key rather than 170, and the reason the
 * cards overlap the word's flight instead of waiting for it to land. If the
 * sequence ever grows, this is the cost that grows with it.
 */
const REVEAL_AFTER_ENTER_MS = ENTER_PRESS_MS + 380;
/**
 * Enter → the empty board leaves the layout and the cards rise into its space.
 * Must clear the word's 760ms flight, which starts at HANDOFF_AFTER_ENTER_MS —
 * the word lives inside the board, so collapsing early would delete it mid-air.
 */
const COLLAPSE_AFTER_ENTER_MS = HANDOFF_AFTER_ENTER_MS + 820;

const ENTER_AT_MS = START_MS + WORD.length * STEP_MS + ENTER_GAP_MS;

export function ServicesGrid() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const board = wrap.querySelector<HTMLElement>("[data-kbd]");
    const word = wrap.querySelector<HTMLElement>("[data-kbd-word]");
    const caret = wrap.querySelector<HTMLElement>("[data-kbd-caret]");
    const keyFor = (char: string) =>
      wrap.querySelector<HTMLElement>(`[data-kbd-key="${char}"]`);

    // The heading slot lives in page.tsx, outside this component — the heading
    // belongs to the section, not to the grid. Queried from the document rather
    // than passed as a prop because a ref cannot cross a server/client boundary,
    // and the alternative is making the whole heading a client component to
    // hand down one element.
    const slot = document.querySelector<HTMLElement>(
      "[data-services-wordmark]",
    );

    /** The typed word travels into the heading and the two cross-fade. */
    const handOffWord = () => {
      if (!word || !slot) return;

      // THE LAST word span, not the whole slot. The slot reads "at Arcompsol"
      // and the thing in flight reads "ARCOMPSOL" — measured against the whole
      // slot the word would land straddling both, centred on the space.
      const marks = slot.querySelectorAll<HTMLElement>(".wordmark-word");
      const target = marks[marks.length - 1];
      if (!target) return;

      const from = word.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      if (!from.width || !to.width) return;

      // Scaled by WIDTH so the two occupy the same span at the moment they
      // cross. transform-origin is left top (set in CSS), so the left edges
      // align rather than the centres — the heading reads from a left edge.
      const scale = to.width / from.width;
      const dx = to.left - from.left;
      const dy = to.top - from.top;

      word.animate(
        [
          { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
          { opacity: 0.9, offset: 0.55 },
          {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`,
            opacity: 0,
          },
        ],
        {
          duration: 760,
          easing: "cubic-bezier(0.22, 0.68, 0.24, 1)",
          fill: "forwards",
        },
      );

      // The heading's own words take over on the SITE'S STAGGER — one data
      // attribute, and `.wordmark-word` does the rest in CSS (globals.css).
      // Fired partway through the flight rather than after it, so "Arcompsol"
      // is fading up underneath as the flying copy fades out: the last third of
      // the move is a cross-fade and not a swap.
      //
      // 340ms puts the SECOND word's 45ms stagger step at ~385ms, roughly half
      // way through the 760ms flight. "at" leads it in.
      window.setTimeout(() => {
        slot.dataset.shown = "";
      }, 340);
    };

    // Anyone who asked for less motion gets the finished picture immediately:
    // the heading complete, the board gone. Nothing is hidden behind a timer
    // they never asked to wait for.
    //
    // THE CARDS AND THE WORDMARK ARE NOT TOUCHED HERE. Both hidden states live
    // inside `prefers-reduced-motion: no-preference` in globals.css, so under
    // `reduce` neither applies and both are already visible. Setting them from
    // this branch would be a synchronous setState in an effect for no visual
    // difference at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Clipped to nothing rather than `display: none`, for the same
      // margin-collapse reason as the animated path below: a zero-height
      // sibling keeps the wrapper's margin and the grid's from collapsing
      // together. Here it only has to look right on the first frame, but
      // keeping the two paths identical means they cannot disagree later.
      if (board) {
        board.style.overflow = "hidden";
        board.style.height = "0px";
      }
      return;
    }

    const timers: number[] = [];
    /** Listener teardown, for anything that outlives a single timeout. */
    const cleanups: Array<() => void> = [];
    const after = (ms: number, run: () => void) =>
      timers.push(window.setTimeout(run, ms));

    const strike = (char: string) => {
      const key = keyFor(char);
      if (!key) return;

      // Already up — this is the second O. Bump it rather than replaying the
      // press, which would drop it to the board first. The float is taken off
      // and put back so the two animations never run on one element.
      if (key.classList.contains("is-lit")) {
        key.classList.remove("is-floating", "is-restrike");
        void key.offsetWidth; // restart the animation
        key.classList.add("is-restrike");
        key.addEventListener(
          "animationend",
          () => {
            key.classList.remove("is-restrike");
            void key.offsetWidth;
            key.classList.add("is-floating");
          },
          { once: true },
        );
        return;
      }

      key.classList.add("is-lit", "is-press");
      key.addEventListener(
        "animationend",
        () => {
          key.classList.remove("is-press");
          key.classList.add("is-floating");
        },
        { once: true },
      );
    };

    let cardsShown = false;
    const showCards = () => {
      if (cardsShown) return;
      cardsShown = true;
      setRevealed(true);
    };

    /**
     * Is the board actually being watched? Half of it on screen is the line.
     *
     * The whole reason for holding the cards back is that the keyboard is
     * telling them where they came from. Someone who never sees the keyboard is
     * not being told anything — they are looking at an empty panel.
     */
    const boardIsWatched = () => {
      if (!board) return false;
      const rect = board.getBoundingClientRect();
      if (!rect.height) return false;
      const onScreen =
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      return onScreen / rect.height >= 0.5;
    };

    /**
     * The emptied board collapses, and the cards — and everything below the
     * section — rise into the space it was holding.
     *
     * THIS ANIMATES `height`, WHICH THIS PROJECT OTHERWISE BANS. The ban is
     * real and it is written down; this is the one place it is worth paying,
     * and the reason is that the alternative was measurably worse.
     *
     * The previous version translated the GRID up by the board's height —
     * compositor-only, no layout — and then removed the board from the flow on
     * the last frame while cancelling the transform, so the two changes
     * cancelled out. They cancel out FOR THE GRID. They do not cancel out for
     * anything BELOW the section: the panel loses the board's height in one
     * frame, and How We Work, the testimonials and the footer all snap upward.
     * Measured: a 327px jump, every time.
     *
     * A transform cannot fix that, because the content below has to actually
     * MOVE UP in the document — that is a layout change by definition, and the
     * only question is whether it happens over 560ms or in a single frame.
     *
     * The ban exists because of `group-hover:w-14`, which re-ran layout on
     * every frame of every hover, indefinitely. This runs once per page load
     * and the board's own subtree is trivial — the cost is repositioning the
     * blocks below, not re-laying-out the cards, whose widths never change.
     */
    const collapseBoard = () => {
      if (!board) return;

      const height = board.offsetHeight;
      if (!height) return;

      // Clip while it shrinks, or the keys overflow the closing box.
      board.style.overflow = "hidden";

      const shrink = board.animate(
        [{ height: `${height}px` }, { height: "0px" }],
        {
          duration: 560,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        },
      );

      shrink.finished
        .then(() => {
          // HELD AT ZERO, NOT REMOVED — and `display: none` here would undo the
          // whole point. A zero-height sibling still SEPARATES the wrapper's
          // margin from the grid's, so taking it out of the flow lets
          // `mt-12` and `mt-10` collapse into one and the page below loses
          // another 40px in a single frame. Measured: the collapse was smooth
          // and then jumped 40px at the very end, for exactly this reason.
          //
          // The board is aria-hidden and clipped to nothing, so leaving it in
          // costs a few hidden nodes and keeps the layout perfectly still.
          // The inline height holds it, so the animation object can go.
          board.style.height = "0px";
          shrink.cancel();
        })
        // `finished` rejects if an unmount cancels it.
        .catch(() => {});
    };

    const run = () => {
      // ARRIVED BELOW THE BOARD? THEN THERE IS NOTHING TO WAIT FOR. Landing
      // mid-section — a deep link, a fast scroll, a restored scroll position —
      // put the keyboard off screen above and left the reader staring at ~600px
      // of empty panel for the two seconds it takes to type a word they cannot
      // see. The hold only earns its cost when the thing it is holding for is
      // actually on screen.
      if (!boardIsWatched()) showCards();

      caret?.classList.add("is-blinking");

      [...WORD].forEach((letter, index) => {
        // A flat interval types like a machine. A few milliseconds either side
        // is the difference between a metronome and a hand — seeded per index
        // rather than randomly, so the rhythm is identical on every run.
        const drift = ((index * 37) % 11) - 5;
        after(START_MS + index * STEP_MS + drift, () => {
          // THE KEY IS UPPERCASE, THE READOUT IS NOT. Keycaps are engraved in
          // capitals and a real keyboard still types lowercase — so the strike
          // looks up `letter` while the readout renders "Arcompsol", which is
          // how the heading spells it. Typing "ARCOMPSOL" into a heading that
          // reads "Arcompsol" makes the hand-off a substitution rather than a
          // move, however well the two are aligned.
          if (word) {
            // A SPAN PER LETTER, not a textContent append. The span is what
            // lets the glyph arrive with the keystroke instead of landing fully
            // formed on one frame — see .kbd-letter in globals.css.
            const glyph = document.createElement("span");
            glyph.className = "kbd-letter";
            glyph.textContent = index === 0 ? letter : letter.toLowerCase();
            word.appendChild(glyph);
          }
          strike(letter);
        });
      });

      after(ENTER_AT_MS, () => {
        caret?.classList.remove("is-blinking");

        // A KEYSTROKE, NOT A STRIKE. Enter gets neither `is-lit` nor
        // `is-press` — those belong to the letter keys, which stay up and green
        // because staying up is how they spell the word. Enter is a command: it
        // goes down, darkens, loses its side wall and comes back, and it is
        // still a plain key when it is done. See `.kbd-enter.is-tapped`.
        keyFor("ENTER")?.classList.add("is-tapped");
      });

      // The board goes as one, the moment the keystroke lands.
      after(ENTER_AT_MS + EXIT_AFTER_ENTER_MS, () =>
        board?.classList.add("is-exiting"),
      );
      // The typed word lifts out of the fading board and into the heading.
      after(ENTER_AT_MS + HANDOFF_AFTER_ENTER_MS, handOffWord);
      // Only now the cards — the board has emptied and given the word away.
      after(ENTER_AT_MS + REVEAL_AFTER_ENTER_MS, showCards);
      // And the space the board was holding is handed to them.
      after(ENTER_AT_MS + COLLAPSE_AFTER_ENTER_MS, collapseBoard);
    };

    // Same margins as <Reveal>, so this band arrives on the same cue as every
    // other one rather than on a rule of its own.
    const margins = { rootMargin: "0px 0px -12% 0px", threshold: 0.05 };

    /**
     * THE SEQUENCE WAITS FOR THE SCROLL TO STOP, AND THAT IS A MEASURED FIX.
     *
     * Starting the moment the band intersects put the first keystrokes into
     * the middle of an active scroll, competing with everything the scroll is
     * already doing on the main thread — the reveal observers firing down the
     * page, card images decoding, the honeycomb repainting. Measured on a real
     * scroll-triggered run, the second keystroke landed at 237ms instead of
     * 145ms: a 92ms stall on the site's signature animation, and precisely the
     * moment it is most visible, because a viewer's eye is still settling.
     *
     * The timers are absolute (`after()` schedules from one origin), so a
     * stalled callback does not push the rest back — the third keystroke was
     * already back on schedule. That is why this reads as one hitch rather
     * than a slow sequence, and why the fix is to move the START, not to
     * re-time the steps.
     *
     * QUIET_MS is the wait after the last scroll event. DEADLINE_MS is the cap,
     * and it is not optional: someone scrolling slowly and continuously past
     * the band would otherwise never see the sequence start at all, and would
     * meet an empty board where the cards should be.
     */
    const QUIET_MS = 120;
    const DEADLINE_MS = 700;

    let started = false;
    const runWhenScrollSettles = () => {
      let idle = 0;
      const fire = () => {
        window.clearTimeout(idle);
        window.clearTimeout(deadline);
        window.removeEventListener("scroll", bump);
        run();
      };
      const bump = () => {
        window.clearTimeout(idle);
        idle = window.setTimeout(fire, QUIET_MS);
        timers.push(idle);
      };
      const deadline = window.setTimeout(fire, DEADLINE_MS);
      timers.push(deadline);

      // passive: this listener must never be able to delay the scroll it is
      // waiting on.
      window.addEventListener("scroll", bump, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", bump));
      bump();
    };

    const typing = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      started = true;
      runWhenScrollSettles();
      typing.disconnect();
    }, margins);
    typing.observe(wrap);

    /**
     * The other half of the same rule: someone who starts at the top and then
     * scrolls PAST the keyboard while it is still typing has also stopped
     * watching it, and would otherwise arrive at the same empty panel. The board
     * dropping below half-visible releases the cards immediately.
     *
     * Guarded on `started`, because before the section is reached the board is
     * off screen at ratio 0 and this would fire on page load.
     */
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!started || entry.intersectionRatio >= 0.5) return;
        showCards();
        watcher.disconnect();
      },
      { threshold: [0, 0.5, 1] },
    );
    if (board) watcher.observe(board);

    /**
     * THE CARDS ARE HELD UNTIL ENTER — BUT ONLY FOR SOMEONE WATCHING.
     *
     * The hold exists so the cards read as the answer to the keystroke, and
     * showing them while the name is still being typed gives that away. But the
     * cards keep their layout space while hidden, so the hold spends up to ~2.2s
     * of empty panel to buy it — and that is only worth spending on a reader who
     * can see the keyboard. Two checks release it early, both above:
     *
     *   run()     — arrived below the board, so it was never on screen
     *   watcher   — scrolled past the board mid-sequence
     *
     * Enter from the top and nothing changes; come at the cards any other way
     * and they are simply there. Do not remove either check without looking at
     * the section on a phone first.
     */

    return () => {
      typing.disconnect();
      watcher.disconnect();
      // Navigating away mid-sequence would otherwise keep firing timers at a
      // component that no longer exists.
      for (const timer of timers) window.clearTimeout(timer);
      // And the scroll listener outlives every one of them if the band is
      // never reached, so it is torn down by hand rather than by a timeout.
      for (const off of cleanups) off();
    };
  }, []);

  return (
    <div ref={wrapRef} data-pop={revealed ? "shown" : ""} className="mt-12">
      {/* An animation OF a keyboard, not a keyboard. Nothing here is typeable,
          so it takes no tab stop and is hidden from assistive tech entirely —
          the heading it feeds already carries the word in the accessibility
          tree. */}
      <div data-kbd aria-hidden className="kbd">
        <p data-kbd-readout className="kbd-readout">
          <span data-kbd-word className="kbd-word" />
          <span data-kbd-caret className="kbd-caret" />
        </p>

        <div className="kbd-rows">
          {ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="kbd-row">
              {row.map((char, colIndex) => (
                <span
                  key={char}
                  data-kbd-key={WORD.includes(char) ? char : undefined}
                  className="kbd-key"
                  // Drives the per-key delay on the idle float, the dissolve
                  // and the clear, so none of the three moves as one block.
                  style={
                    { "--i": rowIndex * 10 + colIndex } as React.CSSProperties
                  }
                >
                  {char}
                </span>
              ))}
            </div>
          ))}
          <div className="kbd-row">
            <span data-kbd-key="ENTER" className="kbd-key kbd-enter">
              Enter
            </span>
          </div>
        </div>
      </div>

      {/* A <ul>, like the values, qualities and openings grids. The list is
          what carries the count — "6 services" — which is otherwise only
          available to someone who can see the grid.

          The arrival does NOT depend on this structure: `.pop-item` is reached
          by a descendant selector (`[data-pop] .pop-item` in globals.css) and
          the cards are revealed by a plain opacity/transform transition, so
          nothing here measures a child offset. The one real constraint is the
          list's own: <li> must be a DIRECT child of the <ul>, so do not wrap
          the items — a wrapper leaves the list with zero items. */}
      <ul
        data-services-grid
        className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {SERVICES.map((service, index) => (
          <li
            key={service.title}
            // h-full so the flip container inherits a real height from the grid
            // row. Both card faces are absolutely positioned, so a wrapper of
            // auto height would collapse them.
            className="pop-item h-full"
            // 60ms — the same step <Reveal delay={index * 60}> uses on the
            // values, qualities and openings grids. A card set that staggers
            // differently from every other card set on the site is what makes a
            // page read as assembled from parts.
            style={{ "--pop-delay": `${index * 60}ms` } as React.CSSProperties}
          >
            <ServiceCard
              title={service.title}
              description={service.description}
              image={service.image}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
