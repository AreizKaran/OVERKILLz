import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { USERS } from '../data/mock'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

const KEY = 'smit-ams.session'

/**
 * Demo authentication. The role decides which navigation, routes and data a
 * session can reach — the same contract the JWT payload carries server-side.
 * No credential check happens in the browser in the real deployment.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const r = sessionStorage.getItem(KEY); return r ? JSON.parse(r) : null } catch { return null }
  })

  const login = useCallback(async (role) => {
    await new Promise((r) => setTimeout(r, 850)) // shows the button's loading state
    const u = USERS.find((x) => x.role === role)
    setUser(u)
    try { sessionStorage.setItem(KEY, JSON.stringify(u)) } catch { /* private mode */ }
    return u
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
