/**
 * The one place that decides where data comes from.
 *
 * Every loader returns the same shape in both modes, so pages never branch on
 * `isLive`. Live responses are normalised here to the sample-data shape, which
 * is what the components were written against.
 */
import { api, isLive } from '../lib/api'
import * as mock from './mock'

const delay = (value, ms = 420) => new Promise((r) => setTimeout(() => r(value), ms))

/* -------------------------------------------------------- normalisers --- */

const normaliseCourse = (c) => ({
  id: c._id, code: c.code, name: c.name, credits: c.credits,
  faculty: c.faculty?.name ?? '—', facultyId: c.faculty?._id,
  room: c.room, attendance: c.attendance ?? 0, internal: c.internal ?? 0,
  max: 30, progress: c.progress ?? 0,
})

const normaliseAssignment = (a) => ({
  id: a._id, title: a.title,
  course: a.course?.code ?? '—', courseName: a.course?.name ?? '—',
  faculty: a.faculty?.name ?? '—',
  due: a.due, status: a.status ?? 'pending',
  grade: a.submission?.grade ?? null, max: a.maxMarks,
  submitted: a.submissions?.length ?? 0, total: a.course?.students?.length ?? 0,
})

const normaliseNotice = (n) => ({
  id: n._id, title: n.title, body: n.body, cat: n.category,
  dept: n.dept ?? n.author?.designation ?? 'Institute',
  date: n.createdAt, priority: n.priority,
})

const normaliseFaculty = (f) => ({
  id: f._id, name: f.name, designation: f.designation, dept: f.dept,
  cabin: f.cabin, email: f.email, phone: f.phone,
  subjects: f.subjects ?? [], rating: f.rating ?? null,
  experience: f.experience ?? '—', qualification: f.qualification ?? '—',
})

const normaliseExam = (e) => ({
  id: e._id, course: e.course?.code ?? '—', name: e.course?.name ?? '—',
  date: e.date, time: `${e.startTime} – ${e.endTime}`,
  room: e.room, seat: e.seat ?? '—', type: e.type,
})

/* ------------------------------------------------------------ loaders --- */

export const source = {
  courses: () =>
    isLive ? api.courses().then((r) => r.courses.map(normaliseCourse)) : delay(mock.COURSES),

  attendance: (studentId) =>
    isLive
      ? api.attendance(studentId).then((r) => ({
          overall: r.overall,
          courses: r.courses.map((c) => ({ ...c, id: c.code, attendance: c.pct })),
        }))
      : delay({
          overall: mock.USERS[0].attendance,
          courses: mock.COURSES.map((c) => ({ ...c, held: 48, attended: Math.round((c.attendance / 100) * 48), pct: c.attendance })),
        }),

  assignments: () =>
    isLive ? api.assignments().then((r) => r.assignments.map(normaliseAssignment)) : delay(mock.ASSIGNMENTS),

  exams: () =>
    isLive ? api.exams().then((r) => r.exams.map(normaliseExam)) : delay(mock.EXAMS),

  results: (studentId) =>
    isLive
      ? api.results(studentId).then((r) => ({
          results: r.results.map((x) => ({
            code: x.course?.code, name: x.course?.name, internal: x.internal,
            external: x.external, total: x.total, grade: x.grade, credits: x.credits,
          })),
          credits: r.credits, cgpa: r.cgpa,
        }))
      : delay({ results: mock.RESULTS, credits: mock.RESULTS.reduce((s, r) => s + r.credits, 0), cgpa: 8.24 }),

  notices: () =>
    isLive ? api.notices().then((r) => r.notices.map(normaliseNotice)) : delay(mock.NOTICES),

  faculty: () =>
    isLive ? api.faculty().then((r) => r.faculty.map(normaliseFaculty)) : delay(mock.FACULTY),

  students: (opts) =>
    isLive
      ? api.students(opts).then((r) => ({
          students: r.users.map((u) => ({
            id: u._id, reg: u.reg, name: u.name, sem: u.semester, dept: u.dept,
            att: u.attendance ?? 0, cgpa: u.cgpa ?? '—',
          })),
          total: r.total, pages: r.pages,
        }))
      : delay(null), // sample mode generates its own roster in the page

  fees: (studentId) =>
    isLive
      ? api.fees(studentId).then((r) => ({
          total: r.total, paid: r.paid, pending: r.pending,
          due: r.fee.dueDate,
          breakdown: r.fee.breakdown,
          history: r.fee.payments.map((p) => ({
            id: p._id, receipt: p.receipt, date: p.at, amount: p.amount, mode: p.mode, status: 'paid',
          })),
        }))
      : delay(mock.FEES),

  stats: () =>
    isLive
      ? api.stats().then((r) => ({
          students: r.students, faculty: r.faculty, courses: r.courses,
          attendance: r.attendance, collected: +(r.collected / 1e7).toFixed(2),
          pending: Math.round((r.demand - r.collected) / 1e5),
        }))
      : delay(mock.ADMIN_KPIS),
}

export { isLive }
