"use client";

/**
 * A service tile that flips on click to show what the service actually is.
 *
 * ── IN SIMPLE WORDS ──
 * Front is the icon and the name. Click it and the card turns over to show a
 * sentence about what that service involves. Click again to turn it back.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The root element is a real <button>, not a div with an onClick. That single
 * choice supplies, for free, everything a hover-driven or div-driven version
 * has to rebuild by hand: Enter and Space activate it, it takes a tab stop in
 * document order, a screen reader announces it as a control rather than as
 * text, and a tap works on a phone. A div needs tabIndex, an onKeyDown for two
 * separate keys, and role="button" to reach the same place, and typically ships
 * with one of them missing.
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
 * ── DO NOT ──
 * - Do not go back to flipping on hover. A phone has no hover: the description
 *   became unreachable there, which is why the previous version needed a
 *   separate (hover: none) branch in globals.css just to stay usable.
 * - Do not swap the root <button> for a div. It is the element type, not a
 *   visible button — it is what makes Enter and Space work, puts the card in
 *   the tab order, and gets it announced as a control. A div needs tabIndex,
 *   role and a two-key onKeyDown to reach the same place.
 * - Do not put the focus ring on a face. The faces rotate away from the
 *   viewer; the ring belongs on the container that stays put.
 */
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";

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

  return (
    <button
      type="button"
      onClick={() => setFlipped((current) => !current)}
      aria-expanded={flipped}
      data-flipped={flipped}
      className={cn(
        "flip group h-full min-h-76 w-full cursor-pointer rounded-2xl text-left",
        "transition-transform duration-300 hover:-translate-y-2",
        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      <div className="flip-inner">
        <Card aria-hidden className={cn("flip-face flip-front items-center py-8", FACE)}>
          <CardContent className="flex h-full flex-col items-center justify-center gap-6 px-6">
            {/* `fill` inside a fixed box, NOT width={60} height={60}. These six
                source images range from 0.90 to 1.87 in aspect ratio, so
                declaring a square is a lie about five of them: Tailwind's
                preflight (`img { height: auto }`) then recomputes the height
                from the stated width, which is exactly the "width or height
                modified, but not the other" warning. With `fill` the intrinsic
                size is irrelevant and object-contain letterboxes each icon. */}
            <div className="relative size-24">
              <Image
                src={image}
                alt=""
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
            <p className="text-center text-lg leading-snug font-medium text-ink">
              {title}
            </p>
          </CardContent>
        </Card>

        <Card className={cn("flip-face flip-back items-start py-6", FACE)}>
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
            <p className="text-sm leading-relaxed text-ink-soft">
              {description}
            </p>
          </CardContent>
        </Card>
      </div>
    </button>
  );
}
