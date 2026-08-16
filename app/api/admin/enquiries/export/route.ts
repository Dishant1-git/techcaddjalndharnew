import { NextResponse } from "next/server"
import { readSession } from "@/lib/admin-auth"
import { ensureTable, listForExport, parseFilters } from "@/lib/admin-data"

export const dynamic = "force-dynamic"

/**
 * The dashboard's "Export CSV" button. Returns exactly the rows the table is
 * currently showing — the same query string drives both — so what downloads
 * matches what was on screen.
 */

const HEADERS = [
  "ID",
  "Form",
  "Name",
  "Phone",
  "Course",
  "Email",
  "Address",
  "Message",
  "Source page",
  "Received",
] as const

/**
 * Spreadsheets treat a leading =, +, - or @ as the start of a formula, so a
 * name typed as `=cmd|...` becomes executable content in Excel. Prefixing with
 * a quote keeps it text. Everything else is ordinary RFC 4180 quoting.
 */
function cell(value: string | number | null): string {
  const text = String(value ?? "")
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  if (!(await readSession()))
    return NextResponse.json(
      { error: "Not signed in." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    )

  const params = Object.fromEntries(new URL(request.url).searchParams)
  const filters = parseFilters(params)

  let rows
  try {
    await ensureTable()
    rows = await listForExport(filters)
  } catch (error) {
    // The message can carry credentials or SQL, so it stays server-side.
    console.error("[admin] export failed:", error)
    return NextResponse.json(
      { error: "The export could not be produced." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }

  const csv = [
    HEADERS.join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.formType,
        row.name,
        row.phone,
        row.course,
        row.email,
        row.address,
        row.message,
        row.source,
        row.createdAtIso,
      ]
        .map(cell)
        .join(","),
    ),
  ].join("\r\n")

  const stamp = new Date().toISOString().slice(0, 10)

  return new NextResponse(
    // A BOM, so Excel opens it as UTF-8 instead of the local codepage and
    // mangling every name with a non-ASCII character in it.
    `﻿${csv}`,
    {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="techcadd-enquiries-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    },
  )
}
