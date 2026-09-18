import { useState } from 'react'
import { BookOpen, User, Award, CalendarCheck, FileText, ChevronRight, Percent, Download, FlaskConical } from 'lucide-react'
import { Card, SectionHead, Badge, Bar, ErrorState, Skeleton } from '../../components/ui/Primitives'
import Modal from '../../components/ui/Modal'
import { attendanceTone } from '../../lib/hooks'
import { useAuth } from '../../lib/auth'
import { LAB_COURSES } from '../../data/mock'
import { downloadCSV } from '../../lib/export'
import { useToast } from '../../components/ui/Toast'
import { source } from '../../data/source'
import { useResource } from '../../lib/hooks'

export default function Academics() {
  const { user } = useAuth()
  const [open, setOpen] = useState(null)
  const [kind, setKind] = useState('All')   // Course List: Theory / Lab dropdown
  const toast = useToast()
  const { loading, error, data, reload } = useResource(source.courses)
  const work = useResource(source.assignments)

  if (loading) return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-5 space-y-3">
          <Skeleton className="h-3 w-24" /><Skeleton className="h-5 w-2/3" /><Skeleton className="h-2 w-full" /><Skeleton className="h-2 w-full" />
        </Card>
      ))}
    </div>
  )
  if (error) return <Card><ErrorState message={error} onRetry={reload} /></Card>

  const THEORY = (data ?? []).map((c) => ({ ...c, type: c.type ?? 'Theory' }))
  const ALL_COURSES = [...THEORY, ...LAB_COURSES]
  const COURSES = kind === 'All' ? ALL_COURSES : ALL_COURSES.filter((c) => c.type === kind)
  const ASSIGNMENTS = work.data ?? []

  const exportCourses = () => {
    downloadCSV('courses-semester-VI', [
      { label: 'Code', value: 'code' }, { label: 'Subject', value: 'name' },
      { label: 'Type', value: 'type' }, { label: 'Credits', value: 'credits' },
      { label: 'Faculty', value: 'faculty' }, { label: 'Attendance %', value: 'attendance' },
      { label: 'Internal', value: (c) => `${c.internal}/${c.max}` },
    ], COURSES)
    toast('Course list exported as CSV.')
  }
  const credits = COURSES.reduce((s, c) => s + c.credits, 0)

  return (
    <div className="space-y-5">
      {/* Course List — Theory / Lab, with Show all first */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1.5" role="group" aria-label="Filter courses by type">
          {[
            { k: 'All',    label: `Show all (${ALL_COURSES.length})`, Icon: BookOpen },
            { k: 'Theory', label: `Theory (${THEORY.length})`,        Icon: FileText },
            { k: 'Lab',    label: `Lab (${LAB_COURSES.length})`,      Icon: FlaskConical },
          ].map(({ k, label, Icon }) => (
            <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k}
              className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg text-sm font-medium border transition cursor-pointer
                ${kind === k ? 'border-brand bg-brand-50 text-brand-700' : 'border-line bg-surface text-muted hover:border-slate-300'}`}>
              <Icon size={14} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
        <button onClick={exportCourses} className="btn-ghost !min-h-[44px] sm:ml-auto text-sm">
          <Download size={15} aria-hidden="true" /> Download list
        </button>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {[
            { label: 'Semester', value: user.role === 'student' ? `VI · Autumn 2026` : 'Autumn 2026' },
            { label: kind === 'All' ? 'Registered courses' : `${kind} courses`, value: COURSES.length },
            { label: 'Total credits', value: credits },
            { label: 'Programme', value: user.program ?? 'B.Tech CSE' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-xs text-muted">{s.label}</div>
              <div className="font-semibold tnum mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {COURSES.map((c) => {
          const tone = attendanceTone(c.attendance)
          return (
            <Card key={c.id} hover className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted tnum flex items-center gap-2">
                    <span>{c.code} · {c.credits} credits</span>
                    <Badge tone={c.type === 'Lab' ? 'warn' : 'info'} icon={false}>{c.type}</Badge>
                  </div>
                  <h3 className="font-semibold mt-1 leading-snug">{c.name}</h3>
                </div>
                <span className="w-9 h-9 rounded-lg bg-brand-50 grid place-items-center shrink-0">
                  <BookOpen size={16} className="text-brand" aria-hidden="true" />
                </span>
              </div>

              <p className="text-sm text-muted mt-2.5 flex items-center gap-1.5">
                <User size={13} aria-hidden="true" /> {c.faculty}
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted">Course progress</span>
                    <span className="tnum font-medium">{c.progress}%</span>
                  </div>
                  <Bar value={c.progress} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted">Attendance</span>
                    <span className="tnum font-medium">{c.attendance}%</span>
                  </div>
                  <Bar value={c.attendance} tone={tone.ring} />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
                <div className="text-sm">
                  <span className="text-muted">Internal </span>
                  <span className="tnum font-semibold">{c.internal}/{c.max}</span>
                </div>
                <button onClick={() => setOpen(c)} className="text-sm text-brand hover:underline flex items-center gap-1 cursor-pointer">
                  Details <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} size="lg" title={open ? `${open.code} · ${open.name}` : ''}>
        {open && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: User,          label: 'Faculty',    value: open.faculty },
                { icon: Award,         label: 'Credits',    value: open.credits },
                { icon: CalendarCheck, label: 'Attendance', value: `${open.attendance}%` },
                { icon: Percent,       label: 'Internal',   value: `${open.internal}/${open.max}` },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-lg bg-subtle">
                  <s.icon size={14} className="text-muted mb-1.5" aria-hidden="true" />
                  <div className="text-xs text-muted">{s.label}</div>
                  <div className="text-sm font-medium mt-0.5 truncate">{s.value}</div>
                </div>
              ))}
            </div>

            <div>
              <SectionHead title="Assignments" />
              {ASSIGNMENTS.filter((a) => a.course === open.code).length === 0
                ? <p className="text-sm text-muted">No assignments issued for this course yet.</p>
                : ASSIGNMENTS.filter((a) => a.course === open.code).map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-line last:border-0">
                    <span className="text-sm truncate">{a.title}</span>
                    <Badge tone={{ pending: 'warn', submitted: 'info', graded: 'ok', overdue: 'bad' }[a.status]}>{a.status}</Badge>
                  </div>
                ))}
            </div>

            <div>
              <SectionHead title="Study materials" />
              <div className="space-y-1.5">
                {['Unit 1 — Introduction (PDF)', 'Unit 2 — Lecture slides (PPTX)', 'Lab manual (PDF)'].map((m) => (
                  <button key={m} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-line hover:bg-subtle text-left cursor-pointer">
                    <FileText size={15} className="text-muted shrink-0" aria-hidden="true" />
                    <span className="text-sm truncate">{m}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
