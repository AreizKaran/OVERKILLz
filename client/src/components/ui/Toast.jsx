import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'

const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info }
const RING = { success: 'text-ok', error: 'text-bad', info: 'text-brand' }

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setItems((s) => [...s, { id, message, type }])
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4000)
  }, [])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      {/* polite live region: announced without stealing focus (toast-accessibility) */}
      <div className="fixed z-[120] bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:w-80 flex flex-col gap-2"
           role="status" aria-live="polite">
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const Icon = ICONS[t.type]
            return (
              <motion.div key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="card shadow-lift px-4 py-3 flex items-start gap-3">
                <Icon size={18} className={`${RING[t.type]} mt-0.5 shrink-0`} aria-hidden="true" />
                <p className="text-sm text-ink">{t.message}</p>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}
