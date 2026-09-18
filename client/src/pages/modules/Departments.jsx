import { useState } from 'react'
import { Building2, Users, GraduationCap, BookOpen, MapPin, Search } from 'lucide-react'
import { BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, SectionHead, Badge, EmptyState } from '../../components/ui/Primitives'
import Modal from '../../components/ui/Modal'
import { DEPARTMENTS } from '../../data/mock'

export default function Departments() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)

  const rows = DEPARTMENTS.filter((d) =>
    !q || d.name.toLowerCase().includes(q.toLowerCase()) || d.code.toLowerCase().includes(q.toLowerCase()))

  const chart = DEPARTMENTS.filter((d) => d.students > 0).map((d) => ({ dept: d.code, students: d.students, faculty: d.faculty }))
  const totals = DEPARTMENTS.reduce((a, d) => ({
    faculty: a.faculty + d.faculty, students: a.students + d.students, courses: a.courses + d.courses,
  }), { faculty: 0, students: 0, courses: 0 })

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Building2,     label: 'Departments', value: DEPARTMENTS.length },
          { icon: GraduationCap, label: 'Faculty',     value: totals.faculty },
          { icon: Users,         label: 'Students',    value: totals.students },
          { icon: BookOpen,      label: 'Courses',     value: totals.courses },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm text-muted font-medium">{s.label}</span>
              <span className="w-8 h-8 shrink-0 rounded-lg bg-navy-50 text-navy grid place-items-center">
                <s.icon size={16} strokeWidth={2.2} aria-hidden="true" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-semibold tnum">{s.value.toLocaleString('en-IN')}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <SectionHead title="Students and faculty by department" sub="Current session" />
        <div className="h-64 -ml-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={46} />
              <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
              <RBar dataKey="students" name="Students" fill="#4F46E5" radius={[5, 5, 0, 0]} maxBarSize={30} />
              <RBar dataKey="faculty"  name="Faculty"  fill="#C026D3" radius={[5, 5, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-5 text-xs text-muted mt-2 pl-2">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand" aria-hidden="true" /> Students</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent" aria-hidden="true" /> Faculty</span>
        </div>
      </Card>

      <div className="relative sm:max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} className="field pl-9"
          placeholder="Search departments" aria-label="Search departments" />
      </div>

      {rows.length === 0 ? (
        <Card><EmptyState icon={Building2} title="No departments found" body={`Nothing matches “${q}”.`}
          action={<button className="btn-ghost" onClick={() => setQ('')}>Clear search</button>} /></Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((d) => (
            <Card key={d.id} hover className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge tone="info" icon={false}>{d.code}</Badge>
                  <h3 className="font-semibold mt-2 leading-snug">{d.name}</h3>
                </div>
                <span className="w-9 h-9 rounded-lg bg-navy-50 grid place-items-center shrink-0">
                  <Building2 size={16} className="text-navy" aria-hidden="true" />
                </span>
              </div>

              <p className="text-sm text-muted mt-3">HOD · {d.hod}</p>
              <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                <MapPin size={11} aria-hidden="true" /> {d.block} · established {d.established}
              </p>

              <div className="grid grid-cols-3 gap-2 mt-4">
                {[['Faculty', d.faculty], ['Students', d.students], ['Courses', d.courses]].map(([k, v]) => (
                  <div key={k} className="bg-subtle rounded-lg py-2 text-center">
                    <div className="text-xs text-muted">{k}</div>
                    <div className="tnum font-semibold text-sm mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => setOpen(d)} className="btn-ghost w-full mt-4 !min-h-[40px] text-sm">View department</button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''} size="lg">
        {open && (
          <div className="space-y-5">
            <dl className="grid sm:grid-cols-2 gap-3">
              {[['Code', open.code], ['Head of Department', open.hod], ['Block', open.block],
                ['Established', open.established], ['Faculty strength', open.faculty],
                ['Students on roll', open.students], ['Courses offered', open.courses]].map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg bg-subtle">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="text-sm font-medium mt-0.5 tnum">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <SectionHead title="Student to faculty ratio" />
              <p className="text-2xl font-semibold tnum">
                {open.students > 0 ? `${Math.round(open.students / open.faculty)}:1` : '—'}
              </p>
              <p className="text-xs text-muted mt-1">
                {open.students > 0 ? 'AICTE norm for engineering programmes is 20:1.'
                                   : 'This department supports other programmes and has no students on roll.'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
