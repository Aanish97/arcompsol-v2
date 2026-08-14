/**
 * POST /api/email — sends a contact-form enquiry over SMTP.
 *
 * ── IN SIMPLE WORDS ──
 * The footer form posts here. This checks the submission is real, then emails
 * it to the support inbox and copies the sender.
 *
 * ── BUSINESS RULES ──
 * - Mail is sent from support@arcompsol.com and delivered to that inbox plus
 *   the person who filled the form, so they have a copy of what they sent.
 * - Additional recipients come from CONTACT_CC (comma-separated). They were
 *   two personal Gmail addresses hardcoded in the original handler; who gets
 *   copied is an operational decision, not a code change.
 * - The subject line is "<their subject> - Contact Form Submission".
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
 * - Goes to the business AND to the submitter, so the wording has to read
 *   sensibly to both. Nothing here may say "you" to one of them.
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
  return `New enquiry from the Arcompsol website

Name:    ${name}
Email:   ${email}
Mobile:  ${mobile}
Subject: ${subject}

Message:
${body}

--
Sent from the contact form at arcompsol.com`;
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
<title>New enquiry</title>
</head>
<body style="margin:0;padding:0;background-color:${C.surfaceAlt};">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${safe.subject} &ndash; from ${safe.name}</div>

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
                <td align="right" style="font-family:${MONO};font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${C.onDarkMuted};">New enquiry</td>
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
            <p style="margin:10px 0 0 0;font-family:${SANS};font-size:15px;line-height:22px;color:${C.inkMuted};">from ${safe.name}</p>
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
                  Reply to this message and it goes to ${safe.name}.
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
 * Best-effort rate limit: 5 sends per IP per 10 minutes.
 *
 * ── WHY THIS EXISTS ──
 * This is an UNAUTHENTICATED endpoint that makes an outbound email on demand.
 * Without a limit, a loop against it burns the mailbox's daily send quota — at
 * which point the real enquiries stop arriving too — and every message is
 * delivered to an address the caller supplies, which is the shape of an open
 * relay. The limit is the difference between abuse being annoying and abuse
 * taking the contact channel offline.
 *
 * ── KNOW ITS LIMITS BEFORE TRUSTING IT ──
 * In-memory, so it is PER SERVER INSTANCE. On a platform that runs several
 * instances or scales to zero, an attacker gets the allowance once per
 * instance and a restart clears it. It stops casual abuse and accidental
 * double-posting; it is NOT a defence against a determined flood. Put a real
 * limiter (an edge rule, or a shared store) in front of this if that matters.
 *
 * The map is pruned on write, so it cannot grow without bound from one-off
 * callers — a long-lived instance would otherwise keep every IP that ever
 * posted.
 */
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT.windowMs;

  for (const [key, times] of hits) {
    const live = times.filter((t) => t > cutoff);
    if (live.length) hits.set(key, live);
    else hits.delete(key);
  }

  const mine = hits.get(ip) ?? [];
  if (mine.length >= RATE_LIMIT.max) return true;
  hits.set(ip, [...mine, now]);
  return false;
}

export async function POST(request: Request) {
  // x-forwarded-for is set by the proxy in front of this; its FIRST entry is
  // the client. Falling back to a shared bucket rather than to "no limit"
  // means a missing header cannot be used to bypass the check.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
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

  const client = new SMTPClient({
    user,
    password,
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    ssl: true,
  });

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
      // The submitter is copied deliberately — the template thanks them, so it
      // doubles as their receipt.
      to: [inboxFor(user), email],
      // Replying to an enquiry should reach the PERSON, not the mailbox that
      // sent it. Without this, hitting reply in Gmail addresses yourself.
      "reply-to": email,
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
