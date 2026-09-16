/**
 * The one place that decides where data comes from.
 *
 * Every loader returns the same shape in both modes, so pages never branch on
 * `isLive`. Live responses are normalised here to the sample-data shape, which
 * is what the components were written against.
 */
import { api, isLive, request } from '../lib/api'
import { normaliseCourse, normaliseAssignment, normaliseNotice, normaliseFaculty, normaliseExam } from './normalise'
import * as mock from './mock'

const delay = (value, ms = 420) => new Promise((r) => setTimeout(() => r(value), ms))

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

/* ------------------------------------------------------------ mutations --- */
/**
 * In live mode these hit the API and throw ApiError on failure, so callers can
 * surface the server's message. In sample mode they resolve after a short delay
 * so the optimistic UI and button loading states still exercise the same path.
 */
export const mutate = {
  submitAssignment: (id, file, remarks) =>
    isLive ? api.submitAssignment(id, file, remarks) : delay({ ok: true }, 650),

  markAttendance: (course, date, records) =>
    isLive ? api.markAttendance(course, date, records) : delay({ ok: true }, 650),

  payFees: (studentId, amount, mode) =>
    isLive ? api.payFees(studentId, amount, mode) : delay({ receipt: `SMIT/2026/${String(Date.now()).slice(-6)}` }, 800),

  publishNotice: (notice) =>
    isLive ? api.publishNotice(notice) : delay({ ok: true }, 650),

  submitFeedback: (payload) =>
    isLive ? api.submitFeedback(payload) : delay({ ok: true }, 650),

  createAssignment: (payload) =>
    isLive ? request('/api/assignments', { method: 'POST', body: payload }) : delay({ ok: true }, 650),
}
