import { useState } from 'react'
import { Bell, Shield, Monitor, LogOut, Smartphone, Laptop, AlertTriangle } from 'lucide-react'
import { Card, SectionHead, Badge } from '../../components/ui/Primitives'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../lib/auth'

function Toggle({ label, hint, defaultOn = true, onToggle }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-line last:border-0">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
      </div>
      <button role="switch" aria-checked={on} aria-label={label}
        onClick={() => { setOn(!on); onToggle?.(!on) }}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors cursor-pointer
          ${on ? 'bg-brand' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
          ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

const SESSIONS = [
  { id: 1, icon: Laptop,     device: 'Chrome · Windows 11',  where: 'Majhitar, Sikkim', when: 'Active now', current: true },
  { id: 2, icon: Smartphone, device: 'Safari · iPhone 14',   where: 'Majhitar, Sikkim', when: '2 hours ago' },
  { id: 3, icon: Laptop,     device: 'Firefox · Ubuntu 24',  where: 'Gangtok, Sikkim',  when: '3 days ago' },
]

export default function Settings() {
  const toast = useToast()
  const { logout } = useAuth()
  const [confirmOut, setConfirmOut] = useState(false)

  return (
    <div className="space-y-5 max-w-3xl">
      <Card className="p-5">
        <SectionHead title="Notifications" sub="Choose what reaches you, and where" />
        <div>
          <Toggle label="Assignment deadlines" hint="Reminders 24 hours before a submission is due"
            onToggle={(v) => toast(`Assignment reminders ${v ? 'enabled' : 'disabled'}.`, 'info')} />
          <Toggle label="Attendance alerts" hint="When any subject falls below 75%" />
          <Toggle label="Examination updates" hint="Schedule changes, admit cards and results" />
          <Toggle label="Fee reminders" hint="Ahead of each instalment due date" />
          <Toggle label="General notices" hint="Events, circulars and campus announcements" defaultOn={false} />
        </div>
      </Card>

      <Card className="p-5">
        <SectionHead title="Appearance & accessibility" />
        <div>
          <Toggle label="Reduce motion" hint="Removes floating and parallax effects across the interface" defaultOn={false}
            onToggle={(v) => toast(v ? 'Reduced motion enabled.' : 'Reduced motion disabled.', 'info')} />
          <Toggle label="Larger text" hint="Increases base type size for readability" defaultOn={false} />
          <Toggle label="High contrast borders" hint="Strengthens dividers and card outlines" defaultOn={false} />
        </div>
      </Card>

      <Card className="p-5">
        <SectionHead title="Security" sub="Protect access to your academic record" />
        <div className="space-y-3">
          <button onClick={() => toast('A password reset link has been sent to your institute email.', 'info')}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-line hover:bg-subtle text-left transition cursor-pointer">
            <Shield size={17} className="text-muted shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">Change password</div>
              <div className="text-xs text-muted">Last changed 4 months ago</div>
            </div>
          </button>
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-line">
            <Bell size={17} className="text-muted shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">Two-factor authentication</div>
              <div className="text-xs text-muted">Adds a one-time code at sign-in</div>
            </div>
            <Badge tone="warn">Not enabled</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHead title="Active sessions" sub="Devices currently signed in to your account" />
        <div className="divide-y divide-line -my-1">
          {SESSIONS.map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-3">
              <span className="w-9 h-9 rounded-lg bg-subtle grid place-items-center shrink-0">
                <s.icon size={15} className="text-muted" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{s.device}</div>
                <div className="text-xs text-muted">{s.where} · {s.when}</div>
              </div>
              {s.current
                ? <Badge tone="ok">This device</Badge>
                : <button onClick={() => toast('Session revoked.')} className="text-xs text-bad-700 hover:underline cursor-pointer shrink-0 inline-flex items-center min-h-[44px] px-2">Revoke</button>}
            </div>
          ))}
        </div>
      </Card>

      {/* Destructive action, visually separated and confirmed (§24) */}
      <Card className="p-5 border-bad/25">
        <SectionHead title="Sign out" sub="End this session on this device" />
        <button onClick={() => setConfirmOut(true)} className="btn-danger">
          <LogOut size={16} aria-hidden="true" /> Sign out
        </button>
      </Card>

      <Modal open={confirmOut} onClose={() => setConfirmOut(false)} size="sm" title="Sign out?"
        footer={<><button className="btn-ghost" onClick={() => setConfirmOut(false)}>Cancel</button>
                 <button className="btn-danger" onClick={logout}>Sign out</button></>}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-bad mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-muted">
            You will be returned to the sign-in screen. Any unsaved work in this session will be lost.
          </p>
        </div>
      </Modal>
    </div>
  )
}
