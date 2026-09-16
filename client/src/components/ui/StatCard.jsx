import { motion } from 'framer-motion'
import { useCountUp } from '../../lib/hooks'
import { Card } from './Primitives'

export default function StatCard({ icon: Icon, label, value, suffix = '', decimals = 0, tone = 'brand', foot, index = 0 }) {
  const n = useCountUp(value)
  const tones = {
    brand: 'bg-brand-50 text-brand-700', ok: 'bg-ok-50 text-ok-700',
    warn: 'bg-warn-50 text-warn-700', bad: 'bg-bad-50 text-bad-700',
    accent: 'bg-accent-50 text-accent-600', navy: 'bg-navy-50 text-navy',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Card hover className="p-4 h-full">
        <div className="flex items-start justify-between gap-3">
          <span className="text-sm text-muted font-medium">{label}</span>
          <span className={`w-8 h-8 shrink-0 rounded-lg grid place-items-center ${tones[tone]}`}>
            <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
          </span>
        </div>
        <div className="mt-2 text-2xl font-semibold tnum text-ink">
          {n.toFixed(decimals)}{suffix}
        </div>
        {foot && <div className="mt-1.5 text-xs text-muted">{foot}</div>}
      </Card>
    </motion.div>
  )
}
