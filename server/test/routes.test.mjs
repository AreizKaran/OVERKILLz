/**
 * Route-level authorisation, over real HTTP.
 *
 * Boots the actual Express app and drives it with fetch. Mongoose model statics
 * are stubbed, so no database is needed — what is under test is the handler
 * logic: who is allowed to do what, and what each refusal returns.
 *
 *   node test/routes.test.mjs
 */
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'route-test-secret'

import mongoose from 'mongoose'
import { User, Course, Attendance, Assignment, Result } from '../src/models/index.js'
import { signToken } from '../src/middleware/auth.js'

let pass = 0, fail = 0
const check = (name, cond, detail = '') => {
  cond ? (pass++, console.log('  PASS', name)) : (fail++, console.log('  FAIL', name, detail))
}

const ids = {
  student: new mongoose.Types.ObjectId(),
  other:   new mongoose.Types.ObjectId(),
  faculty: new mongoose.Types.ObjectId(),
  admin:   new mongoose.Types.ObjectId(),
  ownCourse:   new mongoose.Types.ObjectId(),
  otherCourse: new mongoose.Types.ObjectId(),
}

const people = {
  [ids.student]: { _id: ids.student, role: 'student', status: 'Active' },
  [ids.faculty]: { _id: ids.faculty, role: 'faculty', status: 'Active' },
  [ids.admin]:   { _id: ids.admin,   role: 'admin',   status: 'Active' },
}

// --- stubs: authenticate loads the user; the handlers query Course/Result/etc.
User.findById = (id) => Promise.resolve(people[id] ?? null)

// A faculty filter on Course.findOne only matches the course they own.
Course.findOne = (q) => {
  const wantsOwner = q.faculty !== undefined
  const isOwn = String(q._id) === String(ids.ownCourse)
  if (wantsOwner && !isOwn) return Promise.resolve(null)   // not assigned
  return Promise.resolve({ _id: q._id, faculty: ids.faculty })
}
Course.find = () => ({ select: () => Promise.resolve([]) })
Attendance.findOneAndUpdate = (_f, doc) => Promise.resolve({ ...doc, _id: 'session1' })
Result.findOneAndUpdate  = (_f, doc) => Promise.resolve({ ...doc, _id: 'result1' })
Result.find = () => ({ populate: () => Promise.resolve([]) })
Assignment.create = (doc) => Promise.resolve({ ...doc, _id: 'assignment1' })

const { default: app } = await import('../src/index.js')
const server = app.listen(0)
await new Promise((r) => server.once('listening', r))
const base = `http://127.0.0.1:${server.address().port}`

const tokens = {
  student: signToken(people[ids.student]),
  faculty: signToken(people[ids.faculty]),
  admin:   signToken(people[ids.admin]),
}

const call = async (method, path, { as, body } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(as ? { Authorization: `Bearer ${tokens[as]}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  let json = null
  try { json = await res.json() } catch { /* no body */ }
  return { status: res.status, body: json }
}

console.log('\n=== unauthenticated access ===')
{
  const r = await call('GET', '/api/courses')
  check('no token -> 401', r.status === 401, String(r.status))
  const h = await call('GET', '/api/health')
  check('health check stays public', h.status === 200, String(h.status))
}

console.log('\n=== a student cannot reach another student (ownRecordOnly) ===')
{
  const own = await call('GET', `/api/results/${ids.student}`, { as: 'student' })
  check('own results -> 200', own.status === 200, String(own.status))
  const other = await call('GET', `/api/results/${ids.other}`, { as: 'student' })
  check("another student's results -> 403", other.status === 403, String(other.status))
  check('refusal explains why', /only access your own/i.test(other.body?.error ?? ''), other.body?.error)
  const staff = await call('GET', `/api/results/${ids.other}`, { as: 'faculty' })
  check('faculty reading a student -> 200', staff.status === 200, String(staff.status))
}

console.log('\n=== attendance is scoped to the assigned course ===')
{
  const own = await call('POST', '/api/attendance', { as: 'faculty',
    body: { course: ids.ownCourse, date: '2026-09-16', records: [] } })
  check('marking own course -> 201', own.status === 201, JSON.stringify(own.body))
  const foreign = await call('POST', '/api/attendance', { as: 'faculty',
    body: { course: ids.otherCourse, date: '2026-09-16', records: [] } })
  check("marking someone else's course -> 403", foreign.status === 403, String(foreign.status))
  const student = await call('POST', '/api/attendance', { as: 'student',
    body: { course: ids.ownCourse, date: '2026-09-16', records: [] } })
  check('a student marking attendance -> 403', student.status === 403, String(student.status))
  const admin = await call('POST', '/api/attendance', { as: 'admin',
    body: { course: ids.otherCourse, date: '2026-09-16', records: [] } })
  check('admin is not course-scoped -> 201', admin.status === 201, String(admin.status))
}

console.log('\n=== marks entry is scoped too (the gap fixed in 3962430) ===')
{
  const own = await call('POST', '/api/results', { as: 'faculty',
    body: { student: ids.student, course: ids.ownCourse, semester: 6, internal: 20, external: 40, grade: 'A', credits: 4 } })
  check('marks for own course -> 201', own.status === 201, JSON.stringify(own.body))
  const foreign = await call('POST', '/api/results', { as: 'faculty',
    body: { student: ids.student, course: ids.otherCourse, semester: 6, internal: 20, external: 40, grade: 'A', credits: 4 } })
  check("marks for a course they do not teach -> 403", foreign.status === 403, String(foreign.status))
  check('refusal names the reason', /not assigned to this course/i.test(foreign.body?.error ?? ''), foreign.body?.error)
}

console.log('\n=== assignment creation is scoped too ===')
{
  const own = await call('POST', '/api/assignments', { as: 'faculty',
    body: { title: 'Work', course: ids.ownCourse, due: '2026-10-01', maxMarks: 20 } })
  check('setting work on own course -> 201', own.status === 201, JSON.stringify(own.body))
  const foreign = await call('POST', '/api/assignments', { as: 'faculty',
    body: { title: 'Work', course: ids.otherCourse, due: '2026-10-01', maxMarks: 20 } })
  check("setting work on another's course -> 403", foreign.status === 403, String(foreign.status))
}

console.log('\n=== publishing results is admin-only ===')
{
  const asFaculty = await call('POST', '/api/results/publish', { as: 'faculty', body: { semester: 5 } })
  check('faculty publishing -> 403', asFaculty.status === 403, String(asFaculty.status))
  const asStudent = await call('POST', '/api/results/publish', { as: 'student', body: { semester: 5 } })
  check('student publishing -> 403', asStudent.status === 403, String(asStudent.status))
}

console.log('\n=== a deactivated account cannot use a still-valid token ===')
{
  people[ids.faculty].status = 'Suspended'
  const r = await call('GET', '/api/courses', { as: 'faculty' })
  check('suspended account -> 403', r.status === 403, String(r.status))
  check('refusal explains the account state', /not active/i.test(r.body?.error ?? ''), r.body?.error)
  people[ids.faculty].status = 'Active'
}

console.log('\n=== unknown routes ===')
{
  const r = await call('GET', '/api/nonexistent', { as: 'admin' })
  check('unknown route -> 404 JSON', r.status === 404 && !!r.body?.error, String(r.status))
}

server.close()
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
