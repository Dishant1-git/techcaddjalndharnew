"use client"

import { useState } from "react"
import { ENQUIRY_EVENT } from "./enquiry-popup"

/**
 * Phone field and Book Demo button in the closing CTA.
 *
 * It does not post anywhere itself. Submitting hands the number to the enquiry
 * popup, which already owns the captcha, the validation and the /api/enquiry
 * call — duplicating that here would mean a second captcha flow to keep in
 * step with the first. The reader types their number once and the popup opens
 * with it filled in.
 *
 * A row still reaches the `enquiries` table on the other side of that popup;
 * `form: "demo"` is what tags it as having started here rather than at the
 * header button, so the two are separable in the dashboard.
 */
export function CtaDemoForm() {
  const [phone, setPhone] = useState("")

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        window.dispatchEvent(
          new CustomEvent(ENQUIRY_EVENT, { detail: { phone, form: "demo" } }),
        )
      }}
      className="mx-auto mt-10 flex w-full max-w-lg flex-col gap-3 sm:flex-row"
    >
      <label htmlFor="cta-phone" className="sr-only">
        Mobile number
      </label>
      <input
        id="cta-phone"
        name="phone"
        type="tel"
        required
        inputMode="numeric"
        pattern="[0-9]{10}"
        autoComplete="tel"
        value={phone}
        /* Strips anything that is not a digit as it is typed: people paste
           numbers with +91, spaces and dashes, and the pattern would reject
           them without saying why. */
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
        placeholder="Your mobile number"
        aria-label="Mobile number"
        /* `sm:flex-1`, not `flex-1`.
           The row stacks below `sm`, and in a column flex container `flex-1`
           applies to the height: it set `flex-basis: 0` and collapsed the
           field to its content, rendering 19px tall next to a 56px button.
           `h-14` cannot win against that, so the growth only applies once the
           form is actually a row. */
        className="h-14 w-full shrink-0 rounded-full border border-white/25 bg-white/10 px-6 text-base text-white outline-none backdrop-blur-md placeholder:text-white/55 focus-visible:border-white/50 focus-visible:ring-2 focus-visible:ring-white/40 sm:flex-1 sm:text-sm"
      />

      <button
        type="submit"
        className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-ink transition-colors duration-300 hover:bg-brand-500 hover:text-white"
      >
        Book Demo
      </button>
    </form>
  )
}
