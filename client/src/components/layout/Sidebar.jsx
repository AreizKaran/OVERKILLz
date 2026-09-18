import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NAV } from '../../lib/nav'
import { useAuth } from '../../lib/auth'

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const items = NAV[user.role]

  return (
    <aside
      className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-subtle text-ink border-r border-line
                  transition-[width] duration-300 ${collapsed ? 'w-18' : 'w-64'}`}
    >
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-line shrink-0">
        <span className="w-9 h-9 rounded bg-seal text-white grid place-items-center shrink-0">
          <GraduationCap size={17} aria-hidden="true" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[15px] font-semibold leading-tight tracking-[0.08em]">SMIT</div>
            <div className="text-[11px] text-muted leading-tight truncate tracking-wide">Academic Management</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5" aria-label="Main navigation">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/app'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-lg px-3 min-h-[42px] text-sm transition-colors duration-200
               ${isActive ? 'bg-seal-50 text-seal-700 font-semibold' : 'text-muted hover:text-ink hover:bg-ink/[0.04]'}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span layoutId="nav-active" transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="absolute left-0 top-1 bottom-1 w-[3px] bg-seal" />
                )}
                <item.icon size={17} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2.5 border-t border-line space-y-0.5 shrink-0">
        <button onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center gap-3 rounded-lg px-3 min-h-[42px] text-sm text-muted hover:text-ink hover:bg-ink/[0.04] cursor-pointer">
          {collapsed ? <PanelLeftOpen size={17} aria-hidden="true" /> : <PanelLeftClose size={17} aria-hidden="true" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        {/* Destructive action kept visually separate from navigation (destructive-nav-separation) */}
        <button onClick={logout}
          className="w-full flex items-center gap-3 rounded-lg px-3 min-h-[42px] text-sm text-muted hover:text-bad hover:bg-bad-50 cursor-pointer">
          <LogOut size={17} aria-hidden="true" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
