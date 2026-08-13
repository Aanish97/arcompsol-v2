/**
 * The 1200x630 card that renders whenever this site's link is pasted anywhere.
 *
 * ── IN SIMPLE WORDS ──
 * When someone drops arcompsol.com into Slack, WhatsApp, LinkedIn or a DM, this
 * is the picture that appears under it. It is drawn at build time from the real
 * logo, the real brand font and the real client list, so it can never drift out
 * of sync with a hand-exported PNG that someone forgot to update.
 *
 * ── BUSINESS RULES ──
 * - Leads with client names, not services. Enquiries here arrive by referral —
 *   someone forwarding the link — so the card is seen by a person who has just
 *   been told "these people are good" and is looking for confirmation.
 * - Names are reproduced exactly as the clients gave them in
 *   content/testimonials.ts. Do not abbreviate or restyle them.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * Colours are HEX LITERALS, which is the one place in this codebase that is
 * allowed. Satori (the renderer behind ImageResponse) resolves no CSS custom
 * properties, so `var(--brand-navy)` here would silently render as nothing and
 * you would ship a transparent card. Each literal below names the token it
 * mirrors — if globals.css changes, change these by hand.
 *
 * Dark ground on purpose. Feed backgrounds in Slack and LinkedIn are white or
 * near-white, so a light card dissolves into the surrounding chrome and a dark
 * one is bounded. This is also the only ground where the logo green is legible
 * as a text colour: #38B089 measures 6.10:1 on #16211C and 2.59:1 on paper.
 *
 * The font is read off disk rather than fetched. A build that reaches out to a
 * CDN fails in CI the first time the network is unavailable, and the fallback
 * is not a missing font — it is a card with different metrics and wrapped text.
 * Poppins-SemiBold.ttf lives in src/assets/fonts for exactly this reason and is
 * the ONLY Poppins file still in the repo; the 3 MB public/fonts directory was
 * deleted because next/font/google self-hosts the web copies. Do not delete it.
 *
 * Layout is flex-only and every container declares `display: flex`. Satori
 * implements a subset of CSS and throws on a multi-child node without it.
 *
 * ── DO NOT ──
 * - Do not add a `twitter-image` file. X falls back to og:image when no
 *   twitter:image is present, so a second file would only be a second thing to
 *   keep in sync. layout.tsx sets `twitter.card` and nothing else.
 * - Do not set `runtime = "edge"`. The font read uses node:fs.
 * - Do not use gradients, filters, or background-clip here. Satori either
 *   ignores them or fails the build, and neither shows up until someone shares
 *   a link.
 */
/* impeccable-disable broken-image -- file-level, and it has to be: the only
   <img> here takes a data: URI built from logo-white.png at build time, which
   the detector cannot resolve through a variable. A -next-line waiver would
   have to sit between the eslint-disable-next-line and the tag, which would
   point eslint's waiver at a comment instead of the element. Verified: the
   rendered card shows the logo. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { CLIENTS } from "@/content/clients";

export const alt =
  "Arcompsol — a software studio building products for Linux Foundation, ModMed and Surmount AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Mirrors of globals.css tokens. See the doc-block: Satori cannot read vars. */
const NAVY = "#16211C"; // --brand-navy
const GREEN = "#38B089"; // --brand-on-dark, 6.10:1 on NAVY
const PAPER = "#F4F7F5"; // headline, near-white with the same green bias
const MUTED = "#8FA69B"; // client row

export default async function OpengraphImage() {
  const [poppins, logo] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Poppins-SemiBold.ttf")),
    readFile(join(process.cwd(), "public/images/logo-white.png")),
  ]);

  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: NAVY,
        padding: "68px 76px",
        fontFamily: "Poppins",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori
              renders raw <img> only; next/image does not exist in this runtime. */}
        <img src={logoSrc} alt="" width={58} height={64} />
        <div style={{ display: "flex", fontSize: 40, color: PAPER }}>
          Arcompsol
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 78,
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
            color: PAPER,
          }}
        >
          Power your business
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 78,
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
            color: GREEN,
          }}
        >
          with innovation
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            display: "flex",
            width: 72,
            height: 4,
            backgroundColor: GREEN,
          }}
        />
        <div style={{ display: "flex", fontSize: 26, color: MUTED }}>
          {CLIENTS.map((client) => client.name).join("   ·   ")}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Poppins", data: poppins, weight: 600, style: "normal" }],
    },
  );
}
