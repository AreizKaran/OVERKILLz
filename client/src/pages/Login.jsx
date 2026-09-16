import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { GraduationCap, Eye, EyeOff, Loader2, Check, ShieldCheck, CalendarCheck, TrendingUp, Bell } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { isLive } from '../lib/api'

const ROLES = [
  { key: 'student', label: 'Student', hint: '202100114' },
  { key: 'faculty', label: 'Faculty', hint: 'SMIT-F-0418' },
  { key: 'admin',   label: 'Administrator', hint: 'SMIT-A-0032' },
]

const FLOATERS = [
  { icon: CalendarCheck, label: 'Attendance', value: '78%',  cls: 'top-[14%] left-[6%]',   delay: 0 },
  { icon: TrendingUp,    label: 'CGPA',       value: '8.24', cls: 'top-[32%] right-[4%]',  delay: 0.6 },
  { icon: Bell,          label: 'Notice',     value: 'Exam schedule', cls: 'bottom-[26%] left-[10%]', delay: 1.2 },
  { icon: ShieldCheck,   label: 'Session',    value: 'Secure', cls: 'bottom-[12%] right-[8%]', delay: 1.8 },
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
  const reduce = useReducedMotion()

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
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-navy text-white p-10">
        <div className="absolute inset-0 opacity-[0.55]" aria-hidden="true"
             style={{ backgroundImage: 'radial-gradient(60rem 40rem at 20% 10%, #1D4ED8 0%, transparent 55%), radial-gradient(40rem 30rem at 90% 80%, #F97316 0%, transparent 55%)' }} />
        <div className="absolute inset-0" aria-hidden="true"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />

        <div className="relative flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-white/12 grid place-items-center">
            <GraduationCap size={20} aria-hidden="true" />
          </span>
          <div>
            <div className="font-semibold leading-tight">Sikkim Manipal Institute of Technology</div>
            <div className="text-xs text-white/60 leading-tight">Majhitar, Rangpo, East Sikkim</div>
          </div>
        </div>

        <div className="relative max-w-md">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-4xl font-semibold leading-[1.15] tracking-tight">
            Academic Management System
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
            className="mt-4 text-white/70 leading-relaxed">
            One secure platform for academics, administration, communication and student services.
          </motion.p>

          <div className="relative h-56 mt-10" aria-hidden="true">
            {FLOATERS.map((f, i) => (
              <motion.div key={f.label}
                className={`absolute ${f.cls} rounded-xl bg-white/10 backdrop-blur border border-white/15 px-3 py-2.5 min-w-[132px]`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -8, 0] }}
                transition={reduce ? { duration: 0.4, delay: 0.3 + i * 0.1 } : {
                  opacity: { duration: 0.5, delay: 0.4 + i * 0.12 },
                  scale:   { duration: 0.5, delay: 0.4 + i * 0.12 },
                  y: { duration: 3.6 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: f.delay },
                }}>
                <div className="flex items-center gap-2 text-[11px] text-white/60">
                  <f.icon size={12} /> {f.label}
                </div>
                <div className="text-sm font-semibold mt-0.5">{f.value}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/45">
          © 2026 Sikkim Manipal Institute of Technology · A constituent unit of Sikkim Manipal University
        </p>
      </div>

      {/* ---------- Right: login card ---------- */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-canvas">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-sm">

          <div className="lg:hidden flex items-center gap-2.5 mb-7">
            <span className="w-10 h-10 rounded-xl bg-navy text-white grid place-items-center">
              <GraduationCap size={19} aria-hidden="true" />
            </span>
            <div>
              <div className="font-semibold leading-tight">SMIT</div>
              <div className="text-[11px] text-muted leading-tight">Academic Management System</div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="text-sm text-muted mt-1.5">Use your institute credentials to continue.</p>

          <div className="mt-6" role="group" aria-label="Select role">
            <span className="label">I am a</span>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button key={r.key} type="button" onClick={() => pickRole(r)}
                  aria-pressed={role === r.key}
                  className={`min-h-[44px] rounded-lg border text-sm font-medium transition cursor-pointer
                    ${role === r.key ? 'border-brand bg-brand-50 text-brand-700' : 'border-line bg-surface text-muted hover:border-slate-300'}`}>
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

          <p className="text-xs text-muted mt-6 flex items-start gap-2">
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
