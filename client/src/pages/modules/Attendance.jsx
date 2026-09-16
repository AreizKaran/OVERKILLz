import { Card, SectionHead, Badge, ProgressRing, Bar, ErrorState, Skeleton } from '../../components/ui/Primitives'
import { BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { attendanceTone } from '../../lib/hooks'
import { useAuth } from '../../lib/auth'
import { ATTENDANCE_MONTHS } from '../../data/mock'
import { source } from '../../data/source'
import { useResource } from '../../lib/hooks'
import { AlertTriangle } from 'lucide-react'

export default function Attendance() {
  const { user } = useAuth()
  const { loading, error, data, reload } = useResource(() => source.attendance(user.id), [user.id])

  if (loading) return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="p-5 h-80 grid place-items-center"><Skeleton className="w-40 h-40 rounded-full" /></Card>
      <Card className="p-5 lg:col-span-2 h-80"><Skeleton className="h-full w-full" /></Card>
    </div>
  )
  if (error) return <Card><ErrorState message={error} onRetry={reload} /></Card>

  const COURSES = data.courses
  const overall = data.overall
  const tone = attendanceTone(overall)
  const atRisk = COURSES.filter((c) => c.attendance < 75)

  return (
    <div className="space-y-5">
      {atRisk.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-warn/30 bg-warn-50">
          <AlertTriangle size={17} className="text-warn-700 mt-0.5 shrink-0" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-medium text-warn-700">Attendance below the 75% requirement</p>
            <p className="text-warn-700 mt-0.5">
              {atRisk.map((c) => c.name).join(', ')} — condonation must be approved before 25 September 2026.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 flex flex-col items-center justify-center">
          <ProgressRing value={overall} size={168} stroke={13} color={tone.ring} sub="attended" />
          <div className="mt-4 text-center">
            <Badge tone={tone.key}>{tone.label}</Badge>
            <p className="text-xs text-muted mt-2">Aggregate across {COURSES.length} courses · 75% required</p>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2 min-w-0">
          <SectionHead title="Monthly attendance" sub="Percentage of classes attended" />
          <div className="h-60 -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ATTENDANCE_MONTHS} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="4 4"
                  label={{ value: 'Required 75%', position: 'insideTopLeft', fontSize: 11, fill: '#EF4444' }} />
                <RBar dataKey="pct" name="Attendance %" radius={[5, 5, 0, 0]} maxBarSize={44}>
                  {ATTENDANCE_MONTHS.map((m) => (
                    <Cell key={m.month} fill={m.pct >= 80 ? '#10B981' : m.pct >= 75 ? '#F59E0B' : '#EF4444'} />
                  ))}
                </RBar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionHead title="Subject-wise attendance" sub="Classes attended out of classes held" />
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
          {COURSES.map((c) => {
            const t = attendanceTone(c.attendance)
            const held = c.held ?? 0
            const attended = c.attended ?? 0
            return (
              <div key={c.id} className="min-w-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted tnum mt-0.5">{c.code} · {attended}/{held} classes</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="tnum text-sm font-semibold">{c.attendance}%</span>
                    <Badge tone={t.key} icon={false}>{t.label}</Badge>
                  </div>
                </div>
                <Bar value={c.attendance} tone={t.ring} />
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
