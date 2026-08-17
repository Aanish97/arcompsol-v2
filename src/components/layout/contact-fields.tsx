"use client";

/**
 * The contact form's field primitives: the shared input chrome, the labelled
 * field wrapper, the group caption, and the message counter.
 *
 * ── IN SIMPLE WORDS ──
 * The parts every box on the enquiry form is built from. They sit here rather
 * than inside the form so that file reads as the form itself rather than as
 * the machinery underneath it.
 *
 * ── BUSINESS RULES ──
 * - Every field on the contact form is required (see lib/contact-schema.ts), so
 *   `Field` hard-codes `aria-required` rather than taking it as a prop. If a
 *   field is ever made optional, that becomes a prop in the same change — do
 *   not leave it asserting something the schema no longer says.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * SPLIT OUT OF contact-form.tsx ON REVIEW, 2026-08-17, which had reached 517
 * lines. The seam is real rather than arbitrary: nothing in this file knows
 * what the contact form asks for, and the form no longer carries the
 * definition of what a field IS.
 *
 * THIS IS NOT A SHARED FORM KIT, and must not be grown into one on spec. There
 * is exactly one form on this site — no other `<form>`, `useForm` or
 * `zodResolver` exists anywhere in src/ — so anything generalised here would be
 * generalised against a single caller. If a second form ever arrives, THAT is
 * the moment to decide what is genuinely common between them.
 *
 * ── DO NOT ──
 * - Do not move `FIELD` out of this file without updating the comment in
 *   globals.css that names it. The autofill block restates FIELD's ring values
 *   as the raw properties they compile to and cannot import them; that pointer
 *   is the only thing keeping the two in step.
 */
import { useId } from "react";
import { useWatch, type Control } from "react-hook-form";

import { type ContactInput } from "@/lib/contact-schema";
import { cn } from "@/lib/utils";

/**
 * Fields sit on the navy panel, so they are lifted out of it rather than drawn
 * on it.
 *
 * USED BY THE PHONE WRAPPER TOO, which is why this is exported rather than
 * living beside the four ordinary inputs. `phone-field.tsx` puts it on the
 * react-phone-number-input WRAPPER — a <div> — which is why that file has to
 * restate the focus and error rules as `focus-within` and an explicit invalid
 * branch. See the note there before changing anything here.
 */
export const FIELD = cn(
  "h-11 rounded-xl border-night-line bg-night-field px-4 text-on-dark placeholder:text-on-dark-muted/70",
  "transition-colors focus-visible:border-brand focus-visible:ring-brand/30",
  "aria-invalid:border-danger-on-dark/70 aria-invalid:ring-danger-on-dark/25",
);

/**
 * One labelled field: caption, control, and its error message.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * THE ERROR LIVES OUTSIDE THE <label>, and the control is tied to the label by
 * id rather than by being wrapped in it. Both matter, and the earlier version
 * got both wrong by putting everything inside one <label>:
 *
 * An accessible name is the label's whole text content, so an error rendered
 * inside the label was CONCATENATED INTO THE FIELD'S NAME. Measured on the
 * live page: with an error showing, the name field announced as
 * "NamePlease enter your name" — the error became part of what the field is
 * called, not a description of what went wrong, and it stayed that way for
 * every later focus.
 *
 * `role="alert"` is what actually announces the error the moment it appears.
 * Without it a screen-reader user submits, hears nothing, and is left with a
 * form that silently refused. `aria-describedby` is the other half: it ties
 * the message to the control so it is read again on any later focus. One
 * without the other covers only half the journey.
 *
 * A RENDER PROP, not `children`, because those ids have to reach the real
 * input element — and one of the five controls is a third-party PhoneInput
 * that needs them forwarded through its own prop. Passing plain children left
 * no way to hand them down without cloneElement guesswork.
 *
 * ── DO NOT ──
 * - Do not move the error back inside the <label>. See the measured name above.
 * - Do not drop `aria-required`. Every field in contactSchema is required, and
 *   without it that is discoverable only by failing a submit.
 */
export function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: (props: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid": boolean;
    "aria-required": true;
  }) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className="text-xs font-medium tracking-wide text-on-dark-muted"
      >
        {label}
      </label>
      {children({
        id,
        "aria-describedby": error ? errorId : undefined,
        "aria-invalid": !!error,
        "aria-required": true,
      })}
      {error && (
        // `field-error` is the entrance, and it lives in globals.css so its
        // hidden first frame can sit inside `prefers-reduced-motion` — the same
        // gate every other appearance on this site uses. A failed submit mounts
        // up to five of these at once; without it they are simply, silently,
        // already there, which is the one thing an alert must not be.
        <span
          id={errorId}
          role="alert"
          className="field-error text-xs text-danger-on-dark"
        >
          {error}
        </span>
      )}
    </div>
  );
}

/** The uppercase caption over each half of the form. */
export function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.18em] text-brand-on-dark uppercase">
      {children}
    </p>
  );
}

/** Mirrors contactSchema's `body.max()`. Both must move together. */
export const BODY_MAX = 5000;

/**
 * Live character count for the message, shown only near the limit.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * ITS OWN COMPONENT, subscribing with useWatch. Calling `watch("body")` in
 * ContactForm would re-render the entire form on every keystroke — the exact
 * regression that file's header describes escaping when it dropped five
 * useState values. Only this <p> re-renders now.
 *
 * Hidden until 90% of the limit. A counter on an empty box is pressure; a
 * counter at 4,500 characters is information. Nobody writing a normal enquiry
 * ever sees it.
 *
 * It exists because `maxLength` alone TRUNCATES SILENTLY: paste 6,000
 * characters and the last 1,000 vanish with no indication. The cap stops the
 * overrun, this explains it.
 */
export function BodyCounter({ control }: { control: Control<ContactInput> }) {
  const value = useWatch({ control, name: "body" }) ?? "";
  if (value.length < BODY_MAX * 0.9) return null;

  return (
    <p
      // polite, not assertive: it updates on every keystroke near the limit
      // and must not interrupt what is being typed.
      aria-live="polite"
      className="text-xs tabular-nums text-on-dark-muted"
    >
      {value.length.toLocaleString()} / {BODY_MAX.toLocaleString()} characters
    </p>
  );
}
