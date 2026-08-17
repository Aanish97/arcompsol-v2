/**
 * POST /api/email — sends a contact-form enquiry over SMTP.
 *
 * ── IN SIMPLE WORDS ──
 * The footer form posts here. This checks the submission is real, then emails
 * it to the support inbox and copies the sender.
 *
 * ── BUSINESS RULES ──
 * - NO ADDRESS IS WRITTEN IN THIS FILE. Mail is sent FROM `SMTP_EMAIL`, and
 *   delivered TO `CONTACT_TO` — or back to `SMTP_EMAIL` when that is unset.
 *   Both come from the environment, so moving mailboxes is configuration and
 *   never a code change. See `inboxFor` below for why `from` must be the
 *   authenticated account specifically.
 * - IT GOES TO THE BUSINESS ONLY. The person who filled the form is NOT
 *   copied; the recipient list takes nothing from user input. That is a
 *   security property rather than a preference — see the note on `to:`.
 * - Additional recipients come from CONTACT_CC (comma-separated). They were
 *   two personal Gmail addresses hardcoded in the original handler; who gets
 *   copied is an operational decision, not a code change.
 * - The subject line is "<their subject> - Contact Form Submission".
 *
 *   THESE TWO RULES WERE BOTH STALE, found in review 2026-08-17. The first said
 *   "sent from support@arcompsol.com" — a hardcoded address removed long
 *   enough ago that a note further down this same file already explained its
 *   removal, so one file stated one rule two ways ten lines apart. The second
 *   still promised the submitter a copy, which had been taken out the same day.
 *   A header that restates what the code does is worth having only if it is
 *   changed in the same commit as the code; treat it as part of the diff.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * Every field is validated HERE, against the same zod schema the form uses.
 * The original destructured req.body and passed the values directly into the
 * outbound email with no validation at all — so anything able to POST JSON
 * could send arbitrary content from the company's own address. Browser-side
 * checks are a convenience for users; they are not a control, because nothing
 * forces a caller to use the browser.
 *
 * Body text is escaped before it reaches the HTML template. Without that, a
 * submission containing markup is rendered as markup in whatever mail client
 * opens it.
 *
 * Missing SMTP configuration fails the request rather than silently doing
 * nothing: a form that reports success while sending no mail loses enquiries
 * with no trace anywhere.
 *
 * ── DO NOT ──
 * - Do not return `error.message` to the client. SMTP failures embed the host,
 *   the account, and sometimes the credential in their message text.
 * - Do not move validation back to the client only. See above.
 */
import { SMTPClient } from "emailjs";
import { NextResponse } from "next/server";

import { contactSchema } from "@/lib/contact-schema";

/**
 * WHO THE MAIL COMES FROM AND WHERE IT LANDS.
 *
 * ── WHY THIS IS NOT A CONSTANT ANY MORE ──
 * This was a hardcoded `support@arcompsol.com`, used as BOTH `from` and `to`.
 * As a `from` that is not merely untidy, it is a guaranteed send failure:
 * Gmail rejects any From address that is not the authenticated mailbox or a
 * verified "Send mail as" alias on it. Authenticate as anything else and every
 * enquiry bounces — with correct credentials.
 *
 * `from` is now SMTP_EMAIL, which is by definition the account being
 * authenticated, so the two can never disagree.
 *
 * `to` is CONTACT_TO, falling back to the sending account. Set it when
 * enquiries should land somewhere other than the mailbox doing the sending.
 */
const inboxFor = (sender: string) => process.env.CONTACT_TO?.trim() || sender;

/** Neutralises HTML so a submission cannot inject markup into the email. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * The enquiry email.
 *
 * ── IN SIMPLE WORDS ──
 * What lands in the inbox when someone submits the contact form. It carries
 * every field they filled in, with their email and phone as one-tap links, so
 * an enquiry can be acted on from the notification without opening the site.
 *
 * ── BUSINESS RULES ──
 * - ALL FIVE FIELDS APPEAR. The previous version passed only name, mobile and
 *   message, so the sender's own email address and their subject were nowhere
 *   in the body — you could read an enquiry and not know who wrote it.
 * - GOES TO THE BUSINESS ONLY, as of 2026-08-17. The submitter used to be
 *   copied; that was removed because the recipient list took a caller-supplied
 *   address, which is the exposure described on `to:` below. Read that before
 *   changing anything about who receives this.
 *
 *   THE WORDING IS STILL WRITTEN FOR TWO READERS, deliberately. Nothing here
 *   says "you", and no line assumes the reader is staff. That costs nothing
 *   now and means the template cannot become wrong by itself if a receipt is
 *   ever reinstated as a separate message.
 *
 *   KEPT BECAUSE OF HOW IT BROKE THE FIRST TIME. `709668c` shipped a "Thank you
 *   for your interest!" line that made this double as a receipt; `7fe4f2e` —
 *   titled "standardize code formatting and improve readability across
 *   components" — rewrote the template 142 to 375 lines and dropped it, while
 *   the comment on `to:` justifying the copy survived. For two commits the
 *   submitter received a mail headed NEW ENQUIRY, bylined "from <their own
 *   name>", closing "Reply to this message and it goes to <their own name>" —
 *   an internal staff notification about themselves. Found in review,
 *   2026-08-17. A formatting commit changed what a stranger receives, and
 *   nothing caught it for two commits.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * TABLES AND INLINE STYLES, which is not how the rest of this codebase is
 * written and is not negotiable here. Outlook renders mail with Word's engine:
 * no flexbox, no grid, and background colours on <div>s are unreliable. Gmail
 * strips <head><style> once a message is clipped, which takes a class-based
 * layout with it. Every rule that matters is therefore on the element.
 *
 * NO WEB FONTS AND NO IMAGES. Fonts do not load in Outlook or Gmail; remote
 * images are blocked by default in most clients, so a logo image would render
 * as a broken box for most recipients. The wordmark is text.
 *
 * The green rule down the left of the message block is the same device the
 * quote cards use on the site — the one piece of brand that survives an email
 * client intact.
 *
 * Every colour is written explicitly, including on the outermost table. A
 * client in dark mode composites over its own ground, and anything left
 * transparent inherits it and can end up dark text on dark.
 *
 * ── DO NOT ──
 * - Do not move these styles into a <style> block. See Gmail clipping above.
 * - Do not add a remote image or a web font. See above.
 * - Do not drop escapeHtml on any interpolated value. These are strings a
 *   stranger typed into a public form.
 */
/**
 * ONE FAMILY, NOT TWO. The subject used to be set in a serif stack (Iowan Old
 * Style / Palatino / Georgia) and it was the largest thing in the message —
 * which meant the element carrying the most visual weight was in a typeface
 * THIS BRAND DOES NOT OWN. DESIGN.md's Type section is unambiguous: Poppins for
 * headings, Open Sans for body, and no serif anywhere on the site. A reader who
 * knows the site got a letter from a different company.
 *
 * Neither real face can be used here — email loads no web fonts — so the
 * subject now takes the same grotesque stack as everything else, at 600 with
 * tighter tracking to hold its rank. Fewer stacks is also plainly better email
 * practice: every additional family is another chance for one client to pick a
 * fallback nobody previewed.
 */
const SANS =
  "'Helvetica Neue',Helvetica,Arial,sans-serif"; /* impeccable-disable-line overused-font -- HTML email. Web fonts do not load in Outlook or Gmail; this is the closest safe stack to the site's Poppins/Open Sans. */
const MONO = "'SF Mono',Menlo,Consolas,'Courier New',monospace";

/**
 * THE PALETTE, HAND-MIRRORED. Every value here is a copy of a token in
 * `globals.css`, and the key is the token it copies — DESIGN.md requires that
 * of this file, because the renderer resolves no custom properties and a bare
 * literal in the markup is a value nobody can trace back.
 *
 * WHEN THE PALETTE CHANGES, THIS BLOCK CHANGES BY HAND. It is the only copy of
 * those values outside `globals.css` and `opengraph-image.tsx`, and nothing
 * will tell you it has gone stale — an email simply starts arriving in last
 * season's colours.
 *
 * Four literals in the previous version belonged to no token at all: #f4f6f8
 * and #ffffff for the grounds, #68737e for every muted label, and #cbd8d2 under
 * the links. They were close enough to look deliberate and wrong enough that
 * the mail never actually matched the site.
 */
const C = {
  brand: "#1b5542", // --brand
  brandDeep: "#11362a", // --brand-deep
  brandDark: "#16241f", // --brand-dark
  brandNavy: "#111c1a", // --brand-navy
  ink: "#12181d", // --ink
  inkSoft: "#39424a", // --ink-soft
  inkMuted: "#5a646d", // --ink-muted
  surface: "#fafbfc", // --surface
  surfaceAlt: "#f0f3f6", // --surface-alt
  secondary: "#e4eaef", // --secondary
  border: "#d5dde4", // --border
  onDark: "#eef3f1", // --on-dark
  onDarkMuted: "#8c9a97", // --on-dark-muted
} as const;

/**
 * One field of the enquiry: mono label, then the value.
 *
 * The label sits on --secondary rather than on the card, so the two contact
 * facts read as one block instead of as four loose lines. --ink-muted on that
 * tint measures 5.15:1, which is why the label can be this small.
 */
const FIELD = (label: string, value: string, href?: string) => `
                <tr>
                  <td style="padding:0 0 4px 0;font-family:${MONO};font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${C.inkMuted};">${label}</td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px 0;font-family:${SANS};font-size:16px;line-height:22px;color:${C.inkSoft};">${
                    href
                      ? // Underlined in the brand at 40%, not in a hand-mixed
                        // grey. An <a> with no underline at all is the one thing
                        // a mail client will helpfully "fix" for you.
                        `<a href="${href}" style="color:${C.brand};text-decoration:none;border-bottom:1px solid ${C.border};">${value}</a>`
                      : value
                  }</td>
                </tr>`;

function buildEmailText(
  name: string,
  email: string,
  mobile: string,
  subject: string,
  body: string,
) {
  // A real plain-text part, not a fallback nobody reads: spam filters score
  // multipart mail with a text alternative better than HTML alone, and some
  // notification previews render this rather than the HTML.
  return `Enquiry sent through arcompsol.com

Name:    ${name}
Email:   ${email}
Mobile:  ${mobile}
Subject: ${subject}

Message:
${body}

--
Reply to this message and it goes to Arcompsol.
Contact form · arcompsol.com`;
}

function buildEmailHtml(
  name: string,
  email: string,
  mobile: string,
  subject: string,
  body: string,
) {
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    mobile: escapeHtml(mobile),
    subject: escapeHtml(subject),
    body: escapeHtml(body).replace(/\n/g, "<br>"),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>Enquiry</title>
</head>
<body style="margin:0;padding:0;background-color:${C.surfaceAlt};">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${safe.subject} &ndash; from ${safe.name}, via arcompsol.com</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.surfaceAlt};padding:40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${C.surface};border:1px solid ${C.border};border-radius:16px;overflow:hidden;">

        <!-- MASTHEAD. The dark band is the featured ValueCard's own device
             (bg-gradient-to-br from-brand-dark to-brand-navy) and it is the
             only strong brand moment an email can carry — a logo image would
             be blocked by default in most clients and arrive as a broken box,
             so the mark is set as text on a ground instead.
             background-color first, background-image second: Outlook ignores
             the gradient and keeps the navy, which is the intended fallback. -->
        <tr>
          <td style="padding:22px 32px;background-color:${C.brandNavy};background-image:linear-gradient(135deg,${C.brandDark} 0%,${C.brandNavy} 100%);">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:${SANS};font-size:17px;font-weight:bold;letter-spacing:-0.01em;color:${C.onDark};">Arcompsol</td>
                <!-- "Enquiry", not "New enquiry". "New" is triage language —
                     it means new TO THE BUSINESS, and the submitter gets this
                     mail too. See the second BUSINESS RULE above. -->
                <td align="right" style="font-family:${MONO};font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${C.onDarkMuted};">Enquiry</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- The subject is the headline and the name is its byline: 28px
             against 15px, so the inbox preview and the eye both land on what
             the enquiry is about before who sent it. -->
        <tr>
          <td style="padding:34px 40px 0 40px;">
            <p style="margin:0;font-family:${SANS};font-size:27px;line-height:34px;font-weight:600;letter-spacing:-0.02em;color:${C.ink};">${safe.subject}</p>
            <p style="margin:10px 0 0 0;font-family:${SANS};font-size:15px;line-height:22px;color:${C.inkMuted};">Sent by ${safe.name}</p>
          </td>
        </tr>

        <!-- THE MESSAGE COMES BEFORE THE CONTACT DETAILS, which is a change.
             The details were above it, so every enquiry opened with two lines
             of address book before it said anything. You read to decide whether
             to reply; you scroll back for the number once you have decided. -->
        <tr>
          <td style="padding:30px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <!-- 4px, --brand to --brand-deep, exactly the testimonial
                     card's rule (absolute inset-y-0 left-0 w-1 bg-gradient-to-b
                     from-brand to-brand-deep). It was 2px and flat here, so the
                     one device the site and the mail share did not match.
                     Outlook drops the gradient and keeps the solid brand. -->
                <td width="4" style="width:4px;background-color:${C.brand};background-image:linear-gradient(180deg,${C.brand} 0%,${C.brandDeep} 100%);font-size:0;line-height:0;">&nbsp;</td>
                <td style="padding:0 0 0 22px;font-family:${SANS};font-size:16px;line-height:27px;color:${C.inkSoft};">${safe.body}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- The two contact facts, grouped on --secondary so they read as one
             block rather than four stacked lines on the card ground. -->
        <tr>
          <td style="padding:30px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.secondary};border-radius:10px;">
              <tr>
                <td style="padding:22px 24px 4px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${FIELD("Email", safe.email, `mailto:${encodeURIComponent(email)}`)}
                    ${FIELD("Mobile", safe.mobile, `tel:${mobile.replace(/[^+\d]/g, "")}`)}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer on --surface-alt: a band rather than a hairline, so the
             message ends somewhere instead of trailing off. -->
        <tr>
          <td style="padding:32px 0 0 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.surfaceAlt};border-top:1px solid ${C.border};">
              <tr>
                <td style="padding:20px 40px;font-family:${SANS};font-size:13px;line-height:20px;color:${C.inkMuted};">
                  Reply to this message and it goes to Arcompsol.
                  <span style="display:block;margin-top:6px;font-family:${MONO};font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${C.inkMuted};">Contact form &middot; arcompsol.com</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/**
 * Best-effort rate limit: 5 SEND ATTEMPTS per IP per 10 minutes.
 *
 * ── WHY THIS EXISTS ──
 * This is an UNAUTHENTICATED endpoint that makes an outbound email on demand.
 * Without a limit, a loop against it burns the mailbox's daily send quota — at
 * which point the real enquiries stop arriving too — and every message is
 * delivered to an address the caller supplies, which is the shape of an open
 * relay. The limit is the difference between abuse being annoying and abuse
 * taking the contact channel offline.
 *
 * ── IT COUNTS SENDS, NOT REQUESTS, AND THAT IS THE WHOLE POINT ──
 * The read and the write are SEPARATE FUNCTIONS on purpose. They used to be one
 * `rateLimited(ip)` called at the top of the handler, which recorded a hit on
 * every request that reached it — before the JSON was parsed, before the schema
 * ran, before the SMTP config was even checked. Code review, 2026-08-17, caught
 * what that means for a person rather than an attacker:
 *
 *   - Five rejected validations and they are locked out for ten minutes. A
 *     mistyped email address four times over is not abuse.
 *   - Five 500s because SMTP is misconfigured and they are locked out for ten
 *     minutes ON TOP of a failure that was ours, not theirs — and the failure
 *     mode is invisible, because the form reports it as a rate limit.
 *
 * `recordSendAttempt` is therefore called at the point a send is ABOUT TO
 * HAPPEN, so a 400 and a "not configured" 500 cost the caller nothing.
 *
 * IT RECORDS THE ATTEMPT, NOT THE SUCCESS, and that distinction is deliberate.
 * Counting only successful sends reads as more generous and is a hole: anyone
 * who can reliably make `sendAsync` throw — a bad recipient domain, a
 * deliberately oversized payload — would get unlimited attempts against the
 * SMTP server. The scarce resource is the connection and the daily quota, and
 * a failed send has already spent one.
 *
 * ── KNOW ITS LIMITS BEFORE TRUSTING IT ──
 * In-memory, so it is PER SERVER INSTANCE. On a platform that runs several
 * instances or scales to zero, an attacker gets the allowance once per
 * instance and a restart clears it. It stops casual abuse and accidental
 * double-posting; it is NOT a defence against a determined flood.
 *
 * A CONSEQUENCE OF METERING SENDS: invalid requests are now UNMETERED. Posting
 * malformed JSON in a loop is refused every time and costs this handler a JSON
 * parse and a zod parse, but nothing throttles it. That is an accepted trade at
 * this scale — no mail is sent and no quota is consumed — and it is the same
 * sentence as before: put a real limiter (an edge rule, or a shared store) in
 * front of this if a determined flood matters.
 *
 * ── DO NOT ──
 * - Do not move `recordSendAttempt` back to the top of the handler. That is the
 *   bug above, and it presents to the person as a rate limit they did not earn.
 * - Do not make the read record anything. `overSendLimit` must stay side-effect
 *   free, or every rejected request extends its own lockout.
 */
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const hits = new Map<string, number[]>();

/** This IP's attempts still inside the window. */
function liveHits(ip: string, now: number) {
  const cutoff = now - RATE_LIMIT.windowMs;
  return (hits.get(ip) ?? []).filter((t) => t > cutoff);
}

/**
 * Has this IP used its allowance? READ ONLY — it records nothing.
 *
 * It filters by the window itself rather than relying on the prune in
 * `recordSendAttempt`. It has to: once an IP is over the limit it stops
 * reaching the write path entirely, so a read that trusted the stored array
 * would see a permanently full bucket and lock that caller out forever.
 */
function overSendLimit(ip: string) {
  return liveHits(ip, Date.now()).length >= RATE_LIMIT.max;
}

/** Spends one of this IP's five. Call once, immediately before a send. */
function recordSendAttempt(ip: string) {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT.windowMs;

  // Pruned on write, so the map cannot grow without bound from one-off callers
  // — a long-lived instance would otherwise keep every IP that ever posted.
  // Write is also the only path that ADDS an entry, so pruning here is enough
  // to bound it.
  for (const [key, times] of hits) {
    const live = times.filter((t) => t > cutoff);
    if (live.length) hits.set(key, live);
    else hits.delete(key);
  }

  hits.set(ip, [...liveHits(ip, now), now]);
}

export async function POST(request: Request) {
  // x-forwarded-for is set by the proxy in front of this; its FIRST entry is
  // the client. Falling back to a shared bucket rather than to "no limit"
  // means a missing header cannot be used to bypass the check.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // READ ONLY. The matching write is `recordSendAttempt(ip)` further down, at
  // the point a send actually happens — see the note on the limiter for why
  // the two are not one call any more.
  if (overSendLimit(ip)) {
    return NextResponse.json(
      { message: "Too many messages. Try again shortly." },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  /**
   * ── HONEYPOT ──
   * A field no human can see, tab to, or hear. `contact-form.tsx` renders it
   * `sr-only`, `aria-hidden`, `tabIndex={-1}`, `autoComplete="off"`. Anything
   * in it was put there by something filling every input it could find.
   *
   * IT ANSWERS 200, NOT 400, and that is the one deliberate lie in this file.
   * A rejection teaches a bot which field to leave alone and it is back in a
   * day; silence teaches it nothing. The `console.warn` is what keeps this from
   * being the silent-failure this codebase otherwise forbids — if a real person
   * ever trips it, the send is traceable in the log rather than gone.
   *
   * IT IS CHECKED BEFORE `recordSendAttempt`, so a bot cannot burn a real
   * visitor's allowance from a shared NAT address.
   *
   * KNOW WHAT IT IS NOT. This stops indiscriminate form-fillers, which is most
   * of the volume. It does NOT stop anyone who looks at the markup once — the
   * field is in the HTML and skipping it is a one-line change. It is a filter,
   * not a control. See the note on `to:` for the exposure it does not address.
   */
  const trap = (payload as { website?: unknown } | null)?.website;
  if (typeof trap === "string" && trap.trim() !== "") {
    console.warn(`[contact] honeypot tripped by ${ip} — discarded, not sent`);
    return NextResponse.json({ message: "Sent" });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { name, email, mobile, subject, body } = parsed.data;

  const user = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_TOKEN;
  if (!user || !password) {
    console.error("SMTP_EMAIL or SMTP_TOKEN missing — cannot send mail");
    return NextResponse.json(
      { message: "Email is not configured" },
      { status: 500 },
    );
  }

  const cc = (process.env.CONTACT_CC ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  // The mailbox that actually reads enquiries. Used as a recipient AND as the
  // reply-to, so the two can never disagree about where a reply lands.
  const inbox = inboxFor(user);

  const client = new SMTPClient({
    user,
    password,
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    ssl: true,
  });

  // THE ALLOWANCE IS SPENT HERE, and this line's position is the fix. Every
  // early return above it — bad JSON, a failed schema, missing SMTP config —
  // now costs the caller nothing, because none of them sends mail. From this
  // point a connection is made, so the attempt counts whether or not it
  // succeeds.
  recordSendAttempt(ip);

  try {
    await client.sendAsync({
      // MULTIPART, not HTML-in-the-text-field. `text` is a genuine plain-text
      // part and the HTML rides as an `alternative` attachment, which is
      // emailjs's documented way to build multipart/alternative. The previous
      // version put HTML into `text` with an html content-type: it rendered,
      // but produced a message with no text part at all — worse for spam
      // scoring and blank in a text-only client or a watch notification.
      text: buildEmailText(name, email, mobile, subject, body),
      attachment: [
        {
          data: buildEmailHtml(name, email, mobile, subject, body),
          alternative: true,
        },
      ],
      from: user,
      /**
       * ONE RECIPIENT, AND IT IS A FIXED ONE. Do not add a caller-supplied
       * address back to this array.
       *
       * ── WHAT THIS USED TO BE ──
       * `to: [inbox, email]`, where `email` is the address typed into the form.
       * The submitter got a copy, as their record of what they sent. That was
       * a real convenience and it is what was given up here.
       *
       * ── WHY IT HAD TO GO (owner's call, 2026-08-17) ──
       * Nobody has to use the form. Any unauthenticated POST supplies both the
       * recipient AND up to 5,000 characters of body, so that array let a
       * stranger send mail of their own composition, to an address of their
       * choosing, FROM THIS DOMAIN — passing SPF and DKIM, because it genuinely
       * is from this domain. The doc-block on the rate limiter calls that "the
       * shape of an open relay" and it was right.
       *
       * The rate limit does not address this and neither does the honeypot. A
       * limiter caps the volume; a honeypot filters the naive. Neither stops
       * one deliberate request, and one is all a phishing mail takes. The only
       * fix is the endpoint refusing to choose its recipient from user input,
       * which is this line.
       *
       * Worst case now: somebody fills this inbox with junk. That is a nuisance
       * with a delete key, not a mail sent AS Arcompsol to a client.
       *
       * ── IF A RECEIPT IS EVER WANTED ──
       * Send it as a SEPARATE message with fixed content — no name, no subject,
       * no body from the submission. The moment attacker-controlled text rides
       * to an attacker-controlled address, this is back, whatever the second
       * message is called. The form's on-screen toast is the acknowledgement
       * until then.
       */
      to: [inbox],
      // REPLIES GO TO ARCOMPSOL, NOT TO THE ENQUIRER — owner's call,
      // 2026-08-17, reversing what this line used to do.
      //
      // It was `email`, so the business could hit Reply and reach the person.
      // That is the action that happens daily and losing it is a real cost.
      // The reason it went anyway: this mail is delivered to BOTH parties and
      // there is only one reply-to header, so it can serve only one of them.
      // Pointed at the enquirer, the footer could never honestly tell them how
      // to follow up — their own Reply addressed themselves.
      //
      // THE BUSINESS KEEPS A ONE-TAP ROUTE TO THE PERSON: their address is a
      // mailto link in the contact block above. That is what makes this trade
      // affordable, so do not remove that link without revisiting this.
      "reply-to": inbox,
      ...(cc.length ? { cc } : {}),
      subject: `${subject} - Contact Form Submission`,
    });

    return NextResponse.json({ message: "Sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Error sending email" },
      { status: 500 },
    );
  }
}
