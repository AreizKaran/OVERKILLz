import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { USERS } from '../data/mock'
import { api, isLive, setToken, setUnauthorisedHandler, ApiError } from './api'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

const KEY = 'smit-ams.session'

/** Mongo returns _id; the sample data uses id. Components only ever see id. */
const withId = (u) => (u && !u.id && u._id ? { ...u, id: u._id } : u)

const readStored = () => {
  try { const r = sessionStorage.getItem(KEY); return r ? JSON.parse(r) : null } catch { return null }
}
const writeStored = (u) => {
  try { u ? sessionStorage.setItem(KEY, JSON.stringify(u)) : sessionStorage.removeItem(KEY) } catch { /* private mode */ }
}

/**
 * In live mode the server authenticates and the role comes back inside the JWT.
 * In sample-data mode the chosen role is taken at face value so the app demos
 * without a backend. Either way, role decides navigation, routes and data.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStored)

  const logout = useCallback(() => {
    setUser(null)
    writeStored(null)
    setToken(null)
  }, [])

  // A 401 from any request ends the session exactly once, centrally.
  useEffect(() => { setUnauthorisedHandler(logout); return () => setUnauthorisedHandler(null) }, [logout])

  // Re-validate a restored session against the server on load: a token that
  // expired while the tab was closed should not present as signed in.
  useEffect(() => {
    if (!isLive || !user) return
    let alive = true
    api.auth.me()
      .then(({ user: fresh }) => { if (alive) { const n = withId(fresh); setUser(n); writeStored(n) } })
      .catch((err) => { if (alive && err instanceof ApiError && err.status === 401) logout() })
    return () => { alive = false }
    // Runs once on mount; later changes come from login/logout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (roleOrIdentifier, password) => {
    if (isLive) {
      const { token, user: authed } = await api.auth.login(roleOrIdentifier, password)
      const normalised = withId(authed)
      setToken(token)
      setUser(normalised)
      writeStored(normalised)
      return normalised
    }
    await new Promise((r) => setTimeout(r, 850)) // shows the button's loading state
    const u = USERS.find((x) => x.role === roleOrIdentifier)
    setUser(u)
    writeStored(u)
    return u
  }, [])

  const value = useMemo(() => ({ user, login, logout, isLive }), [user, login, logout])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
