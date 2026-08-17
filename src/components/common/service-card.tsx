"use client";

/**
 * A service tile that flips to show what the service actually is.
 *
 * ── IN SIMPLE WORDS ──
 * Front is the icon and the name. Click it and the card turns over to show a
 * sentence about what that service involves. Click again to turn it back.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * WHERE IT FLIPS, THE ROOT IS A REAL <button> — never a div with an onClick.
 * That single choice supplies, for free, everything a hover-driven or
 * div-driven version has to rebuild by hand: Enter and Space activate it, it
 * takes a tab stop in document order, a screen reader announces it as a control
 * rather than as text, and a tap works on a phone. A div needs tabIndex, an
 * onKeyDown for two separate keys, and role="button" to reach the same place,
 * and typically ships with one of them missing.
 *
 * WHERE IT DOES NOT FLIP, THE ROOT IS A PLAIN <div>, and that is the same
 * principle rather than an exception to it. Below lg both faces are in normal
 * flow and the description is already on screen, so there is nothing to reveal.
 * Rendering a <button> there anyway — which this did — gave every phone six tab
 * stops that announce as buttons and do nothing when pressed. An element type
 * is a promise about behaviour; the card makes it only where it can keep it.
 *
 * aria-expanded is what makes the state audible. Without it a screen-reader
 * user hears a button, presses it, and gets no confirmation that anything
 * happened — the rotation is purely visual.
 *
 * The FRONT face is aria-hidden. The back carries both the title and the
 * description, so exposing both would announce every service name twice; and
 * because the back stays in the accessibility tree at all times, a screen
 * reader gets the full description without having to press anything.
 *
 * Both faces are absolutely positioned, so the CONTAINER carries the height —
 * hence min-h-76. Drop it and the tiles collapse to nothing in a single-column
 * grid, where the row is sized by its content.
 *
 * 76 (304px) comes from measuring every description, cloned into a box at each
 * column width the grid actually produces, in a real browser. Do not estimate
 * this from character counts: that method said 268px where the browser said
 * 287px, an error of most of a line.
 *
 *      column   worst card    needs
 *      262px    AI and ML     271px   <- 640px viewport, 2 columns. The binding
 *      279px    AI and ML     248px      case, and it is NOT the narrowest
 *      280px    AI and ML     248px      column: the 2-col grid at 640 is
 *      302px    Web Dev       225px      tighter than the 1-col grid at 375.
 *      323px    Web Dev       225px
 *
 * The predecessor, min-h-64 (256px), clipped the last line of four of the six
 * services at every width below 1280px, silently, because the faces are
 * overflow-hidden. Re-measure if the copy grows.
 *
 * There is deliberately NO icon or label announcing that the card is clickable.
 * The affordance is the cursor and the hover lift only. That is a real trade —
 * a card that is not a link and not shaped like a control does not announce
 * itself, and some visitors will never flip one — so the front face has to
 * stand on its own, and the description has to be an addition rather than the
 * point. Do not move essential information to the back.
 *
 * HOVER on a mouse, TAP on a touch screen, FOCUS on a keyboard — all three set
 * the same `flipped` state. Routing every input through one piece of state is
 * what makes hover safe here: a naive CSS `:hover` flip leaves the description
 * unreachable on a phone, so hover is gated on `(hover: hover) and
 * (pointer: fine)` and touch keeps the tap.
 *
 * That single state is also why `aria-expanded` stays honest. If CSS read
 * `:hover` directly, the card would look open while telling a screen reader it
 * was closed.
 *
 * ── DO NOT ──
 * - Do not implement the hover in CSS with `.flip:hover`. It would desync
 *   `aria-expanded` and would also fire on a touch tap, fighting the click
 *   handler.
 * - Do not let click toggle on hover-capable devices; the pointer handlers
 *   already own the state there.
 * - Do not make the flipping card a div with a role. Where the card flips it
 *   must stay a real <button>: that is what makes Enter and Space work, puts it
 *   in the tab order, and gets it announced as a control. A div needs tabIndex,
 *   role and a two-key onKeyDown to reach the same place.
 * - Do not make the non-flipping card a button "for consistency". It has no
 *   action below lg; a control that does nothing when pressed is worse than no
 *   control, and there are six of them on the narrowest screen.
 * - Do not put the focus ring on a face. The faces rotate away from the
 *   viewer; the ring belongs on the container that stays put.
 */
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Shared chrome, so the two faces read as the same object mid-rotation.
 *
 * SOLID, not frosted glass. This was `bg-white/25` with `backdrop-blur-xl` over
 * the services panel — a 25%-white card on a ground that was itself 96% white.
 * A translucent card needs something worth seeing through to, and there was
 * nothing behind it, so six cards read as one pale area with text on it rather
 * than as six objects. Opaque --surface on the tinted panel inverts that: the
 * card is the light object, the band is the ground, and each tile has an edge.
 *
 * Vertical padding is NOT shared. The front holds an icon and two words and
 * wants air; the back holds a 139-character paragraph and needs the room. They
 * had the same py-8 and the back was within 1px of clipping at 640px.
 */
const FACE = cn(
  "overflow-hidden rounded-2xl border-border bg-surface",
  "shadow-[0_1px_2px_rgb(var(--shadow-tint)/0.05),0_10px_28px_rgb(var(--shadow-tint)/0.07)]",
  // THE SHADOW MOVES WITH THE CARD. The lift used to be a transform on its own
  // against a shadow that never changed, so the tile slid upwards while its
  // shadow stayed the same size — which reads as the card sliding rather than
  // rising. Deepening and spreading the shadow as it lifts is what supplies the
  // height. The border warms toward brand at the same time so the tile under
  // the cursor is identifiable at a glance in a grid of six.
  //
  // 220ms, NOT THE 500 THIS USED TO BE. Hover feedback is a RESPONSE, and a
  // response is judged on how quickly it acknowledges you, not on how smoothly
  // it finishes — half a second to answer a cursor reads as the page thinking
  // about it. The site's arrival easing is right for content coming in and
  // wrong here; this needs a plain ease-out that starts immediately.
  "transition-[box-shadow,border-color] duration-220 ease-out",
  "group-hover:border-brand/30",
  "group-hover:shadow-[0_2px_4px_rgb(var(--shadow-tint)/0.06),0_18px_44px_rgb(var(--shadow-tint)/0.13)]",
  // Pressed: the card settles back onto the panel and the shadow collapses
  // under it. Without this a tap on a phone produced no acknowledgement at all
  // until the flip resolved — and below lg there is no flip, so it produced
  // none ever.
  "group-active:shadow-[0_1px_2px_rgb(var(--shadow-tint)/0.08),0_4px_10px_rgb(var(--shadow-tint)/0.10)]",
  "group-active:border-brand/40 group-active:duration-75",
);

export function ServiceCard({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: StaticImageData;
}) {
  const [flipped, setFlipped] = useState(false);

  /**
   * Whether this device has a real hover state. Read in the handlers, never
   * during render, and set after mount so the server and client agree on the
   * first paint.
   */
  const canHover = useRef(false);

  /**
   * Whether the flip exists at all. Below lg the card shows both title and
   * description in normal flow, so there is nothing to flip and nothing to
   * expand — the handlers must not fire and `aria-expanded` must not be
   * announced, or the card claims a state it does not have.
   *
   * State, not a ref, because it gates rendered output. It starts false so the
   * server and the first client paint agree, then a listener keeps it correct
   * across resize and orientation change.
   */
  const [canFlip, setCanFlip] = useState(false);
  useEffect(() => {
    canHover.current = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const lg = window.matchMedia("(min-width: 64rem)");
    const sync = () => setCanFlip(lg.matches);
    sync();
    lg.addEventListener("change", sync);
    return () => lg.removeEventListener("change", sync);
  }, []);

  /**
   * Shared by both roots below, so the card's contents exist in one place
   * regardless of which element wraps them.
   */
  const shell = cn(
    "flip group h-full w-full rounded-2xl text-left lg:min-h-76",
    // Matched to the shadow in FACE — same 220ms, same ease-out — so the lift
    // and the shadow that gives it height move as one thing. Pressing puts the
    // card back down: on a touch screen that is the ONLY feedback a tap gets
    // below lg, where there is no flip and no hover.
    "transition-transform duration-220 ease-out",
    "hover:-translate-y-1.5 active:translate-y-0 active:duration-75",
  );

  const inner = (
    <div className="flip-inner">
      {/* aria-hidden ONLY at lg, where the back face carries the same title
            and the real description. Below lg this is the only copy of the
            content and hiding it would empty the card for a screen reader. */}
      <Card
        aria-hidden={canFlip || undefined}
        className={cn("flip-face flip-front items-center py-5 lg:py-8", FACE)}
      >
        {/* A ROW on a phone, the centred column at lg. Stacked and centred, the
              front face costs 324px per card — a 96px icon, py-8 and gap-6 —
              which is 2.3 screens for six services. As a row with a 48px icon
              it reads as a list item and costs about a third of that. */}
        <CardContent className="flex h-full flex-row items-start gap-4 px-5 lg:flex-col lg:items-center lg:justify-center lg:gap-6 lg:px-6">
          {/* `fill` inside a fixed box, NOT width={60} height={60}. These six
                source images range from 0.90 to 1.87 in aspect ratio, so
                declaring a square is a lie about five of them: Tailwind's
                preflight (`img { height: auto }`) then recomputes the height
                from the stated width, which is exactly the "width or height
                modified, but not the other" warning. With `fill` the intrinsic
                size is irrelevant and object-contain letterboxes each icon. */}
          <div className="relative size-12 shrink-0 lg:size-24">
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 1024px) 48px, 96px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-1.5 lg:items-center lg:gap-0">
            <p className="text-base leading-snug font-medium text-ink lg:text-center lg:text-lg">
              {title}
            </p>
            {/* The same short brand rule the benefits cards, the milestone
                  steps and the 404 tiles use — this grid was the one card set
                  on the site without it. It also gives the front face something
                  that responds to the cursor before the flip commits.

                  lg only: below that the face is a row with the description
                  under the title, and a rule between them separates two things
                  that belong together. */}
            <span
              aria-hidden
              className="mt-3 hidden h-0.5 w-8 rounded-full bg-gradient-to-r from-brand to-brand-deep transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-150 lg:block"
            />
            {/* Below lg this IS the content — there is no back face to tap
                through to, so the description is simply shown. Hidden at lg,
                where the flip owns it. */}
            <p className="text-sm leading-relaxed text-ink-muted lg:hidden">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "hidden flip-face flip-back items-start py-6 lg:flex",
          FACE,
        )}
      >
        <CardContent className="flex h-full flex-col justify-center gap-3 px-6">
          <div className="relative size-10 shrink-0">
            <Image
              src={image}
              alt=""
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>
          <p className="text-base leading-snug font-semibold text-ink">
            {title}
          </p>
          <p className="text-sm leading-relaxed text-ink-soft">{description}</p>
        </CardContent>
      </Card>
    </div>
  );

  /**
   * A CONTROL ONLY WHERE THERE IS SOMETHING TO CONTROL.
   *
   * Below lg the card does not flip: both faces are in normal flow and the
   * description is already on screen, so there is nothing to reveal. This used
   * to render a <button> at every width anyway — which meant that on every
   * phone, six cards took a tab stop each and announced themselves as buttons
   * that did nothing when pressed. A control that promises an interaction it
   * does not have is worse than no control.
   *
   * So the element type follows the behaviour. `canFlip` starts false, so the
   * server and the first client paint agree on the <div>; at lg it becomes a
   * real <button> after mount, which is what brings Enter and Space, the tab
   * stop, and the announcement as a control — all the things the DO NOT below
   * exists to protect.
   */
  if (!canFlip) {
    return <div className={shell}>{inner}</div>;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onPointerEnter={() => canHover.current && setFlipped(true)}
      onPointerLeave={() => canHover.current && setFlipped(false)}
      // Only where hover does not exist. On a mouse the pointer handlers own
      // the state, and letting a click toggle it too leaves the card stuck
      // showing its back after the cursor moves away.
      onClick={() => {
        if (!canHover.current) setFlipped((current) => !current);
      }}
      // :focus-visible, not plain focus — a mouse click also focuses the
      // button, and reacting to that would fight the pointer handlers.
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) setFlipped(true);
      }}
      onBlur={() => setFlipped(false)}
      aria-expanded={flipped}
      data-flipped={flipped}
      // aria-haspopup="false" IS LOAD-BEARING, and it is not decoration.
      // The Button base carries `active:not-aria-[haspopup]:translate-y-px`,
      // which compiles to `:active:not([aria-haspopup])` — HIGHER SPECIFICITY
      // than this card's own `active:translate-y-0`, so it would win and the
      // card would press 1px DOWN instead of settling back to rest from its
      // hover lift. Declaring the attribute takes this element out of that
      // selector. The value is also simply true: a flip card opens no popup.
      aria-haspopup="false"
      className={cn(
        shell,
        // ── NEUTRALISING A LABEL-SHAPED PRIMITIVE ──
        // Button is built for "Send message". This is a 304px card holding a
        // paragraph, so six of the base's defaults have to be undone. Every one
        // of these is corrective; none is a style choice:
        //   block           base is inline-flex, which centres and shrink-wraps
        //   whitespace-normal  base is nowrap — it would put the description
        //                      on one line and overflow the card
        //   font-normal     base is font-medium, and the description sets no
        //                   weight of its own, so it would inherit 500
        //   p-0 / h-full    the size variant adds padding and a fixed height
        //   hover:bg-transparent  `ghost` fills on hover; the faces are opaque
        //                         at lg but this is visible below it
        // What is gained in exchange: focus-ring and cursor-pointer, which used
        // to be restated here, plus the disabled handling and the data-slot
        // hooks. Converted on review, 2026-08-17.
        "block h-full w-full p-0 font-normal whitespace-normal hover:bg-transparent",
      )}
    >
      {inner}
    </Button>
  );
}
