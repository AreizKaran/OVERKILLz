import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

export function Card({ className = '', hover = false, children, ...rest }) {
  return <div className={`card ${hover ? 'card-hover' : ''} ${className}`} {...rest}>{children}</div>
}

export function SectionHead({ title, sub, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-3">
      <div className="min-w-0">
        <h2 className="text-[17px] font-bold text-ink tracking-tight truncate">{title}</h2>
        {sub && <p className="text-sm text-muted mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

const TONES = {
  ok:   { chip: 'bg-ok-50 text-ok-700',     Icon: CheckCircle2 },
  warn: { chip: 'bg-warn-50 text-warn-700', Icon: AlertTriangle },
  bad:  { chip: 'bg-bad-50 text-bad-700',   Icon: XCircle },
  info: { chip: 'bg-brand-50 text-brand-700', Icon: Info },
  neutral: { chip: 'bg-subtle text-muted',  Icon: Info },
}

/** Status is colour + icon + text, so it survives colour-blindness and greyscale. */
export function Badge({ tone = 'neutral', children, icon = true }) {
  const { chip, Icon } = TONES[tone] ?? TONES.neutral
  return (
    <span className={`chip ${chip}`}>
      {icon && <Icon size={12} strokeWidth={2.5} aria-hidden="true" />}
      {children}
    </span>
  )
}

export function ProgressRing({ value, size = 132, stroke = 11, color = '#4F46E5', label, sub }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img"
           aria-label={`${label ?? value} ${sub ?? ''}`.trim()}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (value / 100) * circ }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-semibold tnum text-ink">{label ?? `${value}%`}</div>
        {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

export function Bar({ value, tone = '#4F46E5', className = '' }) {
  return (
    <div className={`h-2 rounded-full bg-subtle overflow-hidden ${className}`}>
      <motion.div className="h-full rounded-full" style={{ background: tone }}
        initial={{ width: 0 }} animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }} />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="text-center py-10 px-6">
      <div className="mx-auto w-12 h-12 rounded-xl bg-subtle grid place-items-center mb-3">
        <Icon size={22} className="text-slate-400" aria-hidden="true" />
      </div>
      <p className="font-medium text-ink">{title}</p>
      {body && <p className="text-sm text-muted mt-1 max-w-xs mx-auto">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Skeleton({ className = '' }) { return <div className={`skel ${className}`} /> }

export function SkeletonCard() {
  return (
    <Card className="p-4">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-16 mb-2" />
      <Skeleton className="h-2 w-full" />
    </Card>
  )
}

/** Shown when a loader rejects — always offers a way forward (error-recovery). */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center py-10 px-6" role="alert">
      <div className="mx-auto w-12 h-12 rounded-xl bg-bad-50 grid place-items-center mb-3">
        <AlertTriangle size={22} className="text-bad-700" aria-hidden="true" />
      </div>
      <p className="font-medium text-ink">Couldn't load this section</p>
      <p className="text-sm text-muted mt-1 max-w-sm mx-auto">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-ghost mt-4">Try again</button>}
    </div>
  )
}
