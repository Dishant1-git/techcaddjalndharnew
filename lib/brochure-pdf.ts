import PDFDocument from "pdfkit"
import type { CoursePage } from "./course-pages"
import { SITE } from "./site"
import type { Contact } from "./content"

/**
 * Renders a course's own page content into a PDF brochure.
 *
 * Nothing here is written for the brochure specifically — every sentence
 * comes from the same `CoursePage` object the web page renders, so the PDF
 * can never say something about fees, salaries or dates that the site itself
 * does not already say. There is deliberately no static PDF asset anywhere:
 * this function is only ever called from inside the validated brochure
 * request handler, which is what keeps the brochure behind the form.
 */

const INK = "#2a2c5e"
const BRAND = "#2563eb"
const MUTED = "#5b5f7a"
const LINE = "#e2e4ef"

const MARGIN = 56

export async function renderBrochurePdf(
  page: CoursePage,
  /**
   * Contact details for the footer. Passed rather than read so the brochure
   * carries the same number as the site — a PDF a student keeps for weeks is
   * the worst place for a stale one.
   */
  contact?: Contact,
): Promise<Buffer> {

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: MARGIN, bottom: 72, left: MARGIN, right: MARGIN },
    info: {
      Title: `${page.h1} — Techcadd Brochure`,
      Author: SITE.legalName,
      Subject: page.h1,
    },
  })

  const chunks: Buffer[] = []
  doc.on("data", (chunk: Buffer) => chunks.push(chunk))
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)
  })

  addFooters(doc)

  header(doc, page)
  facts(doc, page)

  if (page.overview?.length) section(doc, "Course Overview", page.overview)

  const modules = moduleList(page)
  if (modules.length) moduleSection(doc, modules)

  if (page.learn?.tools?.length) toolList(doc, page.learn.tools)

  if (page.faqs?.length) faqSection(doc, page.faqs.slice(0, 6))

  contactBlock(doc, contact ?? SITE)

  doc.end()
  return finished
}

function header(doc: PDFKit.PDFDocument, page: CoursePage) {
  doc
    .fillColor(BRAND)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("techcadd.", MARGIN, MARGIN, { continued: false })

  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(9)
    .text(SITE.tagline.toUpperCase(), MARGIN, doc.y - 2, { characterSpacing: 0.6 })

  doc.moveDown(1.4)

  doc
    .fillColor(BRAND)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(page.eyebrow.toUpperCase(), { characterSpacing: 1 })

  doc.moveDown(0.3)
  doc
    .fillColor(INK)
    .font("Helvetica-Bold")
    .fontSize(24)
    .text(page.h1)

  doc.moveDown(0.6)
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(11.5)
    .text(page.intro, { lineGap: 3 })

  doc.moveDown(1)
  rule(doc)
}

function facts(doc: PDFKit.PDFDocument, page: CoursePage) {
  if (!page.facts.length) return

  const colWidth = (doc.page.width - MARGIN * 2) / page.facts.length
  const top = doc.y + 14

  page.facts.forEach((fact, i) => {
    const x = MARGIN + i * colWidth
    doc
      .fillColor(MUTED)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(fact.label.toUpperCase(), x, top, { width: colWidth - 10, characterSpacing: 0.5 })
    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(11.5)
      .text(fact.value, x, top + 12, { width: colWidth - 10 })
  })

  doc.y = top + 38
  rule(doc)
}

function section(doc: PDFKit.PDFDocument, title: string, paragraphs: string[]) {
  ensureSpace(doc, 60)
  heading(doc, title)
  for (const para of paragraphs) {
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(10.5)
      .text(stripLinks(para), { lineGap: 3 })
    doc.moveDown(0.5)
  }
  doc.moveDown(0.4)
  rule(doc)
}

type BrochureModule = { title: string; points: string[] }

/** Prefers the numbered syllabus ladder; falls back to the plain module list. */
function moduleList(page: CoursePage): BrochureModule[] {
  if (page.syllabus?.modules.length) {
    return page.syllabus.modules.map((m) => ({
      title: `${String(m.n).padStart(2, "0")}. ${m.title}`,
      points: [m.body],
    }))
  }
  if (page.learn?.modules?.length) {
    return page.learn.modules.map((m) => ({ title: m.title, points: m.points }))
  }
  return []
}

function moduleSection(doc: PDFKit.PDFDocument, modules: BrochureModule[]) {
  ensureSpace(doc, 70)
  heading(doc, "What You Will Learn")

  for (const mod of modules) {
    ensureSpace(doc, 40)
    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .text(mod.title, { lineGap: 2 })
    for (const point of mod.points) {
      doc
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(9.5)
        .text(`•  ${stripLinks(point)}`, { indent: 12, lineGap: 1 })
    }
    doc.moveDown(0.45)
  }
  doc.moveDown(0.2)
  rule(doc)
}

function toolList(doc: PDFKit.PDFDocument, tools: string[]) {
  ensureSpace(doc, 60)
  heading(doc, "Tools You Will Work With")
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(10)
    .text(tools.join("  ·  "), { lineGap: 4 })
  doc.moveDown(0.6)
  rule(doc)
}

function faqSection(doc: PDFKit.PDFDocument, faqs: { q: string; a: string }[]) {
  ensureSpace(doc, 70)
  heading(doc, "Frequently Asked Questions")

  for (const faq of faqs) {
    ensureSpace(doc, 40)
    doc
      .fillColor(INK)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(faq.q, { lineGap: 2 })
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9.5)
      .text(stripLinks(faq.a), { lineGap: 2 })
    doc.moveDown(0.5)
  }
}

function contactBlock(
  doc: PDFKit.PDFDocument,
  nap: Pick<Contact, "phone" | "email" | "street" | "locality" | "region" | "postalCode">,
) {
  ensureSpace(doc, 90)
  rule(doc)
  doc.moveDown(0.6)
  heading(doc, "Talk to a Counsellor")
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(10)
    .text(
      `${SITE.legalName}, ${nap.street}, ${nap.locality}, ${nap.region} ${nap.postalCode}`,
      { lineGap: 3 },
    )
  doc.text(`Phone: ${nap.phone}   ·   Email: ${nap.email}   ·   ${SITE.url}`, {
    lineGap: 3,
  })
  doc.moveDown(0.6)
  doc
    .fillColor(MUTED)
    .font("Helvetica-Oblique")
    .fontSize(8.5)
    .text(
      "Fees, EMI options and current batch timings are confirmed by a counsellor at enrolment and are not fixed by this brochure.",
      { lineGap: 2 },
    )
}

function heading(doc: PDFKit.PDFDocument, title: string) {
  doc
    .fillColor(BRAND)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(title)
  doc.moveDown(0.4)
}

function rule(doc: PDFKit.PDFDocument) {
  const y = doc.y
  doc.moveTo(MARGIN, y).lineTo(doc.page.width - MARGIN, y).strokeColor(LINE).lineWidth(0.75).stroke()
  doc.moveDown(0.8)
}

/** Adds a new page proactively rather than letting pdfkit split a heading from its body. */
function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  const bottom = doc.page.height - doc.page.margins.bottom
  if (doc.y + needed > bottom) doc.addPage()
}

/** The site's body copy carries inline markdown-style links; a PDF has no href to hang them on. */
function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
}

function addFooters(doc: PDFKit.PDFDocument) {
  const stamp = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
  const label = `Generated from ${SITE.url} on ${stamp.format(new Date())}`

  // pdfkit only knows how many pages exist once the document is finished, so
  // the footer is drawn on every `pageAdded` event instead of walking the
  // buffered pages afterwards.
  //
  // Two things had to be true for this to be safe, both learned by watching a
  // 4-page brochure come out 115+ pages long:
  //
  // 1. No `width`/`align` on the footer's own `.text()` call. Any call that
  //    carries a `width` goes through pdfkit's LineWrapper, which owns
  //    `document._wrapper` for the whole flow and can itself call
  //    `continueOnNewPage()` mid-wrap. `pageAdded` fires synchronously from
  //    inside that call, so a *wrapped* footer draw would run while the
  //    interrupted flow's own wrapper was still on the stack and null it out
  //    from under it. A single short line needs no wrapping — without
  //    `width`, `_text()` takes the plain per-line path instead, which never
  //    touches `_wrapper`.
  // 2. `addPage()` resets `document.x`/`document.y` to the new page's top
  //    margin and *then* emits `pageAdded` — so whatever this handler leaves
  //    `x`/`y` pointing at (the footer, near the bottom) is still sitting
  //    there when `addPage()` returns to its caller. A caller resuming a
  //    line wrap right after `addPage()` reads that as "almost no room left
  //    on this fresh page" and immediately breaks again. Saving and
  //    restoring the cursor is what stops that cascade.
  const draw = () => {
    const savedX = doc.x
    const savedY = doc.y

    const bottom = doc.page.height - doc.page.margins.bottom + 24
    doc.fillColor(MUTED).font("Helvetica").fontSize(8)
    const x = (doc.page.width - doc.widthOfString(label)) / 2
    doc.text(label, x, bottom, { lineBreak: false })

    doc.x = savedX
    doc.y = savedY
  }

  doc.on("pageAdded", draw)
  draw()
}
