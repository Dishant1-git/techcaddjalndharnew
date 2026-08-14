const TAB = 9
const NEWLINE = 10

/** C0 controls, DEL, and the C1 block — none of them typed by a person. */
function isControl(code: number) {
  return code < 32 || code === 127 || (code >= 128 && code <= 159)
}

/**
 * Trims, and replaces control characters with a space. They never occur in
 * something a visitor typed, but one smuggled into a stored field forges lines
 * in whatever log, CSV export or admin screen reads the table later.
 *
 * Shared by every form's API route rather than copied per-route, so a fix
 * here — or a future field that needs newlines allowed — lands everywhere at
 * once instead of drifting between routes that started as copies of each
 * other.
 */
export function clean(value: unknown, allowNewlines = false): string {
  let out = ""
  for (const char of String(value ?? "")) {
    const code = char.codePointAt(0) ?? 0
    if (!isControl(code)) out += char
    // The message/address fields come from a textarea, so tab and newline are
    // content there.
    else if (allowNewlines && (code === TAB || code === NEWLINE)) out += char
    else out += " "
  }
  return out.trim()
}
