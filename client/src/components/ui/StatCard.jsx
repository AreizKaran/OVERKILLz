import { motion } from 'framer-motion'
import { useCountUp } from '../../lib/hooks'

/**
 * A figure from a register, not a coloured tile.
 *
 * The number is the largest thing on the card and set in tabular figures so a
 * column of them lines up. Colour appears only when the metric carries a state
 * worth flagging — and then as a single rule above the label, never as a fill
 * behind the data. A card that is coloured for decoration makes every card
 * look equally urgent, which is the same as none of them being urgent.
 */
const STATE_RULE = {
  ok:   'bg-ok',
  warn: 'bg-warn',
  bad:  'bg-bad',
}

export default function StatCard({
  icon: Icon, label, value, suffix = '', decimals = 0, tone = 'neutral', foot, index = 0,
}) {
  const n = useCountUp(value)
  const rule = STATE_RULE[tone]           // undefined for neutral metrics

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      className="h-full"
    >
      <div className="relative h-full bg-surface border border-line rounded-lg p-4 sm:p-5
                      transition-colors duration-200 hover:border-rule">
        {/* State rule: present only when the figure means something is off */}
        {rule && <span className={`absolute inset-x-0 top-0 h-[3px] rounded-t-lg ${rule}`} aria-hidden="true" />}

        <div className="flex items-center gap-2 text-muted">
          {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
          <span className="text-[13px] font-medium tracking-wide uppercase">{label}</span>
        </div>

        <div className="mt-3 text-[2.125rem] leading-none font-semibold tnum text-ink tracking-tight">
          {n.toFixed(decimals)}<span className="text-2xl text-muted font-medium">{suffix}</span>
        </div>

        {foot && (
          <div className="mt-2.5 pt-2.5 border-t border-line text-xs text-muted">{foot}</div>
        )}
      </div>
    </motion.div>
  )
}
