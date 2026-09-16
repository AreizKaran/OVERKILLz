import { useMemo, useState } from 'react'
import { Search, Users, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, SectionHead, Badge, EmptyState, Bar } from '../../components/ui/Primitives'
import { useToast } from '../../components/ui/Toast'
import { attendanceTone, useResource } from '../../lib/hooks'
import { source, isLive } from '../../data/source'
import { useAuth } from '../../lib/auth'
import { ROSTER } from '../../data/mock'

// A longer, paginated roster so the table exercises real pagination.
const ALL = Array.from({ length: 34 }, (_, i) => {
  const base = ROSTER[i % ROSTER.length]
  return {
    id: `s${i}`,
    reg: String(202100114 + i * 3),
    name: i < ROSTER.length ? base.name : `${base.name.split(' ')[0]} ${['Rai','Subba','Chettri','Tamang','Pradhan','Lepcha'][i % 6]}`,
    att: Math.max(54, Math.min(98, base.att + ((i * 7) % 21) - 10)),
    cgpa: (6.4 + ((i * 13) % 34) / 10).toFixed(2),
    sem: 'VI', dept: 'CSE',
  }
})
const PAGE = 10

export default function Students() {
  const { user } = useAuth()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  // Live mode pages server-side; sample mode filters the generated roster.
  const live = useResource(() => (isLive ? source.students({ q, page, limit: PAGE }) : Promise.resolve(null)), [q, page])

  const rows = useMemo(() => {
    if (isLive) return live.data?.students ?? []
    const t = q.toLowerCase()
    return ALL.filter((s) => !q || s.name.toLowerCase().includes(t) || s.reg.includes(t))
  }, [q, live.data])

  const pages = isLive ? (live.data?.pages ?? 1) : Math.max(1, Math.ceil(rows.length / PAGE))
  const current = Math.min(page, pages)
  const view = isLive ? rows : rows.slice((current - 1) * PAGE, current * PAGE)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} className="field pl-9"
            placeholder="Search by name or registration number" aria-label="Search students" />
        </div>
        {user.role === 'admin' && (
          <button onClick={() => toast('Student registration form opened.', 'info')} className="btn-primary shrink-0">
            <UserPlus size={16} aria-hidden="true" /> <span className="hidden sm:inline">Register student</span>
          </button>
        )}
      </div>

      <Card className="p-5">
        <SectionHead title="Student roster" sub={`${rows.length} students · CSE · Semester VI`} />

        {view.length === 0 ? (
          <EmptyState icon={Users} title="No students found" body={`Nothing matches “${q}”.`}
            action={<button className="btn-ghost" onClick={() => setQ('')}>Clear search</button>} />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b border-line">
                    {['Registration', 'Name', 'Semester', 'Attendance', 'CGPA', 'Status'].map((h) => (
                      <th key={h} scope="col" className="font-medium py-2.5 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {view.map((s) => {
                    const t = attendanceTone(s.att)
                    return (
                      <tr key={s.id} className="border-b border-line last:border-0 hover:bg-subtle/50">
                        <td className="py-3 pr-4 tnum text-muted">{s.reg}</td>
                        <td className="py-3 pr-4 font-medium">{s.name}</td>
                        <td className="py-3 pr-4">{s.sem}</td>
                        <td className="py-3 pr-4 w-40">
                          <div className="flex items-center gap-2">
                            <span className="tnum w-9">{s.att}%</span>
                            <Bar value={s.att} tone={t.ring} className="flex-1" />
                          </div>
                        </td>
                        <td className="py-3 pr-4 tnum">{s.cgpa}</td>
                        <td className="py-3 pr-4"><Badge tone={t.key} icon={false}>{t.label}</Badge></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-2.5">
              {view.map((s) => {
                const t = attendanceTone(s.att)
                return (
                  <div key={s.id} className="p-4 rounded-xl border border-line">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{s.name}</div>
                        <div className="text-xs text-muted tnum mt-0.5">{s.reg} · Sem {s.sem}</div>
                      </div>
                      <Badge tone={t.key} icon={false}>{t.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-sm">
                      <span className="tnum text-muted">CGPA <strong className="text-ink">{s.cgpa}</strong></span>
                      <span className="tnum text-muted">Att. <strong className="text-ink">{s.att}%</strong></span>
                    </div>
                    <Bar value={s.att} tone={t.ring} className="mt-2" />
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-line">
              <p className="text-xs text-muted tnum">
                Showing {(current - 1) * PAGE + 1}–{(current - 1) * PAGE + view.length} of {isLive ? (live.data?.total ?? view.length) : rows.length}
              </p>
              <div className="flex gap-1.5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1}
                  aria-label="Previous page" className="btn-ghost !min-h-[40px] !px-3">
                  <ChevronLeft size={15} aria-hidden="true" />
                </button>
                <span className="grid place-items-center px-3 text-sm tnum text-muted">{current} / {pages}</span>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={current === pages}
                  aria-label="Next page" className="btn-ghost !min-h-[40px] !px-3">
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
