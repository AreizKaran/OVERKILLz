import { Suspense, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import SearchPalette from './SearchPalette'
import RouteFallback from '../ui/RouteFallback'
import { NAV } from '../../lib/nav'
import { useAuth } from '../../lib/auth'

export default function AppShell() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState(false)
  const [more, setMore] = useState(false)

  const items = NAV[user.role]
  const current = items.find((i) => i.to === pathname) ?? items[0]

  // Ctrl/⌘+K opens global search (§24)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch((s) => !s) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { setMore(false) }, [pathname])

  return (
    <div className="min-h-dvh bg-canvas">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className={`transition-[padding] duration-300 ${collapsed ? 'lg:pl-18' : 'lg:pl-64'}`}>
        <TopBar title={current.label} onSearch={() => setSearch(true)} />

        {/* pb clears the fixed bottom bar on mobile (fixed-element-offset) */}
        <main id="main" className="px-4 lg:px-6 py-5 pb-24 lg:pb-8 max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={pathname}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}>
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomNav onMore={() => setMore(true)} />
      <SearchPalette open={search} onClose={() => setSearch(false)} />

      {/* Secondary navigation drawer — everything not in the 5 primary slots */}
      <AnimatePresence>
        {more && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} onClick={() => setMore(false)} aria-hidden="true" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 inset-x-0 bg-surface rounded-t-2xl max-h-[78vh] overflow-y-auto
                         pb-[env(safe-area-inset-bottom)]">
              <div className="sticky top-0 bg-surface pt-3 pb-2 px-5 border-b border-line">
                <div className="w-10 h-1 rounded-full bg-line mx-auto mb-3" aria-hidden="true" />
                <h2 className="font-semibold">All sections</h2>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {items.map((i) => (
                  <NavLink key={i.to} to={i.to} end={i.to === '/app'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-xl border px-3 min-h-[52px] text-sm
                       ${isActive ? 'border-brand bg-brand-50 text-brand-700 font-medium' : 'border-line text-ink'}`}>
                    <i.icon size={17} className="shrink-0" aria-hidden="true" />
                    <span className="truncate">{i.label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
