import { useState } from 'react'
import { Star, ShieldCheck, Check } from 'lucide-react'
import { BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, SectionHead, Badge, EmptyState } from '../../components/ui/Primitives'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../lib/auth'
import { FACULTY, FEEDBACK_CRITERIA } from '../../data/mock'

const AGG = FEEDBACK_CRITERIA.map((c, i) => ({ criterion: c.label, score: [4.6, 4.3, 4.7, 4.2][i] }))

function Rating({ value, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-line last:border-0">
      <span className="text-sm">{label}</span>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} role="radio" aria-checked={value === n}
            aria-label={`${n} of 5`}
            className="w-11 h-11 grid place-items-center rounded-lg hover:bg-subtle cursor-pointer">
            <Star size={19} className={n <= value ? 'fill-warn text-warn' : 'text-slate-300'} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Feedback() {
  const { user } = useAuth()
  const toast = useToast()
  const [selected, setSelected] = useState(null)
  const [scores, setScores] = useState({})
  const [done, setDone] = useState([])

  // Students submit; faculty and admin see aggregates only — never per-student rows.
  if (user.role !== 'student') {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 p-4 rounded-xl border border-brand-100 bg-brand-50">
          <ShieldCheck size={17} className="text-brand-700 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-brand-700">
            Feedback is anonymised. Aggregated scores are shown once at least five responses are recorded;
            individual responses and student identities are never exposed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <SectionHead title="Aggregate scores" sub="Autumn 2026 · 47 responses" />
            <div className="h-64 -ml-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AGG} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="criterion" width={132}
                    tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                  <RBar dataKey="score" name="Average (of 5)" fill="#2563EB" radius={[0, 5, 5, 0]} maxBarSize={26} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <SectionHead title="Overall standing" sub="Weighted across all criteria" />
            <div className="flex items-center gap-4 p-4 rounded-xl bg-subtle">
              <div className="text-4xl font-semibold tnum">4.45</div>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={15} className={n <= 4 ? 'fill-warn text-warn' : 'text-slate-300'} aria-hidden="true" />
                  ))}
                </div>
                <p className="text-xs text-muted mt-1">Department average 4.21</p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5">
              {AGG.map((a) => (
                <div key={a.criterion} className="flex justify-between text-sm">
                  <span className="text-muted">{a.criterion}</span>
                  <span className="tnum font-medium">{a.score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const submit = () => {
    setDone((d) => [...d, selected.id])
    setSelected(null); setScores({})
    toast('Feedback submitted anonymously. Thank you.')
  }

  const complete = FEEDBACK_CRITERIA.every((c) => scores[c.key])

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 rounded-xl border border-brand-100 bg-brand-50">
        <ShieldCheck size={17} className="text-brand-700 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm text-brand-700">
          Your feedback is anonymous. Faculty see aggregated scores only — your name is never attached to a response.
        </p>
      </div>

      {selected ? (
        <Card className="p-5 max-w-2xl">
          <SectionHead title={selected.name} sub={`${selected.designation} · ${selected.subjects[0]}`} />
          <div className="mt-2">
            {FEEDBACK_CRITERIA.map((c) => (
              <Rating key={c.key} label={c.label} value={scores[c.key] ?? 0}
                onChange={(n) => setScores((s) => ({ ...s, [c.key]: n }))} />
            ))}
          </div>
          <div className="mt-4">
            <label className="label" htmlFor="fb">Additional comments <span className="font-normal text-muted">(optional)</span></label>
            <textarea id="fb" rows={4} className="field py-2.5 resize-none"
              placeholder="What worked well, and what could be improved?" />
          </div>
          <div className="flex gap-2 mt-5">
            <button className="btn-ghost flex-1" onClick={() => { setSelected(null); setScores({}) }}>Cancel</button>
            <button className="btn-primary flex-1" disabled={!complete} onClick={submit}>
              {complete ? 'Submit feedback' : `Rate all ${FEEDBACK_CRITERIA.length} criteria`}
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {FACULTY.slice(0, 5).map((f) => {
            const submitted = done.includes(f.id)
            return (
              <Card key={f.id} hover={!submitted} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-navy text-white grid place-items-center text-sm font-semibold shrink-0">
                    {f.name.replace(/^(Dr|Prof)\.\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-snug truncate">{f.name}</h3>
                    <p className="text-xs text-muted truncate">{f.designation}</p>
                  </div>
                </div>
                <p className="text-xs text-muted mt-3 line-clamp-2">{f.subjects.join(' · ')}</p>
                {submitted ? (
                  <div className="mt-4"><Badge tone="ok">Feedback submitted</Badge></div>
                ) : (
                  <button onClick={() => setSelected(f)} className="btn-ghost w-full mt-4 !min-h-[40px] text-sm">
                    Give feedback
                  </button>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
