/**
 * The contact form's shape, validated identically on the client and the server.
 *
 * ── IN SIMPLE WORDS ──
 * One description of what a valid enquiry looks like. The form uses it to show
 * errors as you type; the API route uses the same object to decide whether to
 * send an email at all.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * The original validated only in the browser — ~60 hand-written lines in the
 * footer — and its API handler destructured req.body and passed the values
 * straight into an outbound message with no checks whatsoever. Anything that
 * can POST JSON (curl, a script, a bot) could put arbitrary content into mail
 * sent from the company address. Client-side validation is a convenience for
 * users; it is not a control, because the client is fully under the caller's
 * control.
 *
 * Sharing this module is what keeps the two in step. Two hand-maintained copies
 * drift, and the drift is invisible until the server rejects something the form
 * accepted.
 *
 * ── BUSINESS RULES ──
 * - All five fields are required; this mirrors the original validateForm().
 * - Mobile is validated with libphonenumber, so a country code is mandatory.
 * - Max lengths are new. They are the difference between a spam bot sending a
 *   500-character message and a 50,000-character one.
 *
 * ── DO NOT ──
 * - Do not relax this on the server "because the form already checks". The form
 *   is not in the request path when someone posts directly.
 */
// libphonenumber-js, NOT react-phone-number-input. This module is imported by
// the API route, and pulling the React wrapper in there drags a browser UI
// package into the server bundle — which fails the build outright with
// "Super expression must either be null or a function" at collect-page-data.
// The wrapper only re-exports this function anyway; the form still uses the
// wrapper for its input UI.
import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(200),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .refine(isValidPhoneNumber, "Please enter a valid phone number with country code"),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  body: z.string().trim().min(1, "Message is required").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
