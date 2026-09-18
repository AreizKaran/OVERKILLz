import { useEffect, useMemo, useState } from 'react'
import {
  Check, X, Clock3, Download, Users, CalendarDays, ChevronLeft, ChevronRight, Search,
} from 'lucide-react'
import { Card, SectionHead, Badge } from './ui/Primitives'
import { useToast } from './ui/Toast'
import { downloadCSV, stamp } from '../lib/export'
import { attendanceTone } from '../lib/hooks'
import { ROSTER, COHORT } from '../data/mock'

const STATUS = [
  { k: 'present', label: 'Present', Icon: Check,  on: 'bg-ok-700 text-white',   tone: 'ok' },
  { k: 'late',    label: 'Late',    Icon: Clock3, on: 'bg-warn-800 text-white', tone: 'warn' },
  { k: 'absent',  label: 'Absent',  Icon: X,      on: 'bg-bad-600 text-white',  tone: 'bad' },
]

const iso = (d) => d.toISOString().slice(0, 10)
const pretty = (s) => new Date(s + 'T00:00:00').toLocaleDateString('en-IN',
  { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })

/**
 * The register faculty actually work in.
 *
 * Any past date can be opened and corrected — attendance is often entered late,
 * and a register that only accepts "today" forces paper workarounds.
 */
export default function AttendanceRegister({ course, onSave }) {
  const toast = useToast()
  const today = iso(new Date())
  const [date, setDate] = useState(today)
  const [marks, setMarks] = useState({})
  const [picked, setPicked] = useState(() => new Set())
  const [q, setQ] = useState('')

  // Opening a different date loads that day's register.
  useEffect(() => {
    setMarks(Object.fromEntries(ROSTER.map((s) => [s.id, 'present'])))
    setPicked(new Set())
  }, [date])

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return ROSTER.filter((s) => !t || s.name.toLowerCase().includes(t) || s.reg.includes(t))
  }, [q])

  const counts = Object.values(marks).reduce((a, v) => ({ ...a, [v]: (a[v] || 0) + 1 }), {})
  const allPicked = rows.length > 0 && rows.every((s) => picked.has(s.id))
  const somePicked = picked.size > 0 && !allPicked

  const toggleOne = (id) =>
    setPicked((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  const toggleAll = () =>
    setPicked((p) => (allPicked ? new Set() : new Set(rows.map((s) => s.id))))

  const setStatus = (id, v) => setMarks((m) => ({ ...m, [id]: v }))

  /** Bulk apply to the checked rows — the reason the checkboxes exist. */
  const applyToPicked = (v) => {
    if (!picked.size) return
    setMarks((m) => ({ ...m, ...Object.fromEntries([...picked].map((id) => [id, v])) }))
    toast(`${picked.size} student${picked.size > 1 ? 's' : ''} marked ${v}.`, 'info')
    setPicked(new Set())
  }

  const shiftDate = (days) => {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + days)
    if (iso(d) <= today) setDate(iso(d))
  }

  const exportDay = () => {
    downloadCSV(
      `attendance-${course?.course ?? 'course'}-${date}`,
      [
        { label: 'Registration', value: 'reg' },
        { label: 'Name', value: 'name' },
        { label: 'Status', value: (r) => marks[r.id] ?? '' },
        { label: 'Overall %', value: 'att' },
      ],
      ROSTER,
    )
    toast('Attendance exported as CSV.')
  }

  const save = () => {
    onSave?.({ date, marks })
    toast(`Attendance saved for ${pretty(date)}.`)
  }

  return (
    <div className="space-y-4">
      {/* Date navigation — any past date is editable */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => shiftDate(-1)} aria-label="Previous day"
            className="btn-ghost !min-h-[44px] !px-3"><ChevronLeft size={16} aria-hidden="true" /></button>
          <label className="relative flex-1 sm:flex-none">
            <span className="sr-only">Attendance date</span>
            <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)}
              className="field !min-h-[44px] tnum cursor-pointer sm:w-[11.5rem]" />
          </label>
          <button onClick={() => shiftDate(1)} aria-label="Next day" disabled={date >= today}
            className="btn-ghost !min-h-[44px] !px-3"><ChevronRight size={16} aria-hidden="true" /></button>
        </div>
        {date !== today && (
          <Badge tone="warn">Editing {pretty(date)}</Badge>
        )}
        <button onClick={exportDay} className="btn-ghost !min-h-[44px] sm:ml-auto text-sm">
          <Download size={15} aria-hidden="true" /> Export CSV
        </button>
      </div>

      {/* Cohort total, always visible above the list */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 rounded-xl bg-subtle">
        <span className="flex items-center gap-1.5 text-sm">
          <Users size={14} className="text-muted" aria-hidden="true" />
          <strong className="tnum">{ROSTER.length}</strong>
          <span className="text-muted">students on roll</span>
        </span>
        <span className="h-4 w-px bg-line hidden sm:block" aria-hidden="true" />
        <Badge tone="ok">{counts.present ?? 0} present</Badge>
        <Badge tone="warn">{counts.late ?? 0} late</Badge>
        <Badge tone="bad">{counts.absent ?? 0} absent</Badge>
      </div>

      {/* Select-all + bulk actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none min-h-[44px]">
          <input type="checkbox" checked={allPicked}
            ref={(el) => { if (el) el.indeterminate = somePicked }}
            onChange={toggleAll}
            className="w-[18px] h-[18px] rounded border-line accent-brand cursor-pointer" />
          <span>{picked.size ? `${picked.size} selected` : 'Select all'}</span>
        </label>

        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="field pl-9"
            placeholder="Find a student" aria-label="Find a student" />
        </div>

        {picked.size > 0 && (
          <div className="flex gap-1.5" role="group" aria-label="Apply to selected">
            {STATUS.map(({ k, label, Icon }) => (
              <button key={k} onClick={() => applyToPicked(k)}
                className="btn-ghost !min-h-[44px] !px-3 text-xs">
                <Icon size={13} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Register */}
      <div className="border border-line rounded-xl divide-y divide-line overflow-hidden">
        {rows.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">
            No student matches “{q}”. <button onClick={() => setQ('')} className="text-brand hover:underline cursor-pointer">Clear</button>
          </p>
        ) : rows.map((s) => {
          const tone = attendanceTone(s.att)
          const isPicked = picked.has(s.id)
          return (
            <div key={s.id}
              className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${isPicked ? 'bg-brand-50' : 'hover:bg-subtle/60'}`}>
              <label className="flex items-center min-h-[44px] px-1 cursor-pointer">
                <span className="sr-only">Select {s.name}</span>
                <input type="checkbox" checked={isPicked} onChange={() => toggleOne(s.id)}
                  className="w-[18px] h-[18px] rounded border-line accent-brand cursor-pointer" />
              </label>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-xs text-muted tnum flex items-center gap-2">
                  <span>{s.reg}</span>
                  <span className={`chip ${tone.chip} !py-0 !px-1.5`}>{s.att}%</span>
                </div>
              </div>

              <div className="flex gap-1 shrink-0" role="group" aria-label={`Attendance for ${s.name}`}>
                {STATUS.map(({ k, label, Icon, on }) => (
                  <button key={k} onClick={() => setStatus(s.id, k)}
                    aria-label={`${label} — ${s.name}`} aria-pressed={marks[s.id] === k}
                    className={`w-11 h-11 grid place-items-center rounded-lg border transition cursor-pointer
                      ${marks[s.id] === k ? on + ' border-transparent' : 'border-line text-muted hover:bg-subtle'}`}>
                    <Icon size={15} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky: in a 62-row register the save action must not scroll away */}
      <div className="sticky bottom-0 -mx-5 -mb-5 px-5 py-3 bg-surface border-t border-line
                      flex flex-col sm:flex-row gap-2 sm:justify-end">
        <button onClick={() => setMarks(Object.fromEntries(ROSTER.map((s) => [s.id, 'present'])))}
          className="btn-ghost">Mark all present</button>
        <button onClick={save} className="btn-primary">
          Save attendance <span className="tnum opacity-80">({counts.present ?? 0}/{ROSTER.length})</span>
        </button>
      </div>
    </div>
  )
}
