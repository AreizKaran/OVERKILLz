import { useMemo, useState } from 'react'
import { Megaphone, Search, Plus, Building2, CalendarDays } from 'lucide-react'
import { Card, SectionHead, Badge, EmptyState, ErrorState, Skeleton } from '../../components/ui/Primitives'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../lib/auth'
import { source, mutate } from '../../data/source'
import { useResource, useMutation } from '../../lib/hooks'

const CATS = ['All', 'Academic', 'Examination', 'Administration', 'Events', 'Emergency', 'General']
const CAT_TONE = { Emergency: 'bad', Examination: 'warn', Academic: 'info', Administration: 'info', Events: 'ok', General: 'neutral' }

export default function Notices() {
  const { user } = useAuth()
  const toast = useToast()
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const [compose, setCompose] = useState(false)
  const canPublish = user.role !== 'student'
  const { loading, error, data, reload } = useResource(source.notices)
  const publish = useMutation((n) => mutate.publishNotice(n),
    { onSuccess: () => { toast('Notice published.'); reload() }, onError: (m) => toast(m, 'error') })

  const rows = useMemo(() => (data ?? []).filter((n) => {
    const byCat = cat === 'All' || n.cat === cat
    const byQ = !q || n.title.toLowerCase().includes(q.toLowerCase())
    return byCat && byQ
  }), [data, cat, q])

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 flex-1">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={`shrink-0 min-h-[40px] px-3.5 rounded-lg text-sm font-medium border transition cursor-pointer
                ${cat === c ? 'border-brand bg-brand-50 text-brand-700' : 'border-line bg-surface text-muted hover:border-rule'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-56">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} className="field pl-9"
              placeholder="Search notices" aria-label="Search notices" />
          </div>
          {canPublish && (
            <button onClick={() => setCompose(true)} className="btn-primary shrink-0">
              <Plus size={16} aria-hidden="true" /> <span className="hidden sm:inline">Publish</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-2.5">
              <Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-2/3" /><Skeleton className="h-3 w-full" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={reload} /></Card>
      ) : rows.length === 0 ? (
        <Card><EmptyState icon={Megaphone} title="No notices here"
          body={q ? `Nothing matches “${q}”.` : `No ${cat.toLowerCase()} notices have been published.`} /></Card>
      ) : (
        <div className="space-y-3">
          {rows.map((n) => (
            <Card key={n.id} hover
              className={`p-5 cursor-pointer ${n.priority === 'high' ? 'border-l-[3px] border-l-accent' : ''}`}>
              <button onClick={() => setOpen(n)} className="w-full text-left cursor-pointer">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge tone={CAT_TONE[n.cat]} icon={false}>{n.cat}</Badge>
                  {n.priority === 'high' && <Badge tone="bad">High priority</Badge>}
                </div>
                <h3 className="font-semibold leading-snug">{n.title}</h3>
                <p className="text-sm text-muted mt-1.5 line-clamp-2">{n.body}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mt-3">
                  <span className="flex items-center gap-1.5"><Building2 size={11} aria-hidden="true" />{n.dept}</span>
                  <span className="flex items-center gap-1.5"><CalendarDays size={11} aria-hidden="true" />
                    {new Date(n.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.cat ?? ''} size="lg">
        {open && (
          <article className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone={CAT_TONE[open.cat]} icon={false}>{open.cat}</Badge>
              {open.priority === 'high' && <Badge tone="bad">High priority</Badge>}
            </div>
            <h3 className="text-lg font-semibold leading-snug">{open.title}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted pb-4 border-b border-line">
              <span>{open.dept}</span>
              <span>{new Date(open.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <p className="text-sm leading-relaxed text-ink">{open.body}</p>
          </article>
        )}
      </Modal>

      <Modal open={compose} onClose={() => setCompose(false)} title="Publish a notice"
        footer={<><button className="btn-ghost" onClick={() => setCompose(false)}>Cancel</button>
                 <button className="btn-primary" disabled={publish.pending}
                   onClick={async () => { setCompose(false); await publish.run({ title: 'New notice', body: '', category: 'General', priority: 'normal', audience: ['student'] }) }}>
                   {publish.pending ? 'Publishing…' : 'Publish'}</button></>}>
        <div className="space-y-4">
          <div><label className="label" htmlFor="nt">Title</label><input id="nt" className="field" placeholder="Notice heading" /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label" htmlFor="nc">Category</label>
              <select id="nc" className="field cursor-pointer">{CATS.slice(1).map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label" htmlFor="np">Priority</label>
              <select id="np" className="field cursor-pointer"><option>Normal</option><option>High</option><option>Low</option></select></div>
          </div>
          <div><label className="label" htmlFor="nb">Body</label>
            <textarea id="nb" rows={5} className="field py-2.5 resize-none" placeholder="Full text of the notice" /></div>
        </div>
      </Modal>
    </div>
  )
}
