import { useState } from 'react'
import { Wallet, Download, ShieldCheck, CalendarClock, Receipt, CreditCard } from 'lucide-react'
import { Card, SectionHead, Badge, Bar, ErrorState, Skeleton } from '../../components/ui/Primitives'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { useCountUp, inr } from '../../lib/hooks'
import { source, mutate } from '../../data/source'
import { useResource, useMutation } from '../../lib/hooks'
import { useAuth } from '../../lib/auth'

export default function Fees() {
  const toast = useToast()
  const { user } = useAuth()
  const [pay, setPay] = useState(false)
  const { loading, error, data: FEES, reload } = useResource(() => source.fees(user.id), [user.id])
  const payment = useMutation((amount) => mutate.payFees(user.id, amount, 'UPI'),
    { onSuccess: (r) => { toast(`Payment successful. Receipt ${r?.receipt ?? 'issued'}.`); reload() },
      onError: (m) => toast(m, 'error') })
  const pct = FEES ? Math.round((FEES.paid / FEES.total) * 100) : 0
  const paid = useCountUp(FEES?.paid ?? 0)

  if (loading) return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="p-6 lg:col-span-2 space-y-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-9 w-64" /><Skeleton className="h-2.5 w-full" /></Card>
      <Card className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-8 w-32" /><Skeleton className="h-11 w-full" /></Card>
    </div>
  )
  if (error || !FEES) return <Card><ErrorState message={error ?? 'No fee record found.'} onRetry={reload} /></Card>

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-2">
          <SectionHead title="Fee summary" sub="Semester VI · Autumn 2026" />
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-3xl font-semibold tnum">
                {inr(Math.round(paid))} <span className="text-lg text-muted font-normal">/ {inr(FEES.total)}</span>
              </div>
              <p className="text-sm text-muted mt-1">{pct}% of the semester demand is cleared</p>
            </div>
            <Badge tone={FEES.pending > 0 ? 'warn' : 'ok'}>
              {FEES.pending > 0 ? `${inr(FEES.pending)} pending` : 'Fully paid'}
            </Badge>
          </div>
          <Bar value={pct} tone="#10B981" className="mt-4 !h-2.5" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {[
              { label: 'Total demand', value: inr(FEES.total), tone: 'text-ink' },
              { label: 'Paid to date',  value: inr(FEES.paid),  tone: 'text-ok-700' },
              { label: 'Outstanding',   value: inr(FEES.pending), tone: 'text-warn-700' },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-lg bg-subtle">
                <div className="text-xs text-muted">{s.label}</div>
                <div className={`text-base font-semibold tnum mt-0.5 ${s.tone}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <div className="flex items-center gap-2 text-warn-700 bg-warn-50 rounded-lg px-3 py-2.5 text-sm">
            <CalendarClock size={16} className="shrink-0" aria-hidden="true" />
            <span>Next due {new Date(FEES.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="mt-5">
            <div className="text-xs text-muted">Amount payable</div>
            <div className="text-2xl font-semibold tnum mt-1">{inr(FEES.pending)}</div>
            <p className="text-xs text-muted mt-2">A late fee of ₹500 per week applies after the due date.</p>
          </div>
          <button onClick={() => setPay(true)} className="btn-primary w-full mt-auto">
            <CreditCard size={16} aria-hidden="true" /> Pay now
          </button>
          <p className="text-[11px] text-muted mt-3 flex items-start gap-1.5">
            <ShieldCheck size={12} className="mt-0.5 shrink-0 text-ok" aria-hidden="true" />
            Payments are processed over an encrypted gateway. Card details are never stored by the institute.
          </p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionHead title="Fee breakdown" sub="Head-wise demand and realisation" />
          <div className="space-y-4">
            {FEES.breakdown.map((b) => {
              const p = Math.round((b.paid / b.amount) * 100)
              return (
                <div key={b.head}>
                  <div className="flex justify-between items-center gap-3 text-sm mb-1.5">
                    <span className="truncate">{b.head}</span>
                    <span className="tnum shrink-0">
                      <span className="font-medium">{inr(b.paid)}</span>
                      <span className="text-muted"> / {inr(b.amount)}</span>
                    </span>
                  </div>
                  <Bar value={p} tone={p === 100 ? '#10B981' : p > 0 ? '#F59E0B' : '#E2E8F0'} />
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <SectionHead title="Payment history" sub="Receipts for this academic year" />
          <div className="divide-y divide-line -my-2">
            {FEES.history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 py-3">
                <span className={`w-9 h-9 rounded-lg grid place-items-center shrink-0
                  ${h.status === 'paid' ? 'bg-ok-50' : 'bg-warn-50'}`}>
                  <Receipt size={15} className={h.status === 'paid' ? 'text-ok-700' : 'text-warn-700'} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium tnum truncate">{h.receipt}</div>
                  <div className="text-xs text-muted tnum">
                    {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {h.mode}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold tnum">{inr(h.amount)}</div>
                  {h.status === 'paid'
                    ? <button onClick={() => toast('Receipt downloaded.')} className="text-xs text-brand hover:underline cursor-pointer flex items-center gap-1 mt-0.5">
                        <Download size={10} aria-hidden="true" /> Receipt
                      </button>
                    : <span className="text-xs text-warn-700">Pending</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={pay} onClose={() => setPay(false)} title="Confirm payment"
        footer={<><button className="btn-ghost" onClick={() => setPay(false)}>Cancel</button>
                 <button className="btn-primary" disabled={payment.pending}
                   onClick={async () => { const amt = FEES.pending; setPay(false); await payment.run(amt) }}>
                   {payment.pending ? 'Processing…' : `Pay ${inr(FEES.pending)}`}</button></>}>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-subtle flex justify-between items-center">
            <div>
              <div className="text-xs text-muted">Amount payable</div>
              <div className="text-xl font-semibold tnum mt-0.5">{inr(FEES.pending)}</div>
            </div>
            <Wallet size={22} className="text-muted" aria-hidden="true" />
          </div>
          <div>
            <span className="label">Payment method</span>
            <div className="space-y-2">
              {['UPI', 'Net Banking', 'Debit / Credit Card'].map((m, i) => (
                <label key={m} className="flex items-center gap-3 p-3 rounded-lg border border-line cursor-pointer hover:bg-subtle has-[:checked]:border-brand has-[:checked]:bg-brand-50">
                  <input type="radio" name="pm" defaultChecked={i === 0} className="w-4 h-4 accent-brand" />
                  <span className="text-sm">{m}</span>
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted flex items-start gap-1.5">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-ok" aria-hidden="true" />
            You will be redirected to the institute's secure payment gateway. This is a demo — no real transaction occurs.
          </p>
        </div>
      </Modal>
    </div>
  )
}
