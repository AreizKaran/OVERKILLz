import { useEffect, useState } from 'react'
import { CalendarDays, MapPin, Clock, Armchair, Download } from 'lucide-react'
import { Card, SectionHead, Badge, ErrorState, EmptyState, Skeleton } from '../../components/ui/Primitives'
import { source } from '../../data/source'
import { useResource } from '../../lib/hooks'

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(t) }, [])
  const diff = Math.max(new Date(target).getTime() - now, 0)
  return {
    days: Math.floor(diff / 864e5),
    hours: Math.floor((diff % 864e5) / 36e5),
    mins: Math.floor((diff % 36e5) / 6e4),
  }
}

export default function Examinations() {
  const { loading, error, data, reload } = useResource(source.exams)
  const EXAMS = data ?? []
  const next = EXAMS[0]
  // The hook must run on every render, so it takes a stable fallback date.
  const { days, hours, mins } = useCountdown(
    next ? `${String(next.date).slice(0, 10)}T10:00:00+05:30` : new Date().toISOString())

  if (loading) return <Card className="p-6 h-48"><Skeleton className="h-full w-full" /></Card>
  if (error) return <Card><ErrorState message={error} onRetry={reload} /></Card>
  if (!next) return (
    <Card><EmptyState icon={CalendarDays} title="No examinations scheduled"
      body="The schedule for the next examination cycle has not been published yet." /></Card>
  )

  return (
    <div className="space-y-5">
      {/* Countdown to the next paper (§21) */}
      <Card className="p-6 bg-navy text-white border-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-50" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(30rem 20rem at 85% 20%, #1D4ED8 0%, transparent 60%)' }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <Badge tone="info" icon={false}>Next examination</Badge>
            <h2 className="text-2xl font-semibold mt-3">{next.name}</h2>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70 mt-3">
              <span className="flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" />
                {new Date(next.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} aria-hidden="true" />{next.time}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} aria-hidden="true" />{next.room}</span>
              <span className="flex items-center gap-1.5"><Armchair size={14} aria-hidden="true" />Seat {next.seat}</span>
            </div>
          </div>
          <div className="flex gap-2.5 shrink-0" role="timer" aria-label={`${days} days ${hours} hours remaining`}>
            {[{ v: days, l: 'Days' }, { v: hours, l: 'Hours' }, { v: mins, l: 'Minutes' }].map((u) => (
              <div key={u.l} className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-center min-w-[74px] border border-white/10">
                <div className="text-2xl font-semibold tnum">{String(u.v).padStart(2, '0')}</div>
                <div className="text-[11px] text-white/55 mt-0.5">{u.l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHead title="Examination schedule" sub="End Semester · Autumn 2026"
          action={<button className="btn-ghost !min-h-[38px] text-xs"><Download size={14} aria-hidden="true" /> Admit card</button>} />

        {/* Table on desktop, stacked cards on mobile (mobile-friendly-tables) */}
        <div className="hidden md:block overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                {['Subject', 'Code', 'Date', 'Time', 'Venue', 'Seat'].map((h) => (
                  <th key={h} scope="col" className="font-medium py-2.5 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EXAMS.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0 hover:bg-subtle/50">
                  <td className="py-3 pr-4 font-medium">{e.name}</td>
                  <td className="py-3 pr-4 tnum text-muted">{e.course}</td>
                  <td className="py-3 pr-4 tnum">{new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  <td className="py-3 pr-4 tnum text-muted">{e.time}</td>
                  <td className="py-3 pr-4">{e.room}</td>
                  <td className="py-3 pr-4 tnum">{e.seat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {EXAMS.map((e) => (
            <div key={e.id} className="p-4 rounded-xl border border-line">
              <div className="font-medium">{e.name}</div>
              <div className="text-xs text-muted tnum mt-0.5">{e.course} · {e.type}</div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                {[['Date', new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })],
                  ['Time', e.time], ['Venue', e.room], ['Seat', e.seat]].map(([k, v]) => (
                  <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="tnum">{v}</dd></div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
