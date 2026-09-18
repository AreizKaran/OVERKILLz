import { useState } from 'react'
import { Star, ShieldCheck, Check, BookOpen, UserRound, Download } from 'lucide-react'
import { BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, SectionHead, Badge, EmptyState } from '../../components/ui/Primitives'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../lib/auth'
import { FEEDBACK_CRITERIA, SUBJECT_FEEDBACK_CRITERIA, SUBJECT_FEEDBACK } from '../../data/mock'
import { downloadCSV } from '../../lib/export'
import { source, mutate } from '../../data/source'
import { useResource, useMutation } from '../../lib/hooks'

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
  const [mode, setMode] = useState('faculty')   // faculty | subject
  const { data: facultyList } = useResource(source.faculty)
  const FACULTY = facultyList ?? []

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

        <Card className="p-5">
          <SectionHead title="Per-subject feedback" sub="Every registered subject, rated separately from its teacher"
            action={
              <button onClick={() => { downloadCSV('subject-feedback', [
                  { label: 'Code', value: 'code' }, { label: 'Subject', value: 'name' },
                  { label: 'Responses', value: 'responses' },
                  ...SUBJECT_FEEDBACK_CRITERIA.map((c) => ({ label: c.label, value: c.key })),
                  { label: 'Average', value: (r) => (SUBJECT_FEEDBACK_CRITERIA.reduce((a, c) => a + r[c.key], 0) / 4).toFixed(2) },
                ], SUBJECT_FEEDBACK); toast('Subject feedback exported as CSV.') }}
                className="btn-ghost !min-h-[40px] text-xs">
                <Download size={14} aria-hidden="true" /> Export
              </button>}
          />
          <div className="hidden md:block overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-line">
                  <th scope="col" className="font-medium py-2.5 pr-4">Subject</th>
                  {SUBJECT_FEEDBACK_CRITERIA.map((c) => (
                    <th key={c.key} scope="col" className="font-medium py-2.5 pr-4">{c.label}</th>
                  ))}
                  <th scope="col" className="font-medium py-2.5 pr-4">Average</th>
                </tr>
              </thead>
              <tbody>
                {SUBJECT_FEEDBACK.map((r) => {
                  const avg = SUBJECT_FEEDBACK_CRITERIA.reduce((a, c) => a + r[c.key], 0) / 4
                  return (
                    <tr key={r.code} className="border-b border-line last:border-0 hover:bg-subtle/50">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted tnum">{r.code} · {r.responses} responses</div>
                      </td>
                      {SUBJECT_FEEDBACK_CRITERIA.map((c) => (
                        <td key={c.key} className="py-3 pr-4 tnum">{r[c.key].toFixed(1)}</td>
                      ))}
                      <td className="py-3 pr-4">
                        <Badge tone={avg >= 4.3 ? 'ok' : avg >= 3.8 ? 'warn' : 'bad'} icon={false}>
                          {avg.toFixed(2)}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {SUBJECT_FEEDBACK.map((r) => {
              const avg = SUBJECT_FEEDBACK_CRITERIA.reduce((a, c) => a + r[c.key], 0) / 4
              return (
                <div key={r.code} className="p-4 rounded-xl border border-line">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium leading-snug">{r.name}</div>
                      <div className="text-xs text-muted tnum mt-0.5">{r.code} · {r.responses} responses</div>
                    </div>
                    <Badge tone={avg >= 4.3 ? 'ok' : avg >= 3.8 ? 'warn' : 'bad'} icon={false}>{avg.toFixed(2)}</Badge>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 mt-3">
                    {SUBJECT_FEEDBACK_CRITERIA.map((c) => (
                      <div key={c.key} className="bg-subtle rounded-lg px-2.5 py-2">
                        <dt className="text-[11px] text-muted leading-tight">{c.label}</dt>
                        <dd className="tnum font-semibold text-sm mt-0.5">{r[c.key].toFixed(1)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )
            })}
          </div>
        </Card>

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
                  <RBar dataKey="score" name="Average (of 5)" fill="#4F46E5" radius={[0, 5, 5, 0]} maxBarSize={26} />
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

  const sending = useMutation((payload) => mutate.submitFeedback(payload),
    { onSuccess: () => toast('Feedback submitted anonymously. Thank you.'),
      onError: (m) => toast(m, 'error') })

  const submit = async () => {
    const f = selected
    const ok = await sending.run({ [mode === 'subject' ? 'course' : 'faculty']: f.id, semester: 6, scores })
    if (ok) { setDone((d) => [...d, f.id]); setSelected(null); setScores({}) }
  }

  const criteria = mode === 'subject' ? SUBJECT_FEEDBACK_CRITERIA : FEEDBACK_CRITERIA
  const complete = criteria.every((c) => scores[c.key])

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 rounded-xl border border-brand-100 bg-brand-50">
        <ShieldCheck size={17} className="text-brand-700 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm text-brand-700">
          Your feedback is anonymous. Faculty see aggregated scores only — your name is never attached to a response.
        </p>
      </div>

      {/* Faculty or subject — two different things students are asked about */}
      <div className="flex gap-1.5" role="group" aria-label="Feedback type">
        {[
          { k: 'faculty', label: 'Faculty feedback', Icon: UserRound },
          { k: 'subject', label: 'Subject feedback', Icon: BookOpen },
        ].map(({ k, label, Icon }) => (
          <button key={k} onClick={() => { setMode(k); setSelected(null); setScores({}) }} aria-pressed={mode === k}
            className={`inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-lg text-sm font-medium border transition cursor-pointer
              ${mode === k ? 'border-brand bg-brand-50 text-brand-700' : 'border-line bg-surface text-muted hover:border-slate-300'}`}>
            <Icon size={15} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {selected ? (
        <Card className="p-5 max-w-2xl">
          <SectionHead title={selected.name}
            sub={mode === 'subject' ? `${selected.code} · rate the subject, not the teacher`
                                    : `${selected.designation} · ${selected.subjects?.[0] ?? ''}`} />
          <div className="mt-2">
            {(mode === 'subject' ? SUBJECT_FEEDBACK_CRITERIA : FEEDBACK_CRITERIA).map((c) => (
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
            <button className="btn-primary flex-1" disabled={!complete || sending.pending} onClick={submit}>
              {sending.pending ? 'Submitting…' : complete ? 'Submit feedback' : `Rate all ${criteria.length} criteria`}
            </button>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {(mode === 'subject'
            ? SUBJECT_FEEDBACK.map((x) => ({ id: x.code, code: x.code, name: x.name, designation: `${x.responses} responses`, subjects: [] }))
            : FACULTY.slice(0, 5)
          ).map((f) => {
            const submitted = done.includes(f.id)
            return (
              <Card key={f.id} hover={!submitted} className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 grid place-items-center text-white text-xs font-semibold shrink-0
                    ${mode === 'subject' ? 'rounded-xl bg-brand tnum' : 'rounded-full bg-navy text-sm'}`}>
                    {mode === 'subject'
                      ? f.code.slice(-4)
                      : f.name.replace(/^(Dr|Prof)\.\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-snug truncate">{f.name}</h3>
                    <p className="text-xs text-muted truncate">{f.designation}</p>
                  </div>
                </div>
                <p className="text-xs text-muted mt-3 line-clamp-2">
                  {mode === 'subject' ? 'Rate coverage, pace, material and relevance' : f.subjects.join(' · ')}
                </p>
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
