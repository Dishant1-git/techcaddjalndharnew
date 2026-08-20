"use client"

import { useEffect, useState } from "react"

import { CoursePageView } from "@/components/course-page-view"
import { type Contact } from "@/lib/content"
import {
  coursePageFromDraft,
  isSegment,
  uneditableSections,
  type CourseDraft,
} from "@/lib/course-preview"
import { type CoursePage } from "@/lib/course-pages"
import {
  PREVIEW_DRAFT,
  PREVIEW_NOTICE,
  PREVIEW_READY,
  PREVIEW_SCROLL,
  type PreviewMessage,
} from "./preview-protocol"

/**
 * Renders the real course template over whatever draft the CMS posts in.
 *
 * This component holds no data of its own and fetches nothing. It is a socket:
 * the parent frame sends a course record, `coursePageFromDraft` runs the
 * website's own resolution over it, and `CoursePageView` — the same component
 * the live route mounts — renders the result. There is no second copy of the
 * layout to keep in step.
 *
 * It deliberately has no way to *read* a draft. If it fetched drafts by id it
 * would need a session or a token, and a bug in either would expose unpublished
 * content to the internet. Because the draft can only arrive from a frame the
 * CSP already restricts, this page shows a stranger nothing they did not
 * already have.
 */
export function CoursePreviewHost({
  contact,
  allowedOrigins,
}: {
  contact: Contact
  /** Serialised on the server so the browser never guesses who to trust. */
  allowedOrigins: string[]
}) {
  const [page, setPage] = useState<CoursePage | undefined>()
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Fail closed. An empty allowlist means the deployment did not set
      // CMS_ADMIN_ORIGIN, and trusting everyone would be the wrong recovery.
      if (!allowedOrigins.includes(event.origin)) return

      const data = event.data as PreviewMessage<CourseDraft> | undefined
      if (!data || data.kind !== "course") return

      if (data.type === PREVIEW_SCROLL) {
        // Deferred a frame: a section that only just appeared because of the
        // same edit is not in the document yet when the message arrives.
        const id = data.section
        requestAnimationFrame(() => {
          document
            .getElementById(id)
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        })
        return
      }

      if (data.type !== PREVIEW_DRAFT) return

      const draft = data.payload
      if (!draft || !isSegment(draft.segment)) {
        setError("This draft has no valid section, so it has no address yet.")
        return
      }

      try {
        const next = coursePageFromDraft(draft)
        if (!next) {
          setError("Give the course a title and a URL slug to see its page.")
          setPage(undefined)
          return
        }
        setError(undefined)
        setPage(next)

        /*
          Tell the pane which sections of this page nobody can edit yet.

          Computed here rather than in the CMS because the answer lives in
          course-pages.ts, which is website source. Duplicating the list of
          hand-authored courses into the admin app would put it one edit away
          from being wrong.
        */
        window.parent?.postMessage(
          {
            type: PREVIEW_NOTICE,
            kind: "course",
            uneditable: uneditableSections(draft.segment, draft.slug),
          },
          event.origin,
        )
      } catch (cause) {
        // A malformed draft must not blank the pane with a React error
        // overlay — the editor would have no idea which field did it.
        setError(
          cause instanceof Error
            ? `This preview could not be built: ${cause.message}`
            : "This preview could not be built.",
        )
      }
    }

    window.addEventListener("message", onMessage)

    // Announce readiness to the opener rather than to '*': the parent is the
    // only party that needs to know, and the message names the editor.
    for (const origin of allowedOrigins) {
      window.parent?.postMessage({ type: PREVIEW_READY, kind: "course" }, origin)
    }

    return () => window.removeEventListener("message", onMessage)
  }, [allowedOrigins])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
        <p className="max-w-sm text-center text-sm leading-relaxed text-slate-600">
          {error}
        </p>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
        <p className="text-sm text-slate-500">Waiting for the editor…</p>
      </div>
    )
  }

  return (
    <main>
      <CoursePageView page={page} contact={contact} />
    </main>
  )
}
