import { useEffect, useRef, useState } from 'react'

/** Respects prefers-reduced-motion: jumps straight to the final value (§28). */
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setValue(target); return }
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return value
}

/** Simulates a network fetch so skeletons and empty states are real code paths. */
export function useAsyncData(payload, delay = 550) {
  const [state, setState] = useState({ loading: true, error: null, data: null })
  useEffect(() => {
    let alive = true
    const t = setTimeout(() => { if (alive) setState({ loading: false, error: null, data: payload }) }, delay)
    return () => { alive = false; clearTimeout(t) }
  }, [payload, delay])
  return state
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = (e) => setMatches(e.matches)
    mq.addEventListener('change', on)
    setMatches(mq.matches)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

/** Attendance thresholds drive colour AND text/icon — never colour alone (§1). */
export function attendanceTone(pct) {
  if (pct >= 80) return { key: 'ok',   label: 'Healthy',  ring: '#1F6B4A', chip: 'bg-ok-50 text-ok-700' }
  if (pct >= 75) return { key: 'warn', label: 'Warning',  ring: '#8A5A12', chip: 'bg-warn-50 text-warn-700' }
  return           { key: 'bad',  label: 'Critical', ring: '#A3241C', chip: 'bg-bad-50 text-bad-700' }
}

export const inr = (n) => '₹' + n.toLocaleString('en-IN')

/**
 * Loads from the data source, exposing the loading and error states the UI
 * needs. `deps` re-runs the loader; `reload` re-runs it on demand.
 */
export function useResource(loader, deps = []) {
  const [state, setState] = useState({ loading: true, error: null, data: null })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    Promise.resolve()
      .then(loader)
      .then((data) => { if (alive) setState({ loading: false, error: null, data }) })
      .catch((err) => { if (alive) setState({ loading: false, error: err?.message ?? 'Could not load data', data: null }) })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { ...state, reload: () => setNonce((n) => n + 1) }
}

/**
 * Drives a write: exposes `pending` for the button's loading state and routes
 * failures to a caller-supplied handler so the server's message reaches the UI.
 */
export function useMutation(fn, { onSuccess, onError } = {}) {
  const [pending, setPending] = useState(false)
  const run = async (...args) => {
    setPending(true)
    try {
      const result = await fn(...args)
      onSuccess?.(result)
      return result
    } catch (err) {
      onError?.(err?.message ?? 'That did not go through. Try again.')
      return null
    } finally {
      setPending(false)
    }
  }
  return { run, pending }
}
