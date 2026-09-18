import { useMemo, useState } from 'react'
import { Search, Mail, Phone, MapPin, Star, Users } from 'lucide-react'
import { Card, SectionHead, Badge, EmptyState, ErrorState, Skeleton } from '../../components/ui/Primitives'
import Modal from '../../components/ui/Modal'
import { source } from '../../data/source'
import { useResource } from '../../lib/hooks'

export default function Faculty() {
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('All')
  const [open, setOpen] = useState(null)
  const { loading, error, data, reload } = useResource(source.faculty)
  const depts = ['All', ...new Set((data ?? []).map((f) => f.dept))]

  const rows = useMemo(() => (data ?? []).filter((f) => {
    const byDept = dept === 'All' || f.dept === dept
    const t = q.toLowerCase()
    const byQ = !q || f.name.toLowerCase().includes(t) || f.subjects.join(' ').toLowerCase().includes(t)
    return byDept && byQ
  }), [data, q, dept])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="field pl-9"
            placeholder="Search by name or subject" aria-label="Search faculty" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1">
          {depts.map((d) => (
            <button key={d} onClick={() => setDept(d)} aria-pressed={dept === d}
              className={`shrink-0 min-h-[44px] px-3.5 rounded-lg text-sm font-medium border transition cursor-pointer
                ${dept === d ? 'border-brand bg-brand-50 text-brand-700' : 'border-line bg-surface text-muted hover:border-rule'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <div className="flex gap-3"><Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/2" /></div></div>
              <Skeleton className="h-3 w-full" /><Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={reload} /></Card>
      ) : rows.length === 0 ? (
        <Card><EmptyState icon={Users} title="No faculty found" body={`Nothing matches “${q}”.`}
          action={<button className="btn-ghost" onClick={() => { setQ(''); setDept('All') }}>Reset filters</button>} /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((f) => (
            <Card key={f.id} hover className="p-5 group">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-full bg-navy text-white grid place-items-center font-semibold shrink-0
                                transition-transform duration-200 group-hover:scale-105">
                  {f.name.replace(/^(Dr|Prof)\.\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug truncate">{f.name}</h3>
                  <p className="text-sm text-muted truncate">{f.designation}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge tone="info" icon={false}>{f.dept}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Star size={11} className="fill-warn text-warn" aria-hidden="true" />
                      <span className="tnum">{f.rating}</span>
                    </span>
                  </div>
                </div>
              </div>

              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-muted">
                  <MapPin size={13} className="shrink-0" aria-hidden="true" /><dd className="truncate">{f.cabin}</dd>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <Mail size={13} className="shrink-0" aria-hidden="true" /><dd className="truncate">{f.email}</dd>
                </div>
              </dl>

              <p className="text-xs text-muted mt-3 line-clamp-2">{f.subjects.join(' · ')}</p>

              <button onClick={() => setOpen(f)} className="btn-ghost w-full mt-4 !min-h-[40px] text-sm">View profile</button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ''}>
        {open && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-navy text-white grid place-items-center text-lg font-semibold shrink-0">
                {open.name.replace(/^(Dr|Prof)\.\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{open.designation}</p>
                <p className="text-sm text-muted">{open.dept} Department · {open.experience}</p>
                <p className="text-sm text-muted mt-0.5">{open.qualification}</p>
              </div>
            </div>

            <dl className="grid sm:grid-cols-2 gap-3">
              {[[MapPin, 'Cabin', open.cabin], [Mail, 'Email', open.email],
                [Phone, 'Contact', open.phone], [Star, 'Feedback rating', `${open.rating} / 5.0`]].map(([Icon, k, v]) => (
                <div key={k} className="p-3 rounded-lg bg-subtle">
                  <dt className="flex items-center gap-1.5 text-xs text-muted">
                    <Icon size={12} aria-hidden="true" /> {k}
                  </dt>
                  <dd className="text-sm font-medium mt-1 break-words">{v}</dd>
                </div>
              ))}
            </dl>

            <div>
              <SectionHead title="Subjects taught" />
              <div className="flex flex-wrap gap-2">
                {open.subjects.map((s) => <Badge key={s} tone="info" icon={false}>{s}</Badge>)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
