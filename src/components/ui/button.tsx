import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * cursor-pointer is in the BASE, not on individual variants. Tailwind v4 removed
 * `button { cursor: pointer }` from its preflight, so a <button> now inherits
 * the default arrow unless something says otherwise — which meant every button
 * on this site looked unclickable. `disabled:pointer-events-none` below already
 * suppresses it for disabled buttons, so this needs no disabled: counterpart.
 *
 * ── THE FOCUS RING IS `focus-ring`, NOT shadcn's `ring-ring/50` ──────────────
 * The inherited default was `focus-visible:border-ring focus-visible:ring-3
 * focus-visible:ring-ring/50`. With `--ring` mapped to `--brand`, that half-
 * opacity ring composites to #8aa89f on paper and MEASURES 2.48:1 against
 * --surface, 2.42:1 on --surface-alt and 2.34:1 on --secondary. WCAG 2.2
 * (1.4.11) requires 3:1 for a focus indicator, so every button on the site —
 * both hero CTAs, the carousel arrows, the menu trigger, the form submit —
 * failed it. Opacity was the whole problem: the hue was right, half of it was
 * not there.
 *
 * `focus-ring` is the solid brand outline used by every link on the site, at
 * 8.36:1 / 7.78:1 / 7.14:1 on those same three grounds. Using it here also
 * means buttons and links finally indicate focus the SAME way.
 *
 * A button on a dark band must pass `focus-ring-dark` — the brand green is
 * near-invisible on navy. The contact form's submit is the one such case.
 * `aria-invalid:ring-*` below is untouched: that is an error state, not focus.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] outline-none select-none focus-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
        // ── Arcompsol brand variants ──────────────────────────────────
        // Ports the MUI theme's custom `primary` and `secondary` Button
        // variants (theme.ts, components.MuiButton.variants). The gradient,
        // the -1px hover lift and the shadow ramp are carried over as-is so
        // the revamp does not quietly restyle the primary call to action.
        brand:
          "bg-gradient-to-r from-brand to-brand-deep font-semibold text-on-brand shadow-[0_2px_4px_rgb(var(--shadow-brand)/0.25)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgb(var(--shadow-brand)/0.38)] active:translate-y-0",
        // --brand-mid, NOT --brand-blue. This pointed at --brand-blue back when
        // that token held a green; it now holds the logo's actual blue, and an
        // "Apply now" in blue beside green primaries would read as a different
        // kind of action rather than a quieter one. The blue is for links,
        // informational states and second series — not for secondary BUTTONS,
        // which belong to the same family as the primary, one step lighter.
        brandOutline:
          "border-brand-mid text-brand-mid border bg-transparent hover:-translate-y-px hover:bg-brand-mid hover:text-on-brand hover:shadow-[0_4px_8px_rgb(var(--shadow-brand)/0.28)] active:translate-y-0",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
        // Marketing-scale sizes. shadcn's defaults top out at h-9, which is
        // right for dense product UI and far too small for a landing-page CTA;
        // these match the MuiButton sizeMedium / sizeLarge padding.
        brand: "h-11 gap-2 px-6 text-base",
        "brand-lg": "h-13 gap-2 px-8 text-lg font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
