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
import { Controller, useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { cn } from "@/lib/utils";

import "react-phone-number-input/style.css";

/** Fields sit on the navy panel, so they are lifted out of it rather than drawn on it. */
const FIELD = cn(
  "h-11 rounded-xl border-white/12 bg-white/6 px-4 text-white placeholder:text-white/35",
  "transition-colors focus-visible:border-brand focus-visible:ring-brand/30",
  "aria-invalid:border-red-400/60 aria-invalid:ring-red-400/20",
);

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-xs font-medium tracking-wide text-white/55">
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-red-300">{error}</span>}
    </label>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.7rem] font-semibold tracking-[0.18em] text-brand-on-dark uppercase">
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
      });

      // fetch only rejects on a network failure — a 400 or 500 resolves
      // normally, so the status has to be checked explicitly or every failure
      // is reported to the person as a success.
      if (!response.ok) throw new Error("Request failed");

      toast.success("Message sent. We'll get back to you soon.");
      reset();
    } catch {
      toast.error("Message not sent. Try again, or email arcompsol@gmail.com.");
    }
  }

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
    >
      <fieldset className="flex flex-col gap-4" disabled={isSubmitting}>
        <GroupLabel>Your details</GroupLabel>

        {/* Paired only where the FORM is wide enough. Between lg and xl this
            form sits in a half-width footer column, so two inputs would be
            about 190px each — the same breakpoint trap as the office grid. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            <Input
              {...register("name")}
              placeholder="Aneeq Ahmad"
              aria-invalid={!!errors.name}
              className={FIELD}
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input
              {...register("email")}
              type="email"
              placeholder="you@company.com"
              aria-invalid={!!errors.email}
              className={FIELD}
            />
          </Field>
        </div>

        <Field label="Mobile" error={errors.mobile?.message}>
          <Controller
            control={control}
            name="mobile"
            render={({ field, fieldState }) => (
              <PhoneInput
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
                onBlur={field.onBlur}
                placeholder="300 9442848"
                defaultCountry="PK"
                international
                countryCallingCodeEditable={false}
                numberInputProps={{ "aria-invalid": fieldState.invalid }}
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
                  "[&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-white",
                  "[&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-white/35",

                  // The country picker is a NATIVE <select> layered over the
                  // flag, and its dropdown is drawn by the OS on a white
                  // popup — but it inherits `color` from this wrapper, which
                  // is text-white. That is why the country names were white
                  // on white. Set on the select itself, and on the options,
                  // because browsers differ over which one the popup reads.
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
        </Field>
      </fieldset>

      <fieldset className="mt-8 flex flex-col gap-4" disabled={isSubmitting}>
        <GroupLabel>Your project</GroupLabel>

        <Field label="What you need" error={errors.subject?.message}>
          <Input
            {...register("subject")}
            placeholder="A web app, a team, a second opinion…"
            aria-invalid={!!errors.subject}
            className={FIELD}
          />
        </Field>

        <Field label="Tell us more" error={errors.body?.message}>
          <Textarea
            {...register("body")}
            rows={4}
            placeholder="What are you building, and where are you stuck?"
            aria-invalid={!!errors.body}
            className={cn(FIELD, "h-auto resize-y py-3")}
          />
        </Field>
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
