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
 * ── WHERE THE REST OF IT LIVES ──
 * Split on review, 2026-08-17, at 517 lines. Two files came out and the seams
 * are worth knowing, because both still have ties back here:
 *
 *   contact-fields.tsx  FIELD, Field, GroupLabel, BODY_MAX, BodyCounter — what
 *                       a field IS, with none of what this form asks for.
 *   phone-field.tsx     the whole mobile control. A third of this file's markup
 *                       for one of five fields, and all of it about one
 *                       library's defaults rather than about the enquiry.
 *
 * FIELD is exported from contact-fields.tsx rather than declared in either
 * consumer, because both use it: the four ordinary inputs put it on a real
 * <input> and the phone control puts it on a wrapper <div>. globals.css names
 * it in the autofill block and that pointer now points at contact-fields.tsx.
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
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  BODY_MAX,
  BodyCounter,
  FIELD,
  Field,
  GroupLabel,
} from "@/components/layout/contact-fields";
import { PhoneField } from "@/components/layout/phone-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT } from "@/content/site";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { cn } from "@/lib/utils";

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

  /**
   * The honeypot's value, read off the submitted FORM rather than through
   * react-hook-form or a ref.
   *
   * IT CANNOT GO THROUGH THE RESOLVER. zod strips keys the schema does not
   * declare, so a registered `website` would be parsed away before `values`
   * ever reached this function and the server would have nothing to check.
   * Adding it to contactSchema instead would put a decoy field in the object
   * the API route validates real enquiries against, which is worse.
   *
   * NOT A REF EITHER, and that is a lint rule rather than a preference:
   * `react-hooks/refs` rejects passing a ref-reading closure to `handleSubmit`,
   * because a function handed over during render may read `.current` during
   * render. `handleSubmit` already forwards the submit event, so the form
   * element is available without one — and reading the field off the form that
   * was actually submitted is more direct than reaching for the node by id.
   */
  async function onSubmit(
    values: ContactInput,
    event?: React.BaseSyntheticEvent,
  ) {
    const form = event?.target as HTMLFormElement | undefined;
    const trap =
      (form?.elements.namedItem("website") as HTMLInputElement | null)?.value ??
      "";

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: trap }),
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
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      // NO id, AND NO scroll-mt. Both moved to the wrapper in site-footer.tsx
      // on 2026-08-17. This element is inside a next/dynamic ssr:false chunk,
      // so an anchor on it is missing from every page's server HTML and absent
      // until hydration — which left "Let's talk" doing nothing for the first
      // second of every page view. An anchor has to be somewhere that always
      // exists. Do not put it back here.
      //
      // fields-on-dark repaints Chrome's autofill background, which is a
      // UA-origin colour that bg-* on the inputs cannot touch — see globals.css.
      // It sits on the FORM rather than on FIELD because the phone field's real
      // <input> belongs to react-phone-number-input and never gets FIELD.
      className="fields-on-dark w-full max-w-xl rounded-2xl border border-night-line bg-night-alt p-6 md:p-8"
    >
      {/* ── HONEYPOT ──────────────────────────────────────────────────────
          Not a field. A trap for anything that fills every input it finds,
          checked server-side in api/email/route.ts — read the note there for
          what it does and does not stop.

          FOUR ATTRIBUTES, ALL FOUR REQUIRED, and each closes a different way
          in. `sr-only` takes it off screen without `display:none`, which some
          bots skip. `aria-hidden` keeps it out of the accessibility tree, so a
          screen-reader user is never offered a field that would silently
          discard their enquiry. `tabIndex={-1}` keeps it off the keyboard path
          for the same reason. `autoComplete="off"` stops a browser or password
          manager filling it on a real person's behalf — that one is the actual
          false-positive risk, not bots.

          `website` because it is plausible enough to be worth filling in. Do
          not rename it to something a password manager recognises as a real
          field ("company", "organisation"); the whole design depends on no
          human and no autofill ever putting a value here. */}
      <div aria-hidden className="sr-only">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <fieldset className="flex flex-col gap-4" disabled={isSubmitting}>
        <GroupLabel>Your details</GroupLabel>

        {/* Paired only where the FORM is wide enough. Between lg and xl this
            form sits in a half-width footer column, so two inputs would be
            about 190px each — the same breakpoint trap as the office grid. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            {/* NO placeholder. A placeholder earns its place by teaching a
                format the label cannot — "you@company.com" does that. A name
                has no format to teach, so the slot had been filled with a real
                person's actual name instead, which then shipped to every
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

        {/* The whole control, including ~60 lines of overrides that put a
            light-background third-party widget onto the navy panel. See
            phone-field.tsx. */}
        <PhoneField control={control} error={errors.mobile?.message} />
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
        // focus-ring-dark, not the base focus-ring: this button sits on the
        // navy form panel, and the outline is painted OUTSIDE the button, on
        // --night-alt. --brand on that ground is 1.4:1; --brand-on-dark is
        // 5.71:1.
        className="group mt-8 w-full sm:w-auto focus-ring-dark"
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
