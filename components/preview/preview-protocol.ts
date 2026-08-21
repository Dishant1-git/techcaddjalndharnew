/**
 * The contract between the CMS preview pane and the /preview route.
 *
 * Kept in one file that both sides read so the message names cannot drift
 * apart — a renamed constant on one side would otherwise fail silently as
 * "the preview just stopped updating".
 */

/** Sent by the frame once its listener is attached and it can accept drafts. */
export const PREVIEW_READY = "techcadd:preview-ready"

/** Sent by the CMS on every change. `payload` is the draft record. */
export const PREVIEW_DRAFT = "techcadd:preview-draft"

/**
 * Sent by the CMS when the editor moves to a different section, so the frame
 * scrolls to the part of the page that section controls. `section` is the DOM
 * id the template already gives that block.
 */
export const PREVIEW_SCROLL = "techcadd:preview-scroll"

export type PreviewKind = "course" | "page"

export interface PreviewDraftMessage<T = unknown> {
  type: typeof PREVIEW_DRAFT
  /** Which editor is talking, so one frame cannot be fed another's shape. */
  kind: PreviewKind
  payload: T
}

/** Everything the frame may receive from the CMS. */
export type PreviewMessage<T = unknown> = PreviewDraftMessage<T> | PreviewScrollMessage

export interface PreviewScrollMessage {
  type: typeof PREVIEW_SCROLL
  kind: PreviewKind
  section: string
}

/**
 * Sent by the frame after rendering, when there is something about the result
 * the editor should know — currently, sections it cannot edit.
 */
export const PREVIEW_NOTICE = "techcadd:preview-notice"

export interface PreviewNoticeMessage {
  type: typeof PREVIEW_NOTICE
  kind: PreviewKind
  uneditable: string[]
}

export interface PreviewReadyMessage {
  type: typeof PREVIEW_READY
  kind: PreviewKind
}

/**
 * Parses an allowlist of origins from a comma-separated env value.
 *
 * An empty or missing value yields an empty list, and a caller with an empty
 * list must reject every message — failing closed, so a misconfigured
 * deployment produces a blank preview rather than one that trusts anybody.
 */
export function parseOrigins(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean)
}
