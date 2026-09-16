import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

/** Focus-trapped dialog with Escape + backdrop dismissal (escape-routes, §1). */
export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const ref = useRef(null)
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
        if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.activeElement
    requestAnimationFrame(() => ref.current?.querySelector('button,input')?.focus())
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus?.() }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-end sm:place-items-center p-0 sm:p-4">
          <motion.div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={ref} role="dialog" aria-modal="true" aria-label={title}
            className={`relative w-full ${widths[size]} bg-surface rounded-t-2xl sm:rounded-2xl shadow-lift border border-line`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-line">
              <h3 className="font-semibold text-ink">{title}</h3>
              <button onClick={onClose} aria-label="Close dialog"
                className="w-9 h-9 grid place-items-center rounded-lg hover:bg-subtle cursor-pointer">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="p-5 max-h-[65vh] overflow-y-auto">{children}</div>
            {footer && <div className="px-5 py-4 border-t border-line flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
