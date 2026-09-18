import { Download, FileBarChart, TrendingUp } from 'lucide-react'
import { BarChart, Bar as RBar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, SectionHead } from '../../components/ui/Primitives'
import { useToast } from '../../components/ui/Toast'
import { DEPT_ATTENDANCE, ENROLMENT_TREND } from '../../data/mock'

const REPORTS = [
  { name: 'Attendance summary', desc: 'Department and subject-wise, current semester', fmt: 'XLSX' },
  { name: 'Academic performance', desc: 'SGPA/CGPA distribution by department', fmt: 'PDF' },
  { name: 'Fee collection register', desc: 'Head-wise realisation and outstanding', fmt: 'XLSX' },
  { name: 'Examination results', desc: 'Consolidated statement of marks', fmt: 'PDF' },
  { name: 'Faculty feedback digest', desc: 'Aggregated and anonymised scores', fmt: 'PDF' },
  { name: 'Enrolment statistics', desc: 'Year-on-year admissions by programme', fmt: 'XLSX' },
]

export default function Reports() {
  const toast = useToast()
  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionHead title="Attendance by department" sub="Current semester average" />
          <div className="h-56 -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_ATTENDANCE} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <RBar dataKey="pct" name="Attendance %" fill="#4F46E5" radius={[5, 5, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionHead title="Enrolment trend" sub="On-roll students by academic year" />
          <div className="h-56 -ml-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ENROLMENT_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[3200, 4400]} ticks={[3200, 3600, 4000, 4400]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Line type="monotone" dataKey="students" name="Students" stroke="#312E81" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionHead title="Generate report" sub="Exports reflect the current filter selection" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORTS.map((r) => (
            <button key={r.name} onClick={() => toast(`${r.name} (${r.fmt}) queued for download.`)}
              className="flex items-start gap-3 p-4 rounded-xl border border-line hover:border-brand hover:bg-brand-50/50 transition text-left cursor-pointer">
              <span className="w-9 h-9 rounded-lg bg-subtle grid place-items-center shrink-0">
                <FileBarChart size={16} className="text-muted" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-muted mt-0.5 line-clamp-2">{r.desc}</div>
                <div className="text-[11px] text-brand font-medium mt-1.5 flex items-center gap-1">
                  <Download size={10} aria-hidden="true" /> {r.fmt}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
