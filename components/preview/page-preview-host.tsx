"use client"

import { useEffect, useState } from "react"

import { PageBody, PageHero } from "@/components/page-body"
import { type BlogTeaser } from "@/components/content-block"
import { type ContentBlock } from "@/lib/content-blocks"
import {
  PREVIEW_DRAFT,
  PREVIEW_READY,
  PREVIEW_SCROLL,
  type PreviewMessage,
} from "./preview-protocol"

/** What the CMS page editor posts in. */
export interface PageDraft {
  title?: string
  content?: string
  sections?: ContentBlock[]
}

/**
 * Renders the real page template over whatever draft the CMS posts in.
 *
 * The same arrangement as the course preview: this component holds no data and
 * fetches nothing, so there is no way for it to leak a draft to anyone who
 * visits it directly. `posts` is the one thing it cannot derive from the
 * message — a 'blogs' block needs real posts — so the server passes them down.
 */
export function PagePreviewHost({
  posts,
  allowedOrigins,
  cta,
}: {
  posts: BlogTeaser[]
  allowedOrigins: string[]
  /**
   * The site's closing call to action, rendered by the server route above.
   *
   * `Cta` is an async server component, and an async component inside a
   * `'use client'` tree is a runtime error. Passing it in as an element keeps
   * it on the server.
   */
  cta?: React.ReactNode
}) {
  const [draft, setDraft] = useState<PageDraft | undefined>()

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Fail closed. An empty allowlist means the deployment did not set
      // CMS_ADMIN_ORIGIN, and trusting everyone would be the wrong recovery.
      if (!allowedOrigins.includes(event.origin)) return

      const data = event.data as PreviewMessage<PageDraft> | undefined
      if (!data || data.kind !== "page") return

      if (data.type === PREVIEW_SCROLL) {
        const id = data.section
        requestAnimationFrame(() => {
          document
            .getElementById(id)
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        })
        return
      }

      if (data.type === PREVIEW_DRAFT) setDraft(data.payload)
    }

    window.addEventListener("message", onMessage)

    for (const origin of allowedOrigins) {
      window.parent?.postMessage({ type: PREVIEW_READY, kind: "page" }, origin)
    }

    return () => window.removeEventListener("message", onMessage)
  }, [allowedOrigins])

  if (!draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
        <p className="text-sm text-slate-500">Waiting for the editor…</p>
      </div>
    )
  }

  return (
    <main>
      <PageHero title={draft.title?.trim() || "Untitled page"} />
      <PageBody blocks={draft.sections} content={draft.content} posts={posts} />
      {cta}
    </main>
  )
}
