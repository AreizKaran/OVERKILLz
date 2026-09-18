import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, CornerDownLeft, ChevronDown } from 'lucide-react'
import { COURSES, FACULTY, ASSIGNMENTS, NOTICES, ROSTER } from '../../data/mock'

const INDEX = [
  ...COURSES.map((c) => ({ cat: 'Courses', label: c.name, meta: c.code, to: '/app/academics' })),
  ...FACULTY.map((f) => ({ cat: 'Faculty', label: f.name, meta: f.designation, to: '/app/faculty' })),
  ...ASSIGNMENTS.map((a) => ({ cat: 'Assignments', label: a.title, meta: a.course, to: '/app/assignments' })),
  ...NOTICES.map((n) => ({ cat: 'Notices', label: n.title, meta: n.cat, to: '/app/notices' })),
  ...ROSTER.map((s) => ({ cat: 'Students', label: s.name, meta: s.reg, to: '/app/students' })),
]

export default function SearchPalette({ open, onClose }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const [cat, setCat] = useState('All')
  const nav = useNavigate()
  const inputRef = useRef(null)

  const CATEGORIES = ['All', ...new Set(INDEX.map((i) => i.cat))]

  const results = useMemo(() => {
    const scope = cat === 'All' ? INDEX : INDEX.filter((i) => i.cat === cat)
    if (!q.trim()) return scope.slice(0, 6)
    const t = q.toLowerCase()
    return scope.filter((i) => i.label.toLowerCase().includes(t) || i.meta.toLowerCase().includes(t)).slice(0, 8)
  }, [q, cat])

  useEffect(() => { setActive(0) }, [q, cat])
  useEffect(() => { if (open) { setQ(''); setCat('All'); requestAnimationFrame(() => inputRef.current?.focus()) } }, [open])

  const go = (r) => { if (r) { nav(r.to); onClose() } }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter')     { e.preventDefault(); go(results[active]) }
    if (e.key === 'Escape')    onClose()
  }

  const grouped = results.reduce((acc, r) => { (acc[r.cat] ||= []).push(r); return acc }, {})
  let flat = -1

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-[12vh] px-4">
          <motion.div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" />
          <motion.div role="dialog" aria-modal="true" aria-label="Global search"
            className="relative w-full max-w-xl bg-surface rounded-2xl shadow-lift border border-line overflow-hidden"
            initial={{ opacity: 0, scale: 0.98, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
            <div className="flex items-center gap-3 px-4 h-14 border-b border-line">
              <Search size={18} className="text-muted shrink-0" aria-hidden="true" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
                placeholder={cat === 'All' ? 'Search students, faculty, courses, notices…' : `Search ${cat.toLowerCase()}…`}
                aria-label="Search" className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-muted/60" />

              {/* Scope the search before it runs */}
              <div className="relative shrink-0">
                <label className="sr-only" htmlFor="search-scope">Search in</label>
                <select id="search-scope" value={cat} onChange={(e) => setCat(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
                  className="appearance-none h-9 pl-3 pr-7 rounded-lg border border-line bg-canvas
                             text-xs font-medium text-ink cursor-pointer focus:border-brand">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={13} aria-hidden="true"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
              <kbd className="hidden sm:block text-[10px] text-muted border border-line rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="text-center py-8 px-6">
                  <p className="text-sm text-muted">No {cat === 'All' ? 'results' : cat.toLowerCase()} for “{q}”.</p>
                  {cat !== 'All' && (
                    <button onClick={() => setCat('All')} className="text-sm text-brand hover:underline mt-2 cursor-pointer">
                      Search all categories instead
                    </button>
                  )}
                </div>
              ) : Object.entries(grouped).map(([cat, rows]) => (
                <div key={cat} className="mb-1">
                  <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{cat}</div>
                  {rows.map((r) => {
                    flat += 1
                    const isActive = flat === active
                    return (
                      <button key={cat + r.label} onClick={() => go(r)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left cursor-pointer
                                    ${isActive ? 'bg-brand-50' : 'hover:bg-subtle'}`}>
                        <span className="text-sm text-ink truncate">{r.label}</span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted">{r.meta}</span>
                          {isActive && <CornerDownLeft size={13} className="text-brand" aria-hidden="true" />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
