import { User, Mail, Phone, MapPin, Droplet, CalendarDays, GraduationCap, FileText, Download, Shield } from 'lucide-react'
import { Card, SectionHead, Badge } from '../../components/ui/Primitives'
import { useAuth } from '../../lib/auth'

function Field({ icon: Icon, label, value }) {
  return (
    <div className="py-3 border-b border-line last:border-0">
      <dt className="flex items-center gap-1.5 text-xs text-muted">
        {Icon && <Icon size={12} aria-hidden="true" />} {label}
      </dt>
      <dd className="text-sm mt-1 break-words">{value ?? '—'}</dd>
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const isStudent = user.role === 'student'

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-navy text-white grid place-items-center text-2xl font-semibold shrink-0">
            {user.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted mt-1">
              {isStudent ? user.program : `${user.designation} · ${user.dept}`}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge tone="info" icon={false}>{isStudent ? `Semester ${user.semester}` : user.dept}</Badge>
              <Badge tone="neutral" icon={false}>{isStudent ? user.reg : user.empId}</Badge>
              {isStudent && <Badge tone="ok">{user.status}</Badge>}
            </div>
          </div>
          {isStudent && (
            <div className="flex gap-6 sm:border-l sm:border-line sm:pl-6">
              <div><div className="text-xs text-muted">CGPA</div><div className="text-xl font-semibold tnum mt-0.5">{user.cgpa}</div></div>
              <div><div className="text-xs text-muted">Attendance</div><div className="text-xl font-semibold tnum mt-0.5">{user.attendance}%</div></div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <SectionHead title="Personal information" />
          <dl>
            <Field icon={User} label="Full name" value={user.name} />
            {isStudent && <Field icon={CalendarDays} label="Date of birth"
              value={new Date(user.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />}
            {isStudent && <Field icon={Droplet} label="Blood group" value={user.blood} />}
            <Field icon={Mail} label="Institute email" value={user.email} />
            {isStudent && <Field icon={Phone} label="Contact" value={user.phone} />}
          </dl>
        </Card>

        <Card className="p-5">
          <SectionHead title="Academic information" />
          <dl>
            <Field icon={GraduationCap} label={isStudent ? 'Programme' : 'Designation'} value={isStudent ? user.program : user.designation} />
            <Field icon={FileText} label="Department" value={user.dept} />
            {isStudent
              ? <>
                  <Field label="Semester / Section" value={`${user.semester} / ${user.section}`} />
                  <Field label="Registration number" value={user.reg} />
                </>
              : <>
                  <Field label="Employee ID" value={user.empId} />
                  {user.cabin && <Field icon={MapPin} label="Cabin" value={user.cabin} />}
                </>}
          </dl>
        </Card>

        {isStudent && (
          <>
            <Card className="p-5">
              <SectionHead title="Contact information" />
              <dl>
                <Field icon={MapPin} label="Residential address" value={user.address} />
                <Field icon={Phone} label="Mobile" value={user.phone} />
                <Field icon={Mail} label="Personal email" value="aditya.sharma02@gmail.com" />
              </dl>
            </Card>

            <Card className="p-5">
              <SectionHead title="Guardian information" />
              <dl>
                <Field icon={User} label={`${user.guardian.relation}'s name`} value={user.guardian.name} />
                <Field label="Occupation" value={user.guardian.occupation} />
                <Field icon={Phone} label="Contact" value={user.guardian.phone} />
                <Field icon={Mail} label="Email" value={user.guardian.email} />
              </dl>
            </Card>
          </>
        )}
      </div>

      <Card className="p-5">
        <SectionHead title="Documents" sub="Verified records held by the institute" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {['Class XII marksheet', 'Class X marksheet', 'Admission letter', 'Aadhaar (masked)', 'Migration certificate', 'Semester V marksheet']
            .map((d) => (
            <button key={d} className="flex items-center gap-3 p-3.5 rounded-xl border border-line hover:border-brand hover:bg-brand-50/50 transition text-left cursor-pointer">
              <FileText size={17} className="text-muted shrink-0" aria-hidden="true" />
              <span className="text-sm flex-1 truncate">{d}</span>
              <Download size={14} className="text-muted shrink-0" aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted mt-4 flex items-start gap-1.5">
          <Shield size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
          Documents are read-only. Corrections must be requested through the Academic Section.
        </p>
      </Card>
    </div>
  )
}
