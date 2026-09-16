import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { primaryNav } from '../../lib/nav'
import { useAuth } from '../../lib/auth'

/** Mobile primary navigation: 5 items max, icon + label, safe-area aware. */
export default function BottomNav({ onMore }) {
  const { user } = useAuth()
  const items = primaryNav(user.role).slice(0, 4)

  return (
    <nav aria-label="Primary"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-line
                 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/app'}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 min-h-[64px] text-[11px] transition-colors
               ${isActive ? 'text-brand font-medium' : 'text-muted'}`}>
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="tab-dot" className="absolute top-1 w-8 h-[3px] rounded-full bg-brand" />}
                <motion.span animate={{ scale: isActive ? 1.08 : 1 }} transition={{ duration: 0.2 }}>
                  <item.icon size={20} strokeWidth={2} aria-hidden="true" />
                </motion.span>
                <span className="truncate max-w-full px-1">{item.label.split(' ')[0]}</span>
              </>
            )}
          </NavLink>
        ))}
        <button onClick={onMore} aria-label="More menu"
          className="flex flex-col items-center justify-center gap-1 min-h-[64px] text-[11px] text-muted cursor-pointer">
          <Menu size={20} strokeWidth={2} aria-hidden="true" />
          <span>More</span>
        </button>
      </div>
    </nav>
  )
}
