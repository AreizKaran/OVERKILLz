import { motion } from 'framer-motion'
import { useCountUp } from '../../lib/hooks'

/**
 * Vivid gradient tile. Every fill clears 4.5:1 under white text, so the bold
 * look does not cost readability — the numbers are the point of the card.
 */
const TONES = {
  brand:  'bg-grad-brand',
  violet: 'bg-grad-violet',
  navy:   'bg-grad-navy',
  accent: 'bg-grad-rose',
  ok:     'bg-grad-teal',
  warn:   'bg-grad-amber',
  bad:    'bg-grad-rose',
}

export default function StatCard({
  icon: Icon, label, value, suffix = '', decimals = 0, tone = 'brand', foot, index = 0,
}) {
  const n = useCountUp(value)
  const fill = TONES[tone] ?? TONES.brand

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <div className={`${fill} relative h-full rounded-2xl p-4 sm:p-5 text-white shadow-tile overflow-hidden
                       transition-transform duration-200 hover:-translate-y-1`}>
        {/* Luminous corner wash — depth without another DOM layer */}
        <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-white/15 blur-2xl"
             aria-hidden="true" />

        <div className="relative flex items-start justify-between gap-3">
          <span className="text-sm font-medium text-white/85 leading-snug">{label}</span>
          <span className="w-9 h-9 shrink-0 rounded-xl bg-white/20 backdrop-blur grid place-items-center">
            <Icon size={17} strokeWidth={2.4} aria-hidden="true" />
          </span>
        </div>

        <div className="relative mt-3 text-3xl font-bold tnum tracking-tight">
          {n.toFixed(decimals)}{suffix}
        </div>

        {foot && <div className="relative mt-1.5 text-xs text-white/75">{foot}</div>}
      </div>
    </motion.div>
  )
}
