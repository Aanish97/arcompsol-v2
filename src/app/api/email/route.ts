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
const SANS =
  "'Helvetica Neue',Helvetica,Arial,sans-serif"; /* impeccable-disable-line overused-font -- HTML email. Web fonts do not load in Outlook or Gmail; this is the closest safe stack to the site's grotesque. */
const SERIF = "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif";
const MONO = "'SF Mono',Menlo,Consolas,'Courier New',monospace";

/** One labelled line of metadata. Mono label above, value below. */
const META = (label: string, value: string, href?: string) => `
              <tr>
                <td style="padding:0 0 3px 0;font-family:${MONO};font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#8b8b85;">${label}</td>
              </tr>
              <tr>
                <td style="padding:0 0 20px 0;font-family:${SANS};font-size:15px;line-height:22px;color:#2f3437;">${
                  href
                    ? `<a href="${href}" style="color:#1f5f4b;text-decoration:none;border-bottom:1px solid #cfdcd6;">${value}</a>`
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
<body style="margin:0;padding:0;background-color:#f7f6f3;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${safe.subject} &ndash; from ${safe.name}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f7f6f3;padding:40px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #eaeae6;border-radius:12px;">

        <tr>
          <td style="padding:32px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:${MONO};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#1f5f4b;">Arcompsol</td>
                <td align="right" style="font-family:${MONO};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8b8b85;">New enquiry</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:26px 40px 0 40px;">
            <p style="margin:0;font-family:${SERIF};font-size:28px;line-height:34px;letter-spacing:-0.02em;color:#111111;">${safe.subject}</p>
            <p style="margin:10px 0 0 0;font-family:${SANS};font-size:15px;line-height:22px;color:#787774;">from ${safe.name}</p>
          </td>
        </tr>

        <tr><td style="padding:28px 40px 0 40px;"><div style="height:1px;background-color:#eaeae6;font-size:0;line-height:0;">&nbsp;</div></td></tr>

        <tr>
          <td style="padding:26px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${META("Email", safe.email, `mailto:${encodeURIComponent(email)}`)}
              ${META("Mobile", safe.mobile, `tel:${mobile.replace(/[^+\d]/g, "")}`)}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:10px 40px 8px 40px;">
            <p style="margin:0 0 14px 0;font-family:${MONO};font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#8b8b85;">Message</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="2" style="width:2px;background-color:#1f5f4b;font-size:0;line-height:0;">&nbsp;</td>
                <td style="padding:2px 0 2px 20px;font-family:${SANS};font-size:16px;line-height:26px;color:#2f3437;">${safe.body}</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="padding:30px 40px 0 40px;"><div style="height:1px;background-color:#eaeae6;font-size:0;line-height:0;">&nbsp;</div></td></tr>

        <tr>
          <td style="padding:18px 40px 32px 40px;font-family:${MONO};font-size:10px;line-height:17px;letter-spacing:0.04em;color:#a3a39c;text-transform:uppercase;">
            Contact form &middot; arcompsol.com<br>
            <span style="text-transform:none;letter-spacing:0;font-family:${SANS};font-size:12px;color:#8b8b85;">Reply to this message and it goes to ${safe.name}.</span>
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
