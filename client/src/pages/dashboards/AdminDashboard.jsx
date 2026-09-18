import { useState } from 'react'
import { Users, GraduationCap, BookOpen, CalendarCheck, IndianRupee, Inbox, UserPlus, Wallet, Megaphone, FileCheck2, CalendarClock } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar as RBar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatCard from '../../components/ui/StatCard'
import { Card, SectionHead, ErrorState, SkeletonCard } from '../../components/ui/Primitives'
import { ENROLMENT_TREND, DEPT_ATTENDANCE, FEE_SPLIT, ACTIVITY } from '../../data/mock'
import { source } from '../../data/source'
import { useResource } from '../../lib/hooks'

const ICONS = { attendance: CalendarCheck, fee: Wallet, notice: Megaphone, assignment: FileCheck2, student: UserPlus }

const FILTERS = {
  Department: ['All departments', 'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT'],
  Semester:   ['All semesters', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
  Year:       ['2026-27', '2025-26', '2024-25'],
}

export default function AdminDashboard() {
  const [filters, setFilters] = useState({ Department: 'All departments', Semester: 'All semesters', Year: '2026-27' })
  const { loading, error, data: ADMIN_KPIS, reload } = useResource(source.stats)

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Institute overview</h2>
          <p className="text-sm text-muted mt-1">Autumn Semester 2026 · updated 12 minutes ago</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(FILTERS).map(([k, opts]) => (
            <label key={k} className="relative">
              <span className="sr-only">{k}</span>
              <select value={filters[k]} onChange={(e) => setFilters((f) => ({ ...f, [k]: e.target.value }))}
                className="field !min-h-[40px] !w-auto pr-8 text-sm cursor-pointer">
                {opts.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>

      {error ? <Card><ErrorState message={error} onRetry={reload} /></Card> : loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard index={0} icon={Users}         label="Total students" value={ADMIN_KPIS.students} tone="brand" foot="+77 this year" />
        <StatCard index={1} icon={GraduationCap} label="Total faculty"  value={ADMIN_KPIS.faculty}  tone="violet"  foot="Across 9 departments" />
        <StatCard index={2} icon={BookOpen}      label="Active courses" value={ADMIN_KPIS.courses}  tone="accent" foot="Autumn 2026" />
        <StatCard index={3} icon={CalendarCheck} label="Attendance rate" value={ADMIN_KPIS.attendance} decimals={1} suffix="%" tone="ok" foot="Institute average" />
        <StatCard index={4} icon={IndianRupee}   label="Fee collection" value={ADMIN_KPIS.collected} decimals={2} suffix=" Cr" tone="navy" foot="81% of demand" />
        <StatCard index={5} icon={Inbox}         label="Pending requests" value={ADMIN_KPIS.pending} tone="warn" foot="Needs action" />
      </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionHead title="Student enrolment" sub="Total on-roll students by academic year" />
          <div className="h-64 -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ENROLMENT_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="g-enrol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#312E81" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#312E81" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[3200, 4400]} ticks={[3200, 3600, 4000, 4400]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Area type="monotone" dataKey="students" name="Students" stroke="#312E81" strokeWidth={2.5} fill="url(#g-enrol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHead title="Attendance by department" sub="75% is the condonation threshold" />
          <div className="h-64 -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_ATTENDANCE} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <RBar dataKey="pct" name="Attendance %" radius={[5, 5, 0, 0]} maxBarSize={48}>
                  {DEPT_ATTENDANCE.map((d) => (
                    <Cell key={d.dept} fill={d.pct >= 80 ? '#10B981' : d.pct >= 75 ? '#F59E0B' : '#EF4444'} />
                  ))}
                </RBar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5">
          <SectionHead title="Fee analytics" sub="₹ lakh, current session" />
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={FEE_SPLIT} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2}>
                  {FEE_SPLIT.map((s) => <Cell key={s.name} fill={s.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v} L`} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Legend verticalAlign="bottom" height={28} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionHead title="Recent activity" sub="System-wide audit trail" />
          <div className="divide-y divide-line -my-1">
            {ACTIVITY.map((a) => {
              const Icon = ICONS[a.type] ?? CalendarClock
              return (
                <div key={a.id} className="flex items-center gap-3 py-3">
                  <span className="w-8 h-8 rounded-lg bg-subtle grid place-items-center shrink-0">
                    <Icon size={15} className="text-muted" aria-hidden="true" />
                  </span>
                  <p className="text-sm min-w-0 flex-1">
                    <span className="font-medium">{a.who}</span>{' '}
                    <span className="text-muted">{a.what}</span>
                  </p>
                  <span className="text-xs text-muted shrink-0">{a.when}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
