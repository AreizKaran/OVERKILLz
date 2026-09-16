import { useState } from 'react'
import { BookOpen, User, Award, CalendarCheck, FileText, ChevronRight, Percent } from 'lucide-react'
import { Card, SectionHead, Badge, Bar } from '../../components/ui/Primitives'
import Modal from '../../components/ui/Modal'
import { attendanceTone } from '../../lib/hooks'
import { useAuth } from '../../lib/auth'
import { COURSES, ASSIGNMENTS } from '../../data/mock'

export default function Academics() {
  const { user } = useAuth()
  const [open, setOpen] = useState(null)
  const credits = COURSES.reduce((s, c) => s + c.credits, 0)

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {[
            { label: 'Semester', value: user.role === 'student' ? `VI · Autumn 2026` : 'Autumn 2026' },
            { label: 'Registered courses', value: COURSES.length },
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
                  <div className="text-xs text-muted tnum">{c.code} · {c.credits} credits</div>
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
