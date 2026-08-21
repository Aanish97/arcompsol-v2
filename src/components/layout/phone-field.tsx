"use client";

/**
 * The contact form's mobile number field: country picker, flag, and the number.
 *
 * ── IN SIMPLE WORDS ──
 * The one box on the form that is not a plain input. It is a third-party
 * control with its own flag, its own country dropdown and its own stylesheet,
 * all of which assume a light background — so most of this file is putting it
 * back on the navy panel the rest of the form lives on.
 *
 * ── WHY IT'S BUILT THIS WAY (change at your peril) ──
 * SPLIT OUT OF contact-form.tsx ON REVIEW, 2026-08-17. It is a third of the
 * form's markup for one of its five fields, and none of it is about the
 * enquiry — it is about one library's defaults. The form file is shorter and
 * this is now findable by name.
 *
 * EVERY OVERRIDE BELOW WORKS THROUGH A CUSTOM PROPERTY OR A UTILITY ON THE
 * ELEMENT, never a competing rule. react-phone-number-input's stylesheet is
 * UNLAYERED and Tailwind's utilities sit in `@layer utilities` — unlayered
 * author styles beat every layer, so a plain utility loses to the library no
 * matter how specific the selector is. Verified: the `shadow-none` version of
 * the flag-border fix computed to no change at all. The library's variables
 * are declared on `:root`, so setting them ON the element beats inheritance
 * and the cascade layer never enters into it.
 *
 * THE STYLESHEET IMPORT LIVES HERE, with the component that renders the
 * control. It is still injected at the same point in the cascade as before the
 * split — this module is imported by contact-form.tsx, so its imports evaluate
 * first, and globals.css is loaded by the root layout ahead of both either way.
 *
 * ── DO NOT ──
 * - Do not move `FIELD` onto the inner <input>. It belongs on the WRAPPER, and
 *   the autofill rules in globals.css depend on that being true: both ring
 *   branches there carry `:not(.PhoneInputInput)` precisely because this input
 *   does not own its own ring.
 */
import { Controller, type Control } from "react-hook-form";
import PhoneInput from "react-phone-number-input";

import { CountryFlag } from "@/components/common/country-flag";
import { Field, FIELD } from "@/components/layout/contact-fields";
import { type ContactInput } from "@/lib/contact-schema";
import { cn } from "@/lib/utils";

import "react-phone-number-input/style.css";

export function PhoneField({
  control,
  error,
}: {
  control: Control<ContactInput>;
  error?: string;
}) {
  return (
    <Field label="Mobile" error={error}>
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
              // FLAGS COME FROM flagcdn.com, FALLING BACK TO THE UNICODE
              // FLAG CHARACTER — see common/country-flag.tsx, which is
              // where the reasoning and the measurements live. This repo
              // holds no flag files; public/flags was deleted.
              //
              // A component rather than the `flagUrl` string this used to
              // pass, because two selectable countries (AC, TA) have no
              // flag on flagcdn and a plain URL renders a broken image for
              // them. It also catches the CDN being down or blocked.
              //
              // NOT the library's own default, which points at
              // purecatamphetamine.github.io — GitHub Pages is not a CDN
              // and hotlinking it is not something it offers. flagcdn is
              // Cloudflare-served with a 31-day cache and is built for
              // exactly this.
              flagComponent={CountryFlag}
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
                  "border-danger-on-dark/70 ring-3 ring-danger-on-dark/25",

                // The number input.
                // min-h-11 on the INPUT itself. It rendered 24px tall inside
                // a 44px box, so the touch target only met WCAG 2.5.5 by way
                // of the surrounding <label> — restructure that label and the
                // target silently becomes 24px. Stated here instead.
                "[&_.PhoneInputInput]:min-h-11",
                "[&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-on-dark",
                "[&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-on-dark-muted/70",
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
                // ...except on the emoji fallback. Captured at 4x: the
                // emoji is a WAVING flag glyph, so it never reaches the
                // edges of a 3:2 box, and the border ends up framing dark
                // space on all four sides — which reads as the broken image
                // the fallback exists to prevent. The state lives in
                // CountryFlag, so the wrapper can only see it via :has() on
                // the marker attribute.
                //
                // THROUGH THE VARIABLES, not `shadow-none` — see the module
                // header for why an unlayered stylesheet beats @layer
                // utilities no matter how specific the selector is.
                "[&_.PhoneInputCountryIcon:has([data-flag-fallback])]:[--PhoneInputCountryFlag-borderColor:transparent]",
                "[&_.PhoneInputCountryIcon:has([data-flag-fallback])]:[--PhoneInputCountryFlag-backgroundColor--loading:transparent]",
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
  );
}
