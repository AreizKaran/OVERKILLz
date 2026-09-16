import { useState } from 'react'
import { ShieldCheck, ShieldAlert, Check, Minus, User, History, AlertTriangle } from 'lucide-react'
import { Card, SectionHead, Badge } from '../../components/ui/Primitives'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { PERMISSIONS, AUDIT_LOG, USERS } from '../../data/mock'

const ROLES = ['student', 'faculty', 'admin']

/** full = unrestricted · own = limited to their own records · none = denied */
const LEVEL = {
  full: { chip: 'bg-ok-50 text-ok-700',   Icon: Check,  label: 'Full' },
  own:  { chip: 'bg-brand-50 text-brand-700', Icon: User, label: 'Own only' },
  none: { chip: 'bg-subtle text-muted',   Icon: Minus,  label: 'Denied' },
}

function Level({ value }) {
  const { chip, Icon, label } = LEVEL[value]
  return (
    <span className={`chip ${chip}`} title={label}>
      <Icon size={12} strokeWidth={2.5} aria-hidden="true" />
      {label}
    </span>
  )
}

export default function AccessControl() {
  const toast = useToast()
  const [confirm, setConfirm] = useState(null)

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 rounded-xl border border-brand-100 bg-brand-50">
        <ShieldCheck size={17} className="text-brand-700 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm text-brand-700">
          These permissions are enforced on the server, not in the browser. Changing them here updates the
          role definition that every API request is checked against — it does not merely hide interface elements.
        </p>
      </div>

      <Card className="p-5">
        <SectionHead title="Permission matrix" sub="What each role may do across the system" />

        <div className="hidden md:block overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-line">
                <th scope="col" className="font-medium py-2.5 pr-4">Capability</th>
                {ROLES.map((r) => (
                  <th key={r} scope="col" className="font-medium py-2.5 pr-4 capitalize">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.key} className="border-b border-line last:border-0 hover:bg-subtle/50">
                  <td className="py-3 pr-4 font-medium">{p.label}</td>
                  {ROLES.map((r) => <td key={r} className="py-3 pr-4"><Level value={p[r]} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {PERMISSIONS.map((p) => (
            <div key={p.key} className="p-4 rounded-xl border border-line">
              <div className="font-medium text-sm">{p.label}</div>
              {/* Stacked rather than three columns: the level chips cannot shrink,
                  and a 3-up grid overflows below ~420px. */}
              <dl className="mt-3 divide-y divide-line">
                {ROLES.map((r) => (
                  <div key={r} className="flex items-center justify-between gap-3 py-2">
                    <dt className="text-xs text-muted capitalize">{r}</dt>
                    <dd className="shrink-0"><Level value={p[r]} /></dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5 min-w-0">
          <SectionHead title="Role assignment" sub="Changing a role takes effect on the account's next sign-in" />
          <div className="divide-y divide-line -my-1">
            {USERS.map((u) => (
              <div key={u.id} className="flex items-center gap-2 py-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold shrink-0">
                  {u.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                  <div className="text-xs text-muted tnum truncate">{u.reg ?? u.empId} · {u.dept}</div>
                </div>
                <Badge tone={u.role === 'admin' ? 'bad' : u.role === 'faculty' ? 'info' : 'neutral'} icon={false}>
                  {u.role}
                </Badge>
                <button onClick={() => setConfirm(u)}
                  className="text-xs text-brand hover:underline cursor-pointer shrink-0 inline-flex items-center min-h-[44px] px-2">
                  Change
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 min-w-0">
          <SectionHead title="Audit trail" sub="Privileged actions across the institute" />
          <div className="divide-y divide-line -my-1">
            {AUDIT_LOG.map((a) => (
              <div key={a.id} className="flex items-start gap-3 py-3">
                <span className={`w-8 h-8 rounded-lg grid place-items-center shrink-0
                  ${a.severity === 'high' ? 'bg-warn-50' : 'bg-subtle'}`}>
                  {a.severity === 'high'
                    ? <ShieldAlert size={14} className="text-warn-700" aria-hidden="true" />
                    : <History size={14} className="text-muted" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{a.actor}</span>{' '}
                    <span className="text-muted">{a.action}</span>
                  </p>
                  <p className="text-xs text-muted mt-0.5 tnum">{a.when}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} size="sm" title="Change role?"
        footer={<><button className="btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
                 <button className="btn-danger" onClick={() => { const n = confirm.name; setConfirm(null); toast(`Role change queued for ${n}.`) }}>
                   Change role</button></>}>
        {confirm && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-warn mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm text-muted">
                Changing <strong className="text-ink">{confirm.name}</strong>'s role alters what data this account can
                reach across the entire system. The change is recorded in the audit trail.
              </p>
            </div>
            <div>
              <label className="label" htmlFor="nr">New role</label>
              <select id="nr" defaultValue={confirm.role} className="field cursor-pointer">
                {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
