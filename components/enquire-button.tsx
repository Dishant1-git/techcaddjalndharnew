"use client"

import { ENQUIRY_EVENT } from "./enquiry-popup"

/** Opens the enquiry popup from any server-rendered page. */
export function EnquireButton({
  children = "Enquire Now",
  className = "",
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(ENQUIRY_EVENT))}
      className={className}
    >
      {children}
    </button>
  )
}
