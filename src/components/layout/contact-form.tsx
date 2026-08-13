"use client";

/**
 * The enquiry form in the footer, on every page.
 *
 * ── IN SIMPLE WORDS ──
 * Two short groups — who you are, then what you need — instead of five
 * identical boxes in a column. Every field is labelled above itself, so the
 * label is still there after you have typed in it.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * Real <label>s, not placeholder-only fields. A placeholder disappears the
 * moment someone types, so anyone who pauses mid-form — or comes back to check
 * one entry before sending — is left reading their own answers with no idea
 * what was asked. It is also the only version a screen reader can announce.
 * The placeholders that remain are examples, which is the job placeholders are
 * actually good at.
 *
 * Name and email share a row. Five full-width boxes stacked vertically read as
 * a long form and are most of why this section felt like a generic contact
 * block; pairing the two shortest fields breaks the column and shortens the
 * form by a row.
 *
 * The grouping is not decorative. "Your details" and "Your project" tell you
 * how far through you are, and they are how the eye finds its place again after
 * looking away.
 *
 * react-hook-form keeps each input uncontrolled, so typing re-renders only the
 * field being typed in. The original held five useState values plus an errors
 * object, re-rendering the whole footer — form, link columns, logo — on every
 * keystroke.
 *
 * Validation comes from the shared zod schema, the same object the API route
 * uses. See lib/contact-schema.ts for why that sharing is load-bearing.
 *
 * ── DO NOT ──
 * - Do not clear the fields before the request resolves. On a failed send the
 *   person would have to retype everything, and this is the only way to contact
 *   the company on the site.
 * - Do not remove the disabled state while submitting. Double-submitting sends
 *   the enquiry twice and the recipient cannot tell duplicates apart.
 * - Do not go back to placeholder-as-label to save vertical space. See above.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useId } from "react";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT } from "@/content/site";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { cn } from "@/lib/utils";

import "react-phone-number-input/style.css";

/** Fields sit on the navy panel, so they are lifted out of it rather than drawn on it. */
const FIELD = cn(
  "h-11 rounded-xl border-white/12 bg-white/6 px-4 text-white placeholder:text-white/35",
  "transition-colors focus-visible:border-brand focus-visible:ring-brand/30",
  "aria-invalid:border-red-400/60 aria-invalid:ring-red-400/20",
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
function Field({
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
        className="text-xs font-medium tracking-wide text-white/55"
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
        <span id={errorId} role="alert" className="text-xs text-red-300">
          {error}
        </span>
      )}
    </div>
  );
}

/** Mirrors contactSchema's `body.max()`. Both must move together. */
const BODY_MAX = 5000;

/**
 * Live character count for the message, shown only near the limit.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * ITS OWN COMPONENT, subscribing with useWatch. Calling `watch("body")` in
 * ContactForm would re-render the entire form on every keystroke — the exact
 * regression the file's header describes escaping when it dropped five
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
function BodyCounter({ control }: { control: Control<ContactInput> }) {
  const value = useWatch({ control, name: "body" }) ?? "";
  if (value.length < BODY_MAX * 0.9) return null;

  return (
    <p
      // polite, not assertive: it updates on every keystroke near the limit
      // and must not interrupt what is being typed.
      aria-live="polite"
      className="text-xs tabular-nums text-white/55"
    >
      {value.length.toLocaleString()} / {BODY_MAX.toLocaleString()} characters
    </p>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.18em] text-brand-on-dark uppercase">
      {children}
    </p>
  );
}

export function ContactForm() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", mobile: "", subject: "", body: "" },
  });

  async function onSubmit(values: ContactInput) {
    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        // A HANG IS A FAILURE MODE OF ITS OWN. Without this, a request that
        // never resolves leaves the fieldset disabled and the button spinning
        // for as long as the tab is open, with no way to retry — worse than an
        // error, because it looks like progress. 15s is well past a normal
        // send and well short of the point someone gives up.
        signal: AbortSignal.timeout(15_000),
      });

      // fetch only rejects on a network failure — a 400 or 500 resolves
      // normally, so the status has to be checked explicitly or every failure
      // is reported to the person as a success.
      if (!response.ok) {
        // Distinguished because the RECOVERY differs: waiting helps a rate
        // limit and nothing else, and emailing directly is the only way past a
        // server fault. One generic message sends everyone down the wrong path.
        if (response.status === 429) {
          toast.error("Too many messages just now. Try again in a minute.");
          return;
        }
        throw new Error("Request failed");
      }

      toast.success("Message sent. We'll get back to you soon.");
      reset();
    } catch (error) {
      // A timeout or a dropped connection means the message may never have
      // reached the server; a 500 means it did and could not be sent. Telling
      // someone to "try again" is right for the first and wasted for the
      // second, so they do not share a message.
      const unreachable =
        error instanceof DOMException ||
        (error instanceof TypeError && error.message.includes("fetch"));

      // CONTACT.email, not a literal. This message is the fallback route when
      // the form itself is down, so an address that has quietly gone stale
      // here is the one place it does the most damage.
      toast.error(
        unreachable
          ? "Could not reach the server. Check your connection and try again."
          : `Message not sent. Try again, or email ${CONTACT.email}.`,
      );
    }
  }

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      // scroll-mt-20 because this is an ANCHOR TARGET, not decoration. Both
      // "Let's talk" buttons scrollIntoView() here, and the header is sticky
      // at 73px — without a scroll margin the form landed at y=0 and the
      // "Your details" label sat at y=33, behind the header. 80px matches the
      // scroll-mt-20 already on #services and the two careers anchors; keep
      // them equal, and above the header height on every breakpoint.
      className="w-full max-w-xl scroll-mt-20 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
    >
      <fieldset className="flex flex-col gap-4" disabled={isSubmitting}>
        <GroupLabel>Your details</GroupLabel>

        {/* Paired only where the FORM is wide enough. Between lg and xl this
            form sits in a half-width footer column, so two inputs would be
            about 190px each — the same breakpoint trap as the office grid. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            {/* NO placeholder. A placeholder earns its place by teaching a
                format the label cannot — "you@company.com" does that. A name
                has no format to teach, so the slot got filled with a real
                person's name instead ("Aneeq Ahmad"), which shipped to every
                visitor of a public contact form. Do not put a specimen name
                back here; if this ever needs a hint, it belongs in the label. */}
            {(a11y) => (
              <Input
                {...register("name")}
                {...a11y}
                // Matches contactSchema's .max(100). Without it the cap is
                // only discovered by being rejected after writing.
                maxLength={100}
                // WCAG 1.3.5. Also the difference between a filled form and
                // an abandoned one on a phone.
                autoComplete="name"
                className={FIELD}
              />
            )}
          </Field>

          <Field label="Email" error={errors.email?.message}>
            {(a11y) => (
              <Input
                {...register("email")}
                {...a11y}
                type="email"
                inputMode="email"
                maxLength={200}
                autoComplete="email"
                placeholder="you@company.com"
                className={FIELD}
              />
            )}
          </Field>
        </div>

        <Field label="Mobile" error={errors.mobile?.message}>
          {(a11y) => (
            <Controller
              control={control}
              name="mobile"
              render={({ field, fieldState }) => (
                <PhoneInput
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? "")}
                  onBlur={field.onBlur}
                  // A FORMAT MASK, not a number. This read "300 9442848" — the
                  // local part of CONTACT.phone, Arcompsol's own published line.
                  // A phone field is worth a placeholder because the format is
                  // genuinely unobvious; it is not worth a real number, which
                  // reads as a prefilled value rather than as a hint.
                  placeholder="3XX XXXXXXX"
                  // SELF-HOSTED FLAGS. The library defaults flagUrl to
                  // purecatamphetamine.github.io, so every visitor who reaches
                  // the footer — which is every visitor, it is on every page —
                  // silently fetches an image from a third-party GitHub Pages
                  // host. That is an uptime dependency the site does not control,
                  // a request that fails in any network that blocks it (a failed
                  // image logs a console error, which Lighthouse counts against
                  // Best Practices), and every visitor's IP handed to a host
                  // nobody chose.
                  //
                  // The SVGs ship with country-flag-icons, already in
                  // node_modules as a dependency of this library, and are copied
                  // into public/flags. Only the selected country's file is ever
                  // requested, so the 1.1MB directory costs one ~2KB fetch.
                  flagUrl="/flags/{XX}.svg"
                  defaultCountry="PK"
                  international
                  countryCallingCodeEditable={false}
                  // Forwarded onto the real <input> inside PhoneInput. The ids
                  // must land on the focusable control, not on the wrapper div,
                  // or the label points at nothing and the error is never read.
                  id={a11y.id}
                  numberInputProps={{
                    ...a11y,
                    "aria-invalid": fieldState.invalid,
                  }}
                  className={cn(
                    "flex items-center gap-3 border",
                    FIELD,

                    // FIELD's focus and error rules are written for a real
                    // <input>; this is a <div>, so focus-visible: and
                    // aria-invalid: on it can never match. Restated here as
                    // focus-WITHIN and an explicit invalid branch — without
                    // these the phone field was the only control on the form
                    // with no focus ring and no error state.
                    "focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/30",
                    fieldState.invalid &&
                      "border-red-400/60 ring-3 ring-red-400/20",

                    // The number input.
                    // min-h-11 on the INPUT itself. It rendered 24px tall inside
                    // a 44px box, so the touch target only met WCAG 2.5.5 by way
                    // of the surrounding <label> — restructure that label and the
                    // target silently becomes 24px. Stated here instead.
                    "[&_.PhoneInputInput]:min-h-11",
                    "[&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-white",
                    "[&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-white/35",
                    // min-w-0, or this row cannot shrink below 265px and drags the
                    // whole document sideways at 320px. A flex item defaults to
                    // `min-width: auto`, which on an <input> resolves to its
                    // intrinsic size from the `size` attribute — about 20
                    // characters — and no amount of w-full on an ancestor
                    // overrides it. This one declaration was setting the minimum
                    // width of the entire site: without it the document measures
                    // 339px on a 320px phone and EVERY page scrolls horizontally,
                    // because the footer is on every page.
                    "[&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:min-w-0",

                    // The country picker is a NATIVE <select> layered over the
                    // flag, and its dropdown is drawn by the OS on a white
                    // popup — but it inherits `color` from this wrapper, which
                    // is text-white. That is why the country names were white
                    // on white. Set on the select itself, and on the options,
                    // because browsers differ over which one the popup reads.
                    // The country select is an invisible native <select> laid over the flag, and
                    // it shipped at 34x42 — under the 44px minimum on both axes.
                    // Sizing the SELECT rather than the flag grows the hit area
                    // without changing anything visible.
                    "[&_.PhoneInputCountry]:min-h-11",
                    "[&_.PhoneInputCountrySelect]:min-h-11 [&_.PhoneInputCountrySelect]:min-w-11",
                    "[&_.PhoneInputCountrySelect]:text-ink",
                    "[&_.PhoneInputCountrySelect_option]:bg-surface",
                    "[&_.PhoneInputCountrySelect_option]:text-ink",

                    // The library's own defaults assume a light background: the
                    // flag border is rgba(0,0,0,0.5) and the arrow is
                    // currentColor at 0.45 — a dark line and a washed-out chevron
                    // on a navy panel.
                    "[--PhoneInputCountryFlag-borderColor:rgba(255,255,255,0.25)]",
                    "[--PhoneInputCountrySelectArrow-color:rgba(255,255,255,0.55)]",
                    "[--PhoneInputCountrySelectArrow-opacity:1]",
                    "[&_.PhoneInputCountryIcon]:shadow-none",
                    "[&_.PhoneInputCountry]:transition-opacity hover:[&_.PhoneInputCountry]:opacity-100",
                  )}
                />
              )}
            />
          )}
        </Field>
      </fieldset>

      <fieldset className="mt-8 flex flex-col gap-4" disabled={isSubmitting}>
        <GroupLabel>Your project</GroupLabel>

        <Field label="What you need" error={errors.subject?.message}>
          {(a11y) => (
            <Input
              {...register("subject")}
              {...a11y}
              maxLength={200}
              // "off", not a real autocomplete token: this is a free-text
              // project description, and guessing a token here would offer
              // the browser's saved values for an unrelated field.
              autoComplete="off"
              placeholder="A web app, a team, a second opinion…"
              className={FIELD}
            />
          )}
        </Field>

        <Field label="Tell us more" error={errors.body?.message}>
          {(a11y) => (
            <Textarea
              {...register("body")}
              {...a11y}
              rows={4}
              maxLength={BODY_MAX}
              autoComplete="off"
              placeholder="What are you building, and where are you stuck?"
              // field-sizing-fixed IS LOAD-BEARING, and it is not obvious.
              // shadcn's Textarea base carries `field-sizing-content`, which
              // sizes the control to its CONTENT — width as well as height —
              // and nothing caps it because max-width is `none`. A textarea's
              // content width is its longest unbroken run of characters, so
              // pasting a long URL, token or stack trace into the message
              // grows the textarea, and it drags the fieldset, the footer and
              // the whole document sideways with it. Measured before the fix:
              // a 1,220-character string took the document to 10,912px at
              // every viewport, and 5,000 characters took it to 49,028px.
              //
              // `fixed` is the CSS default; width comes from w-full and height
              // from rows/resize-y, both of which this already sets. min-w-0
              // does NOT help here — it was tried, it applies, and the control
              // still grows, because content sizing sets the preferred width
              // rather than the minimum. break-words wraps the run once the
              // box is constrained.
              className={cn(
                FIELD,
                "h-auto min-w-0 max-w-full resize-y py-3 break-words field-sizing-fixed",
              )}
            />
          )}
        </Field>
        <BodyCounter control={control} />
      </fieldset>

      <Button
        type="submit"
        variant="brand"
        size="brand"
        disabled={isSubmitting}
        className="group mt-8 w-full sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Sending
          </>
        ) : (
          <>
            Send message
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  );
}
