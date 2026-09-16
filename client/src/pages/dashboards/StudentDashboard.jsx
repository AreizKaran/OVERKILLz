import { Link } from 'react-router-dom'
import {
  CalendarCheck, TrendingUp, ClipboardList, FileText, ArrowRight, Clock, MapPin,
  Megaphone, Wallet, Award, CalendarDays, Inbox,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import StatCard from '../../components/ui/StatCard'
import { Card, SectionHead, Badge, ProgressRing, Bar, EmptyState, SkeletonCard } from '../../components/ui/Primitives'
import { useAuth } from '../../lib/auth'
import { useAsyncData, attendanceTone } from '../../lib/hooks'
import { COURSES, ASSIGNMENTS, NOTICES, CGPA_TREND, TIMETABLE, EXAMS } from '../../data/mock'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const STATUS = { pending: 'warn', submitted: 'info', graded: 'ok', overdue: 'bad' }

export default function StudentDashboard() {
  const { user } = useAuth()
  const { loading } = useAsyncData(true, 450)
  const today = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]
  const classes = TIMETABLE[today] ?? []
  const pending = ASSIGNMENTS.filter((a) => a.status === 'pending' || a.status === 'overdue')
  const tone = attendanceTone(user.attendance)

  return (
    <div className="space-y-5">
      {/* Identity strip */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{greeting()}, {user.name.split(' ')[0]}</h2>
        <p className="text-sm text-muted mt-1">
          Semester {user.semester} · {user.program} · <span className="tnum">{user.reg}</span>
          <span className="ml-2"><Badge tone="ok">{user.status}</Badge></span>
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard index={0} icon={CalendarCheck} label="Overall attendance" value={user.attendance} suffix="%" tone={tone.key} foot={`${tone.label} · 75% required`} />
            <StatCard index={1} icon={TrendingUp}   label="Current CGPA"      value={user.cgpa} decimals={2} tone="brand" foot="+0.19 since Sem 4" />
            <StatCard index={2} icon={ClipboardList} label="Pending assignments" value={pending.length} tone="warn" foot="1 overdue" />
            <StatCard index={3} icon={FileText}     label="Upcoming exams"    value={EXAMS.length} tone="navy" foot="From 12 Oct 2026" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Attendance */}
        <Card className="p-5 lg:col-span-1 min-w-0">
          <SectionHead title="Attendance overview" sub="Subject-wise, this semester" />
          <div className="flex justify-center py-2">
            <ProgressRing value={user.attendance} color={tone.ring} sub={tone.label} />
          </div>
          <div className="space-y-3 mt-4">
            {COURSES.slice(0, 4).map((c) => {
              const t = attendanceTone(c.attendance)
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-sm mb-1.5 gap-2">
                    <span className="truncate text-ink">{c.name}</span>
                    <span className="tnum font-medium shrink-0">{c.attendance}%</span>
                  </div>
                  <Bar value={c.attendance} tone={t.ring} />
                </div>
              )
            })}
          </div>
          <Link to="/app/attendance" className="btn-ghost w-full mt-5">
            View full attendance <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </Card>

        {/* Performance */}
        <Card className="p-5 lg:col-span-2 min-w-0">
          <SectionHead title="Academic performance" sub="CGPA and semester SGPA" />
          <div className="h-64 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CGPA_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="g-cgpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="sem" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[6.5, 9.5]} ticks={[7, 7.5, 8, 8.5, 9]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13, boxShadow: '0 6px 16px -4px rgba(15,23,42,.1)' }} />
                <Area type="monotone" dataKey="sgpa" stroke="#94A3B8" strokeWidth={2} fill="none" name="SGPA" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="cgpa" stroke="#2563EB" strokeWidth={2.5} fill="url(#g-cgpa)" name="CGPA" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted mt-2 pl-2">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-brand rounded" aria-hidden="true" /> CGPA</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-400 rounded" aria-hidden="true" /> SGPA</span>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Today */}
        <Card className="p-5 min-w-0">
          <SectionHead title="Today's schedule" sub={today} />
          {classes.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No classes scheduled today"
              body="Enjoy the break — your next class is on Monday."
              action={<Link to="/app/timetable" className="btn-ghost">Open timetable</Link>} />
          ) : (
            <div className="space-y-2.5">
              {classes.map((c) => (
                <div key={c.t + c.c} className="flex gap-3 p-3 rounded-lg border border-line hover:bg-subtle/60 transition">
                  <div className="text-sm font-semibold tnum text-brand shrink-0 w-12">{c.t}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{c.n}</div>
                    <div className="text-xs text-muted flex items-center gap-2.5 mt-0.5">
                      <span className="tnum">{c.c}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} aria-hidden="true" />{c.r}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Assignments */}
        <Card className="p-5 min-w-0">
          <SectionHead title="Assignments" sub={`${pending.length} need attention`}
            action={<Link to="/app/assignments" className="text-sm text-brand hover:underline inline-flex items-center min-h-[44px] px-2 -mr-2">All</Link>} />
          {ASSIGNMENTS.length === 0 ? (
            <EmptyState icon={Inbox} title="You're all caught up" body="No assignments are pending." />
          ) : (
            <div className="space-y-2.5">
              {ASSIGNMENTS.slice(0, 4).map((a) => (
                <div key={a.id} className="p-3 rounded-lg border border-line">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium leading-snug">{a.title}</span>
                    <Badge tone={STATUS[a.status]}>{a.status}</Badge>
                  </div>
                  <div className="text-xs text-muted mt-1.5 flex items-center gap-1.5">
                    <Clock size={11} aria-hidden="true" />
                    Due {new Date(a.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {a.course}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notices */}
        <Card className="p-5 min-w-0">
          <SectionHead title="Recent notices" sub="From across the institute"
            action={<Link to="/app/notices" className="text-sm text-brand hover:underline inline-flex items-center min-h-[44px] px-2 -mr-2">All</Link>} />
          <div className="space-y-2.5">
            {NOTICES.slice(0, 4).map((n) => (
              <Link to="/app/notices" key={n.id} className="block p-3 rounded-lg border border-line hover:bg-subtle/60 transition">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-snug line-clamp-2">{n.title}</span>
                  {n.priority === 'high' && <Badge tone="bad">Priority</Badge>}
                </div>
                <div className="text-xs text-muted mt-1.5">
                  {n.dept} · {new Date(n.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="p-5 min-w-0">
        <SectionHead title="Quick actions" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { to: '/app/attendance',  icon: CalendarCheck,  label: 'Attendance' },
            { to: '/app/assignments', icon: ClipboardList,  label: 'Assignments' },
            { to: '/app/results',     icon: Award,          label: 'Results' },
            { to: '/app/timetable',   icon: CalendarDays,   label: 'Timetable' },
            { to: '/app/fees',        icon: Wallet,         label: 'Fees' },
            { to: '/app/notices',     icon: Megaphone,      label: 'Notices' },
          ].map((q) => (
            <Link key={q.to} to={q.to}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-line
                         hover:border-brand hover:bg-brand-50 transition duration-200 min-h-[88px] group">
              <q.icon size={19} className="text-muted group-hover:text-brand transition" aria-hidden="true" />
              <span className="text-xs font-medium text-center">{q.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
