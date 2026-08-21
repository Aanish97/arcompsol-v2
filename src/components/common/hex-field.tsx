/**
 * The honeycomb field behind "How We Work".
 *
 * ── IN SIMPLE WORDS ──
 * A field of hexagons drifting slowly downwards behind the process timeline,
 * with scattered cells quietly lighting up and fading again. It covers the whole
 * band — including the part behind the headings and the step copy — but it is
 * dimmed sharply where it runs under text, so it is a texture there and a
 * pattern only out in the margins.
 *
 * ── BUSINESS RULES ──
 * - Decoration, and nothing else. `aria-hidden` and no text, so a screen reader
 *   never meets it. Requested by the owner on 2026-08-13 for this section
 *   specifically; see DESIGN.md before reusing it anywhere on the site.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * A SERVER COMPONENT with no "use client" and no JavaScript at all. The whole
 * thing is one inline SVG plus a handful of CSS rules, so it costs zero bytes
 * of bundle and cannot delay hydration. Milestones stays a server component
 * because of it.
 *
 * TWO TONES, because the section renders on two grounds and one colour cannot
 * serve both — the same problem `--brand` / `--brand-on-dark` exists to solve.
 * On the paper band the lines are `--brand`, which DARKENS the paper; a lighter
 * line would be mathematically absent on an L* 95.7 surface. On the navy band
 * they are `--brand-on-dark`, the logo green, which is the one ground it works
 * on. Both are set as CSS custom properties by the tone class in globals.css —
 * no colour is named in this file.
 *
 * ONE LATTICE PATTERN plus TWO PULSE PATTERNS, all sharing the same lattice
 * geometry. The pulse patterns hold a handful of FILLED cells each and fade in
 * and out, which is what makes the field read as alive rather than as
 * wallpaper. Doing it with patterns rather than with individually placed
 * hexagons is what keeps every lit cell exactly on the lattice at every
 * viewport width, with no measurement and no resize listener.
 *
 * THE TWO PULSE LAYERS ARE MISMATCHED ON EVERY AXIS, and that is what stops the
 * field reading as wallpaper: different tile sizes (3×3 against 4×5 lattice
 * steps), co-prime periods (9s against 11s, so the pair repeats every 99s
 * rather than every 4.5s), and different peak opacities (1 against 0.65, so
 * they read as a near layer and a far one). Every one of those is a single
 * number and none of them costs a frame. See PULSE_LAYERS below and the pulse
 * rules in globals.css.
 *
 * A travelling-wave version was built and dropped (2026-08-13, owner's call).
 * If it is ever wanted back, the one thing worth carrying over: its wave had to
 * be a CSS mask on a rendered element, because an animation on an element
 * inside <defs> NEVER ADVANCES in Chrome — measured, playState "running" with
 * currentTime pinned at 0. Do not put an animated element in <defs>.
 *
 * ── DO NOT ──
 * - Do not put a cell on a pattern-tile EDGE. A tile clips its own content, and
 *   the neighbouring tile draws the same cell at its own origin rather than the
 *   missing half — so an edge cell renders as a sliced hexagon. Every centre
 *   below is at least RADIUS from all four tile edges; keep it that way.
 * - Do not remove the dimming in globals.css. The field runs under running copy
 *   now, and that mask is the whole reason it can.
 * - Do not raise the tint percentages without re-measuring. The copy on the navy
 *   band is white/60, which is the tightest pairing in the section.
 */
import { cn } from "@/lib/utils";

/**
 * The lattice, in SVG user units (= CSS px).
 *
 * Flat-top hexagons on a 32px side. SPACING and ROW are the distances between
 * neighbouring centres — 3·side across and side·√3 down — which is what makes
 * the tile repeat seamlessly. RADIUS is the hexagon actually DRAWN, deliberately
 * 5px short of the 32 it is spaced on, so neighbours never share an edge: two
 * coincident strokes at the same alpha double up and print a darker line.
 *
 * The cell is large on purpose. These lines are held at low alpha so they never
 * compete with the copy, and a small hexagon at low alpha reads as noise rather
 * than as a shape — the size is what lets it stay quiet AND stay legible.
 */
const SPACING = 96; // 3 × 32
const ROW = 55.43; // 32 × √3
const RADIUS = 27; // drawn hexagon; 32 would touch its neighbour
const RISE = 23.38; // RADIUS × √3/2 — the flat side's half-height

/** One flat-top hexagon, centred. */
function hex(cx: number, cy: number) {
  return [
    `M${cx + RADIUS},${cy}`,
    `L${cx + RADIUS / 2},${cy + RISE}`,
    `L${cx - RADIUS / 2},${cy + RISE}`,
    `L${cx - RADIUS},${cy}`,
    `L${cx - RADIUS / 2},${cy - RISE}`,
    `L${cx + RADIUS / 2},${cy - RISE}`,
    "Z",
  ].join(" ");
}

/**
 * One tile of the lattice: the four corners plus the offset centre. The corners
 * are each drawn in full and clipped by the tile, and the neighbouring tiles
 * supply the halves that fall outside — which is why all four have to be here
 * and not just one.
 */
const LATTICE_TILE = [
  [0, 0],
  [0, ROW],
  [SPACING, 0],
  [SPACING, ROW],
  [SPACING / 2, ROW / 2],
];

/**
 * The cells that light up. Every centre is a real lattice position — either
 * `n·SPACING, m·ROW` or the offset row `n·SPACING + SPACING/2, m·ROW + ROW/2` —
 * so the lit cells land exactly on drawn hexagons rather than between them. The
 * test is that x/SPACING and y/ROW share a fractional part: both whole, or both
 * ·5. Mix them and the cell floats off the lattice.
 *
 * TWO groups, and they are DELIBERATELY DIFFERENT SIZES — 3×3 lattice steps and
 * 4×5. That is the whole point of this shape.
 *
 * Both were 3×3 (288×166.29), which meant they tiled in lockstep: measured at a
 * 1920 band, 6.7 identical copies across, with the second group reinforcing the
 * first group's grid instead of breaking it up. The field read as wallpaper with
 * a repeat you could find. At 288 and 384 the combined arrangement only repeats
 * every LCM(288, 384) = 1152px — 1.7 times across the same band instead of 6.7.
 *
 * It costs NOTHING: same two <pattern> elements, same two <rect> fills, same two
 * animations. Only the tile dimensions and the cell list changed. This is why a
 * third group is not the answer to "it looks repetitive" — the previous attempt
 * at more variety added a fourth permanently-running animation and was reverted
 * for it. Do not add one back.
 *
 * Group 2 is sparser per unit area than group 1 on purpose (1 cell per ~11.8k
 * px² against ~16k): its tile is 2.2× the area, and it also peaks lower, so
 * matching group 1's density would have made the larger tile the dominant layer
 * rather than the counter-rhythm.
 *
 * ── DO NOT put a cell within RADIUS of a tile edge ──
 * A tile clips its own content and the neighbour redraws from its own origin,
 * so an edge cell renders as a sliced hexagon. Every centre below clears all
 * four edges by at least RADIUS (27) — the tightest are 27.715, which is the
 * offset row's half-step and the closest any lattice position can legally sit.
 */
const PULSE_LAYERS = [
  {
    /** Tile size, in lattice steps. */
    cols: 3,
    rows: 3,
    cells: [
      [SPACING / 2, ROW / 2],
      [2 * SPACING, ROW],
      [1.5 * SPACING, 2.5 * ROW],
    ],
  },
  {
    cols: 4,
    rows: 5,
    cells: [
      [0.5 * SPACING, 1.5 * ROW],
      [2 * SPACING, 1 * ROW],
      [3.5 * SPACING, 0.5 * ROW],
      [1 * SPACING, 3 * ROW],
      [2.5 * SPACING, 2.5 * ROW],
      [1.5 * SPACING, 3.5 * ROW],
      [3 * SPACING, 4 * ROW],
      [0.5 * SPACING, 4.5 * ROW],
      [3.5 * SPACING, 3.5 * ROW],
    ],
  },
];

export function HexField({ tone }: { tone: "light" | "dark" }) {
  // Ids are scoped by tone rather than generated. useId() is a hook and this is
  // a server component; the two tones never share a page, and two fields of the
  // same tone would resolve to identical geometry anyway.
  const id = `hexfield-${tone}`;

  return (
    <div
      aria-hidden
      className={cn(
        "hexfield",
        tone === "dark" ? "hexfield-dark" : "hexfield-light",
      )}
    >
      <svg className="hexfield-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={`${id}-lattice`}
            width={SPACING}
            height={ROW}
            patternUnits="userSpaceOnUse"
          >
            <path
              className="hexfield-line"
              d={LATTICE_TILE.map(([x, y]) => hex(x, y)).join(" ")}
            />
          </pattern>

          {PULSE_LAYERS.map((layer, index) => (
            <pattern
              key={index}
              id={`${id}-pulse-${index}`}
              // Per-layer, NOT a shared constant. Two tile sizes is the reason
              // the field stops repeating on a findable grid — see PULSE_LAYERS.
              width={layer.cols * SPACING}
              height={layer.rows * ROW}
              patternUnits="userSpaceOnUse"
            >
              <path
                className="hexfield-cell"
                d={layer.cells.map(([x, y]) => hex(x, y)).join(" ")}
              />
            </pattern>
          ))}
        </defs>

        {/* Every plane is taller than the band and hung above it, so the
            downward drift never drags an empty edge into view. The <svg> root
            clips to its own viewport, so the overhang costs nothing. */}
        <g className="hexfield-drift">
          <rect
            x="0"
            y="-20%"
            width="100%"
            height="140%"
            fill={`url(#${id}-lattice)`}
          />
          {PULSE_LAYERS.map((_, index) => (
            <rect
              key={index}
              className={`hexfield-pulse hexfield-pulse-${index + 1}`}
              x="0"
              y="-20%"
              width="100%"
              height="140%"
              fill={`url(#${id}-pulse-${index})`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
