import { MapPin, CalendarDays } from 'lucide-react'
import { Card, SectionHead, EmptyState } from '../../components/ui/Primitives'
import { TIMETABLE } from '../../data/mock'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]

export default function Timetable() {
  return (
    <div className="space-y-5">
      {/* Desktop: week grid. Mobile: day-by-day stack — not a shrunken table. */}
      <div className="hidden lg:grid grid-cols-6 gap-3">
        {DAYS.map((d) => (
          <Card key={d} className={`p-4 ${d === today ? 'border-brand ring-1 ring-brand/20' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">{d}</span>
              {d === today && <span className="text-[10px] font-semibold text-brand bg-brand-50 px-2 py-0.5 rounded-full">TODAY</span>}
            </div>
            <div className="space-y-2">
              {TIMETABLE[d].length === 0
                ? <p className="text-xs text-muted py-4 text-center">No classes</p>
                : TIMETABLE[d].map((c) => (
                  <div key={c.t + c.c} className="p-2.5 rounded-lg bg-brand-50/60 border border-brand-100">
                    <div className="text-xs font-semibold tnum text-brand-700">{c.t}</div>
                    <div className="text-xs font-medium mt-1 leading-snug">{c.n}</div>
                    <div className="text-[11px] text-muted mt-1 flex items-center gap-1">
                      <MapPin size={9} aria-hidden="true" />{c.r}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="lg:hidden space-y-4">
        {DAYS.map((d) => (
          <Card key={d} className="p-4">
            <SectionHead title={d === today ? `${d} · Today` : d} sub={`${TIMETABLE[d].length} classes`} />
            {TIMETABLE[d].length === 0 ? (
              <EmptyState icon={CalendarDays} title="No classes scheduled" />
            ) : (
              <div className="space-y-2.5">
                {TIMETABLE[d].map((c) => (
                  <div key={c.t + c.c} className="flex gap-3 p-3 rounded-lg border border-line">
                    <div className="text-sm font-semibold tnum text-brand w-12 shrink-0">{c.t}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{c.n}</div>
                      <div className="text-xs text-muted mt-0.5 flex items-center gap-2">
                        <span className="tnum">{c.c}</span>
                        <span className="flex items-center gap-1"><MapPin size={10} aria-hidden="true" />{c.r}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
