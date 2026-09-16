import { useMemo, useState } from 'react'
import { ClipboardList, Clock, Upload, Inbox, Search, Plus } from 'lucide-react'
import { Card, SectionHead, Badge, EmptyState, ErrorState, Skeleton } from '../../components/ui/Primitives'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../lib/auth'
import { useResource } from '../../lib/hooks'
import { source } from '../../data/source'

const TONE = { pending: 'warn', submitted: 'info', graded: 'ok', overdue: 'bad', late: 'bad' }
const TABS = ['All', 'Pending', 'Submitted', 'Graded', 'Overdue']

export default function Assignments() {
  const { user } = useAuth()
  const toast = useToast()
  const isFaculty = user.role !== 'student'
  const { loading, error, data, reload } = useResource(source.assignments)
  const [tab, setTab] = useState('All')
  const [q, setQ] = useState('')
  const [submit, setSubmit] = useState(null)
  const [create, setCreate] = useState(false)

  const rows = useMemo(() => {
    if (!data) return []
    return data.filter((a) => {
      const byTab = tab === 'All' || a.status === tab.toLowerCase()
      const byQ = !q || a.title.toLowerCase().includes(q.toLowerCase()) || a.courseName.toLowerCase().includes(q.toLowerCase())
      return byTab && byQ
    })
  }, [data, tab, q])

  const doSubmit = () => { const t = submit.title; setSubmit(null); toast(`“${t}” submitted successfully.`) }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 flex-1">
          {TABS.map((t) => {
            const n = t === 'All' ? (data?.length ?? 0) : (data ?? []).filter((a) => a.status === t.toLowerCase()).length
            return (
              <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}
                className={`shrink-0 min-h-[40px] px-3.5 rounded-lg text-sm font-medium border transition cursor-pointer
                  ${tab === t ? 'border-brand bg-brand-50 text-brand-700' : 'border-line bg-surface text-muted hover:border-slate-300'}`}>
                {t} <span className="tnum opacity-60">{n}</span>
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search assignments"
              aria-label="Search assignments" className="field pl-9" />
          </div>
          {isFaculty && (
            <button onClick={() => setCreate(true)} className="btn-primary shrink-0">
              <Plus size={16} aria-hidden="true" /> <span className="hidden sm:inline">Create</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-2 w-full" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={reload} /></Card>
      ) : rows.length === 0 ? (
        <Card><EmptyState icon={Inbox} title="No assignments here"
          body={q ? `Nothing matches “${q}”.` : `You have no ${tab.toLowerCase()} assignments.`}
          action={q ? <button className="btn-ghost" onClick={() => setQ('')}>Clear search</button> : null} /></Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((a) => {
            const overdue = a.status === 'overdue'
            return (
              <Card key={a.id} hover className="p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold leading-snug">{a.title}</h3>
                  <Badge tone={TONE[a.status]}>{a.status}</Badge>
                </div>
                <p className="text-sm text-muted mt-1.5 truncate">{a.courseName}</p>
                <p className="text-xs text-muted mt-0.5">{a.faculty}</p>

                <div className={`flex items-center gap-1.5 text-xs mt-3 ${overdue ? 'text-bad-700 font-medium' : 'text-muted'}`}>
                  <Clock size={12} aria-hidden="true" />
                  Due {new Date(a.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

                {isFaculty ? (
                  <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                    <span className="text-sm tnum"><strong>{a.submitted}</strong><span className="text-muted">/{a.total} submitted</span></span>
                    <button className="text-sm text-brand hover:underline cursor-pointer">Evaluate</button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-line flex items-center justify-between gap-2">
                    <span className="text-sm">
                      {a.grade != null
                        ? <><span className="text-muted">Grade </span><strong className="tnum">{a.grade}/{a.max}</strong></>
                        : <span className="text-muted tnum">Max {a.max} marks</span>}
                    </span>
                    {(a.status === 'pending' || a.status === 'overdue') && (
                      <button onClick={() => setSubmit(a)} className="btn-primary !min-h-[38px] !px-3 text-xs">
                        <Upload size={13} aria-hidden="true" /> Submit
                      </button>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={!!submit} onClose={() => setSubmit(null)} title="Submit assignment"
        footer={<><button className="btn-ghost" onClick={() => setSubmit(null)}>Cancel</button>
                 <button className="btn-primary" onClick={doSubmit}>Confirm submission</button></>}>
        {submit && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-subtle">
              <div className="font-medium text-sm">{submit.title}</div>
              <div className="text-xs text-muted mt-1">{submit.courseName} · due {new Date(submit.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
            </div>
            <div>
              <span className="label">Upload file</span>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-xl py-8 cursor-pointer hover:border-brand hover:bg-brand-50/40 transition">
                <Upload size={20} className="text-muted" aria-hidden="true" />
                <span className="text-sm text-muted">Click to browse — PDF, DOCX or ZIP up to 10 MB</span>
                <input type="file" className="sr-only" />
              </label>
            </div>
            <div>
              <label className="label" htmlFor="remarks">Remarks <span className="text-muted font-normal">(optional)</span></label>
              <textarea id="remarks" rows={3} className="field py-2.5 resize-none" placeholder="Anything your faculty should know" />
            </div>
            {submit.status === 'overdue' && (
              <p className="text-sm text-bad-700 bg-bad-50 rounded-lg px-3 py-2">
                This submission is past its deadline and will be recorded as late.
              </p>
            )}
          </div>
        )}
      </Modal>

      <Modal open={create} onClose={() => setCreate(false)} title="Create assignment"
        footer={<><button className="btn-ghost" onClick={() => setCreate(false)}>Cancel</button>
                 <button className="btn-primary" onClick={() => { setCreate(false); toast('Assignment published to 62 students.') }}>Publish</button></>}>
        <div className="space-y-4">
          <div><label className="label" htmlFor="at">Title</label><input id="at" className="field" placeholder="e.g. Red-Black Tree Implementation" /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label" htmlFor="ac">Course</label>
              <select id="ac" className="field cursor-pointer"><option>CS1601 · Data Structures</option><option>CS1605 · Software Engineering</option></select></div>
            <div><label className="label" htmlFor="ad">Due date</label><input id="ad" type="date" className="field" /></div>
          </div>
          <div><label className="label" htmlFor="am">Maximum marks</label><input id="am" type="number" defaultValue={20} className="field tnum" /></div>
          <div><label className="label" htmlFor="ai">Instructions</label>
            <textarea id="ai" rows={3} className="field py-2.5 resize-none" placeholder="Describe the task and submission format" /></div>
        </div>
      </Modal>
    </div>
  )
}
