import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Eye, EyeOff, Loader2, Check, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { isLive } from '../lib/api'

const ROLES = [
  { key: 'student', label: 'Student', hint: '202100114' },
  { key: 'faculty', label: 'Faculty', hint: 'SMIT-F-0418' },
  { key: 'admin',   label: 'Administrator', hint: 'SMIT-A-0032' },
]

export default function Login() {
  const [role, setRole] = useState('student')
  const [id, setId] = useState('202100114')
  const [pw, setPw] = useState('demo1234')
  const [show, setShow] = useState(false)
  const [state, setState] = useState('idle') // idle | loading | done
  const [error, setError] = useState('')
  const { login } = useAuth()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!id.trim())   return setError('Enter your registration number or employee ID.')
    if (pw.length < 6) return setError('Password must be at least 6 characters.')
    setState('loading')
    try {
      await login(isLive ? id : role, pw)
      setState('done')
      setTimeout(() => nav('/app'), 420)
    } catch (err) {
      setState('idle')
      setError(err?.message ?? 'Sign-in failed. Try again.')
    }
  }

  const pickRole = (r) => {
    setRole(r.key); setId(r.hint); setError('')
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-[1.05fr_1fr]">
      {/* ---------- Left: brand + animated campus graphic (desktop only) ---------- */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-subtle text-ink p-10 lg:p-12 border-r border-line">
        {/* Nothing behind the type. The panel is paper. */}

        <div className="relative flex items-center gap-3">
          <span className="w-9 h-9 rounded bg-seal text-white grid place-items-center shrink-0">
            <GraduationCap size={20} aria-hidden="true" />
          </span>
          <div>
            <div className="text-sm font-semibold leading-tight tracking-tight">Sikkim Manipal Institute of Technology</div>
            <div className="text-xs text-muted leading-tight mt-0.5">Majhitar, East Sikkim</div>
          </div>
        </div>

        <div className="relative max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}>
            <h1 className="text-[2.1rem] font-semibold leading-[1.15] tracking-[-0.02em] max-w-md">
              Academic Management System
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
            className="mt-4 text-muted leading-relaxed text-[15px] max-w-sm">
            One secure platform for academics, administration, communication and student services.
          </motion.p>

        </div>

        <p className="relative text-[11px] text-muted">
          © 2026 Sikkim Manipal Institute of Technology
        </p>
      </div>

      {/* ---------- Right: login card ---------- */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-paper">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-sm">

          <div className="lg:hidden flex items-center gap-2.5 mb-7">
            <span className="w-10 h-10 rounded bg-seal text-white grid place-items-center">
              <GraduationCap size={19} aria-hidden="true" />
            </span>
            <div>
              <div className="font-semibold leading-tight">SMIT</div>
              <div className="text-[11px] text-muted leading-tight">Academic Management System</div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="text-sm text-muted mt-2">Use your institute credentials to continue.</p>

          <div className="mt-6" role="group" aria-label="Select role">
            <span className="label">I am a</span>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button key={r.key} type="button" onClick={() => pickRole(r)}
                  aria-pressed={role === r.key}
                  className={`min-h-[44px] rounded-lg border text-sm font-medium transition cursor-pointer
                    ${role === r.key ? 'border-seal bg-seal-50 text-seal-700' : 'border-rule bg-surface text-muted hover:border-ink/25'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            <div>
              <label htmlFor="uid" className="label">
                {role === 'student' ? 'Registration number' : 'Employee ID'}
              </label>
              <input id="uid" className="field" value={id} onChange={(e) => setId(e.target.value)}
                autoComplete="username" inputMode="text"
                aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined} />
            </div>

            <div>
              <label htmlFor="pw" className="label">Password</label>
              <div className="relative">
                <input id="pw" type={show ? 'text' : 'password'} className="field pr-11"
                  value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password"
                  aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined} />
                <button type="button" onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-lg text-muted hover:bg-subtle cursor-pointer">
                  {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && (
              <p id="login-error" role="alert" className="text-sm text-bad-700 bg-bad-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-line accent-brand" />
                Remember me
              </label>
              <button type="button" className="text-sm text-brand hover:underline cursor-pointer">Forgot password?</button>
            </div>

            <button type="submit" disabled={state !== 'idle'}
              className={`btn w-full text-white ${state === 'done' ? 'bg-ok-700' : 'bg-brand hover:bg-brand-700'}`}>
              {state === 'idle'    && 'Sign in'}
              {state === 'loading' && <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Signing in…</>}
              {state === 'done'    && <><Check size={16} aria-hidden="true" /> Signed in</>}
            </button>
          </form>

          <p className="text-xs text-muted mt-8 flex items-start gap-2 leading-relaxed">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-ok" aria-hidden="true" />
            <span>{isLive
              ? 'Your credentials are sent over an encrypted connection to the institute server.'
              : 'Demo build — any password of 6+ characters signs you in as the selected role. No credentials leave this browser.'}</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
