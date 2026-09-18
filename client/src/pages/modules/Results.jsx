import { Award, TrendingUp, Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, SectionHead, Badge, ProgressRing, ErrorState, Skeleton } from '../../components/ui/Primitives'
import { CGPA_TREND } from '../../data/mock'
import { source } from '../../data/source'
import { useResource } from '../../lib/hooks'
import { useAuth } from '../../lib/auth'

const GRADE_TONE = { 'A+': 'ok', A: 'ok', 'B+': 'info', B: 'info', C: 'warn', F: 'bad' }

export default function Results() {
  const { user } = useAuth()
  const { loading, error, data, reload } = useResource(() => source.results(user.id), [user.id])

  if (loading) return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="p-5 h-72 grid place-items-center"><Skeleton className="w-36 h-36 rounded-full" /></Card>
      <Card className="p-5 lg:col-span-2 h-72"><Skeleton className="h-full w-full" /></Card>
    </div>
  )
  if (error) return <Card><ErrorState message={error} onRetry={reload} /></Card>

  const RESULTS = data.results
  const credits = data.credits
  const sgpa = 8.81

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 flex flex-col items-center justify-center">
          <ProgressRing value={(8.24 / 10) * 100} size={156} stroke={12} color="#4F46E5" label="8.24" sub="Cumulative GPA" />
          <div className="flex gap-6 mt-5 text-center">
            <div><div className="text-lg font-semibold tnum">{sgpa}</div><div className="text-xs text-muted">Sem V SGPA</div></div>
            <div><div className="text-lg font-semibold tnum">{credits}</div><div className="text-xs text-muted">Credits earned</div></div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionHead title="CGPA progression" sub="Cumulative across five completed semesters" />
          <div className="h-64 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CGPA_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="sem" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[6.5, 9.5]} ticks={[7, 7.5, 8, 8.5, 9]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Line type="monotone" dataKey="cgpa" name="CGPA" stroke="#4F46E5" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4F46E5' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionHead title="Semester V — statement of marks" sub="Published 18 August 2026"
          action={<button className="btn-ghost !min-h-[38px] text-xs"><Download size={14} aria-hidden="true" /> Download</button>} />

        <div className="hidden md:block overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                {['Code', 'Subject', 'Internal', 'External', 'Total', 'Grade', 'Credits'].map((h) => (
                  <th key={h} scope="col" className="font-medium py-2.5 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESULTS.map((r) => (
                <tr key={r.code} className="border-b border-line last:border-0 hover:bg-subtle/50">
                  <td className="py-3 pr-4 tnum text-muted">{r.code}</td>
                  <td className="py-3 pr-4 font-medium">{r.name}</td>
                  <td className="py-3 pr-4 tnum">{r.internal}</td>
                  <td className="py-3 pr-4 tnum">{r.external}</td>
                  <td className="py-3 pr-4 tnum font-semibold">{r.total}</td>
                  <td className="py-3 pr-4"><Badge tone={GRADE_TONE[r.grade]} icon={false}>{r.grade}</Badge></td>
                  <td className="py-3 pr-4 tnum">{r.credits}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td colSpan={4} className="py-3 text-right pr-4 text-muted">Total credits</td>
                <td className="py-3 pr-4 tnum">{credits}</td>
                <td colSpan={2} className="py-3 tnum">SGPA {sgpa}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {RESULTS.map((r) => (
            <div key={r.code} className="p-4 rounded-xl border border-line">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium leading-snug">{r.name}</div>
                  <div className="text-xs text-muted tnum mt-0.5">{r.code} · {r.credits} credits</div>
                </div>
                <Badge tone={GRADE_TONE[r.grade]} icon={false}>{r.grade}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                {[['Internal', r.internal], ['External', r.external], ['Total', r.total]].map(([k, v]) => (
                  <div key={k} className="bg-subtle rounded-lg py-2">
                    <div className="text-xs text-muted">{k}</div>
                    <div className="tnum font-semibold text-sm mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-between p-4 rounded-xl bg-navy text-white text-sm font-medium">
            <span>Semester V SGPA</span><span className="tnum">{sgpa}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
