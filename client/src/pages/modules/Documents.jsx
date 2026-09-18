import { useMemo, useState } from 'react'
import { FileText, Download, Search, Upload, ShieldCheck, Clock, FolderOpen, Image } from 'lucide-react'
import { Card, SectionHead, Badge, EmptyState } from '../../components/ui/Primitives'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import { DOCUMENTS } from '../../data/mock'

const CATS = ['All', 'Academic', 'Admission', 'Financial', 'Hostel', 'Personal']

export default function Documents() {
  const toast = useToast()
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [upload, setUpload] = useState(false)

  const rows = useMemo(() => DOCUMENTS.filter((d) => {
    const byCat = cat === 'All' || d.cat === cat
    const byQ = !q || d.name.toLowerCase().includes(q.toLowerCase())
    return byCat && byQ
  }), [cat, q])

  const verified = DOCUMENTS.filter((d) => d.verified).length

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {[
            { label: 'Documents on file', value: DOCUMENTS.length },
            { label: 'Verified', value: verified },
            { label: 'Awaiting verification', value: DOCUMENTS.length - verified },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-xs text-muted">{s.label}</div>
              <div className="font-semibold tnum mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 flex-1">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={`shrink-0 min-h-[40px] px-3.5 rounded-lg text-sm font-medium border transition cursor-pointer
                ${cat === c ? 'border-brand bg-brand-50 text-brand-700' : 'border-line bg-surface text-muted hover:border-rule'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-56">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} className="field pl-9"
              placeholder="Search documents" aria-label="Search documents" />
          </div>
          <button onClick={() => setUpload(true)} className="btn-primary shrink-0">
            <Upload size={16} aria-hidden="true" /> <span className="hidden sm:inline">Upload</span>
          </button>
        </div>
      </div>

      <Card className="p-5">
        <SectionHead title="Your documents" sub="Records held by the institute on your behalf" />
        {rows.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No documents here"
            body={q ? `Nothing matches “${q}”.` : `No ${cat.toLowerCase()} documents are on file.`}
            action={q ? <button className="btn-ghost" onClick={() => setQ('')}>Clear search</button> : null} />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {rows.map((d) => {
              const Icon = d.type === 'jpg' ? Image : FileText
              return (
                <div key={d.id} className="flex items-start gap-3 p-4 rounded-xl border border-line hover:border-brand hover:bg-brand-50/40 transition group">
                  <span className="w-10 h-10 rounded-lg bg-subtle grid place-items-center shrink-0">
                    <Icon size={17} className="text-muted" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-snug">{d.name}</div>
                    <div className="text-xs text-muted tnum mt-1">
                      {d.cat} · {d.size} · {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="mt-2">
                      {d.verified
                        ? <Badge tone="ok">Verified</Badge>
                        : <Badge tone="warn">Awaiting verification</Badge>}
                    </div>
                  </div>
                  <button onClick={() => toast(`${d.name} downloaded.`)} aria-label={`Download ${d.name}`}
                    className="w-11 h-11 grid place-items-center rounded-lg text-muted hover:bg-subtle cursor-pointer shrink-0">
                    <Download size={15} aria-hidden="true" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
        <p className="text-xs text-muted mt-5 pt-4 border-t border-line flex items-start gap-1.5">
          <ShieldCheck size={12} className="mt-0.5 shrink-0 text-ok" aria-hidden="true" />
          Institute-issued documents are read-only. Corrections must be requested through the Academic Section.
        </p>
      </Card>

      <Modal open={upload} onClose={() => setUpload(false)} title="Upload a document"
        footer={<><button className="btn-ghost" onClick={() => setUpload(false)}>Cancel</button>
                 <button className="btn-primary" onClick={() => { setUpload(false); toast('Document submitted for verification.') }}>
                   Submit for verification</button></>}>
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="dc">Category</label>
            <select id="dc" className="field cursor-pointer">{CATS.slice(1).map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div>
            <span className="label">File</span>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-line rounded-xl py-8 cursor-pointer hover:border-brand hover:bg-brand-50/40 transition">
              <Upload size={20} className="text-muted" aria-hidden="true" />
              <span className="text-sm text-muted">Click to browse — PDF, JPG or PNG up to 5 MB</span>
              <input type="file" className="sr-only" />
            </label>
          </div>
          <p className="text-xs text-muted flex items-start gap-1.5">
            <Clock size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            Uploaded documents are reviewed by the Academic Section, usually within two working days.
          </p>
        </div>
      </Modal>
    </div>
  )
}
