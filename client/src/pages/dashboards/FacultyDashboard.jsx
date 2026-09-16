import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, CalendarClock, ClipboardCheck, MapPin, Check, X, Clock3, Upload, Award, ArrowRight } from 'lucide-react'
import { BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import StatCard from '../../components/ui/StatCard'
import { Card, SectionHead, Badge, EmptyState } from '../../components/ui/Primitives'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../lib/auth'
import { FACULTY_CLASSES, ROSTER, COURSES } from '../../data/mock'

const GRADE_SPREAD = [
  { band: 'O (90+)', n: 8 }, { band: 'A+ (80-89)', n: 17 }, { band: 'A (70-79)', n: 21 },
  { band: 'B (60-69)', n: 11 }, { band: 'C (50-59)', n: 4 }, { band: 'F (<50)', n: 1 },
]

export default function FacultyDashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [marking, setMarking] = useState(null)
  const [marks, setMarks] = useState({})

  const openMarking = (cls) => {
    setMarking(cls)
    setMarks(Object.fromEntries(ROSTER.map((s) => [s.id, 'present'])))
  }

  const setOne = (id, v) => setMarks((m) => ({ ...m, [id]: v }))

  const save = () => {
    const present = Object.values(marks).filter((v) => v === 'present').length
    setMarking(null)
    toast(`Attendance updated — ${present}/${ROSTER.length} present in ${marking.course}.`)
  }

  const counts = Object.values(marks).reduce((a, v) => ({ ...a, [v]: (a[v] || 0) + 1 }), {})

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Good morning, {user.name.split(' ')[1]}</h2>
        <p className="text-sm text-muted mt-1">{user.designation} · {user.dept} · Cabin {user.cabin}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard index={0} icon={BookOpen}       label="Assigned courses"   value={2}   tone="brand" foot="Autumn 2026" />
        <StatCard index={1} icon={Users}          label="Total students"     value={120} tone="navy"  foot="Across both sections" />
        <StatCard index={2} icon={CalendarClock}  label="Today's classes"    value={2}   tone="accent" foot="1 attendance pending" />
        <StatCard index={3} icon={ClipboardCheck} label="Pending evaluations" value={38} tone="warn"  foot="AVL Tree submissions" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <SectionHead title="Today's classes" sub="Mark attendance in a couple of taps" />
          <div className="space-y-3">
            {FACULTY_CLASSES.map((c) => (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-line">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{c.name}</span>
                    {c.marked ? <Badge tone="ok">Marked</Badge> : <Badge tone="warn">Pending</Badge>}
                  </div>
                  <div className="text-xs text-muted mt-1 flex items-center gap-3 flex-wrap">
                    <span className="tnum">{c.course}</span>
                    <span className="flex items-center gap-1"><Clock3 size={11} aria-hidden="true" />{c.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} aria-hidden="true" />{c.room}</span>
                    <span className="flex items-center gap-1"><Users size={11} aria-hidden="true" />{c.students}</span>
                  </div>
                </div>
                <button onClick={() => openMarking(c)} className={c.marked ? 'btn-ghost shrink-0' : 'btn-primary shrink-0'}>
                  {c.marked ? 'Edit attendance' : 'Mark attendance'}
                </button>
              </div>
            ))}
          </div>

          <SectionHead title="Student performance" sub="CS1601 — internal assessment spread" />
          <div className="h-56 -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GRADE_SPREAD} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="band" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <RBar dataKey="n" name="Students" fill="#2563EB" radius={[5, 5, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <SectionHead title="Pending tasks" />
            <div className="space-y-2.5">
              {[
                { label: 'AVL Tree — 38 submissions to evaluate', tone: 'warn', to: '/app/assignments' },
                { label: 'CS1605 internal marks not entered',     tone: 'bad',  to: '/app/marks' },
                { label: 'Semester feedback awaiting review',      tone: 'info', to: '/app/feedback' },
                { label: 'Lab reschedule notice to publish',       tone: 'info', to: '/app/notices' },
              ].map((t) => (
                <Link to={t.to} key={t.label}
                  className="flex items-center justify-between gap-2 p-3 rounded-lg border border-line hover:bg-subtle/60 transition">
                  <span className="text-sm leading-snug">{t.label}</span>
                  <ArrowRight size={14} className="text-muted shrink-0" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHead title="Quick actions" />
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => openMarking(FACULTY_CLASSES[1])} className="btn-ghost flex-col !min-h-[76px] gap-1.5">
                <ClipboardCheck size={17} aria-hidden="true" /><span className="text-xs">Mark attendance</span>
              </button>
              <button onClick={() => toast('Assignment draft created.', 'info')} className="btn-ghost flex-col !min-h-[76px] gap-1.5">
                <Upload size={17} aria-hidden="true" /><span className="text-xs">Upload work</span>
              </button>
              <Link to="/app/marks" className="btn-ghost flex-col !min-h-[76px] gap-1.5">
                <Award size={17} aria-hidden="true" /><span className="text-xs">Enter marks</span>
              </Link>
              <Link to="/app/students" className="btn-ghost flex-col !min-h-[76px] gap-1.5">
                <Users size={17} aria-hidden="true" /><span className="text-xs">View students</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Minimal-click attendance marking (§12) */}
      <Modal open={!!marking} onClose={() => setMarking(null)} size="lg"
        title={marking ? `${marking.course} · ${marking.name}` : ''}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setMarking(null)}>Cancel</button>
            <button className="btn-primary" onClick={save}>Save attendance</button>
          </>
        }>
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex gap-2 flex-wrap">
            <Badge tone="ok">{counts.present ?? 0} present</Badge>
            <Badge tone="bad">{counts.absent ?? 0} absent</Badge>
            <Badge tone="warn">{counts.late ?? 0} late</Badge>
          </div>
          <button onClick={() => setMarks(Object.fromEntries(ROSTER.map((s) => [s.id, 'present'])))}
            className="text-brand hover:underline text-sm cursor-pointer">Mark all present</button>
        </div>
        <div className="space-y-1.5">
          {ROSTER.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-subtle/60">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{s.name}</div>
                <div className="text-xs text-muted tnum">{s.reg} · {s.att}% overall</div>
              </div>
              <div className="flex gap-1 shrink-0" role="group" aria-label={`Attendance for ${s.name}`}>
                {[
                  { k: 'present', Icon: Check,  on: 'bg-ok text-white' },
                  { k: 'late',    Icon: Clock3, on: 'bg-warn text-white' },
                  { k: 'absent',  Icon: X,      on: 'bg-bad text-white' },
                ].map(({ k, Icon, on }) => (
                  <button key={k} onClick={() => setOne(s.id, k)} aria-label={k} aria-pressed={marks[s.id] === k}
                    className={`w-11 h-11 grid place-items-center rounded-lg border transition cursor-pointer
                      ${marks[s.id] === k ? on + ' border-transparent' : 'border-line text-muted hover:bg-subtle'}`}>
                    <Icon size={15} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
