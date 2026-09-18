import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Search, Check } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { NOTIFICATIONS } from '../../data/mock'

export default function TopBar({ title, onSearch }) {
  const { user } = useAuth()
  const [items, setItems] = useState(NOTIFICATIONS)
  const [open, setOpen] = useState(false)
  const unread = items.filter((n) => !n.read).length

  const markAll = () => setItems((s) => s.map((n) => ({ ...n, read: true })))

  return (
    <header className="sticky top-0 z-30 h-14 bg-surface/90 backdrop-blur border-b border-line flex items-center gap-3 px-4 lg:px-6">
      <h1 className="font-semibold text-ink truncate flex-1 lg:flex-none">{title}</h1>

      <button onClick={onSearch}
        className="hidden lg:flex items-center gap-2 ml-6 flex-1 max-w-sm h-9 px-3 rounded-lg border border-line
                   bg-canvas text-muted text-sm hover:border-rule transition cursor-pointer">
        <Search size={15} aria-hidden="true" />
        <span>Search…</span>
        <kbd className="ml-auto text-[10px] border border-line rounded px-1.5 py-0.5 bg-surface">Ctrl K</kbd>
      </button>

      <div className="flex items-center gap-1 ml-auto lg:ml-0">
        <button onClick={onSearch} aria-label="Search"
          className="lg:hidden w-11 h-11 grid place-items-center rounded-lg hover:bg-subtle cursor-pointer">
          <Search size={18} aria-hidden="true" />
        </button>

        <div className="relative">
          <button onClick={() => setOpen((o) => !o)}
            aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
            className="relative w-11 h-11 grid place-items-center rounded-lg hover:bg-subtle cursor-pointer">
            <Bell size={18} aria-hidden="true" />
            {unread > 0 && (
              <motion.span initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-accent-700
                           text-[10px] font-semibold text-white grid place-items-center tnum">
                {unread}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-2 w-[320px] max-w-[calc(100vw-2rem)] z-20 card shadow-lift overflow-hidden">
                  <div className="flex items-center justify-between px-4 h-12 border-b border-line">
                    <span className="text-sm font-semibold">Notifications</span>
                    <button onClick={markAll} className="text-xs text-brand hover:underline cursor-pointer">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {items.map((n) => (
                      <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-line last:border-0 ${n.read ? '' : 'bg-brand-50/40'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-rule' : 'bg-brand'}`} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm text-ink leading-snug">{n.title}</p>
                          <p className="text-xs text-muted mt-0.5">{n.time}</p>
                        </div>
                        {n.read && <Check size={13} className="text-rule ml-auto shrink-0" aria-hidden="true" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-line">
          <div className="hidden sm:block text-right leading-tight">
            <div className="text-sm font-medium text-ink truncate max-w-[140px]">{user.name}</div>
            <div className="text-[11px] text-muted capitalize">{user.role}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
            {user.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </div>
        </div>
      </div>
    </header>
  )
}
