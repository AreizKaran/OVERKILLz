/**
 * CSV export (§Download Attendance & Marks).
 *
 * Runs entirely in the browser — no server round-trip — so it works in
 * sample-data mode and on a slow connection alike.
 */

/** Quotes a cell only when it needs it, and defuses spreadsheet formula injection. */
function cell(value) {
  let v = value == null ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`          // ='cmd' would execute in Excel
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

export function toCSV(columns, rows) {
  const head = columns.map((c) => cell(c.label)).join(',')
  const body = rows.map((r) => columns.map((c) => cell(
    typeof c.value === 'function' ? c.value(r) : r[c.value]
  )).join(',')).join('\n')
  return `${head}\n${body}`
}

export function downloadCSV(filename, columns, rows) {
  // The BOM makes Excel open UTF-8 correctly — without it, ₹ and names break.
  const blob = new Blob(['﻿' + toCSV(columns, rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoking immediately can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const stamp = () => new Date().toISOString().slice(0, 10)
