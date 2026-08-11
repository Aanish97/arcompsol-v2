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

const SUPPORT_ADDRESS = "support@arcompsol.com";

/** Neutralises HTML so a submission cannot inject markup into the email. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(name: string, mobile: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Contact Form Submission</title>
<style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f6f6; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  h3 { color: #333333; }
  p { margin-bottom: 10px; line-height: 1.5; }
</style>
</head>
<body>
  <div class="container">
    <h3><strong>Name:</strong> ${escapeHtml(name)}</h3>
    <h3><strong>Mobile:</strong> ${escapeHtml(mobile)}</h3>
    <h3>Message:</h3>
    <p>${escapeHtml(body).replace(/\n/g, "<br>")}</p>
    <p>Thank you for your interest!</p>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
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
      "content-type": "text/html; charset=utf-8",
      text: buildEmailHtml(name, mobile, body),
      from: SUPPORT_ADDRESS,
      to: [SUPPORT_ADDRESS, email],
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
