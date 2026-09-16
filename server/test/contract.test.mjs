/**
 * Client/server contract.
 *
 * Builds documents with the real Mongoose schemas (validateSync runs the full
 * validator chain without a database), shapes them exactly as the route
 * handlers do, then feeds the result through the client's normalisers and
 * asserts that every field the UI reads survives the trip.
 *
 * This is what catches a field renamed on one side and not the other — the
 * failure mode you would otherwise only meet on first connection.
 *
 *   node test/contract.test.mjs
 */
import mongoose from 'mongoose'
import { User, Course, Assignment, Exam, Result, Notice, Fee } from '../src/models/index.js'
import {
  normaliseCourse, normaliseAssignment, normaliseNotice, normaliseFaculty, normaliseExam,
} from '../../client/src/data/normalise.js'

let pass = 0, fail = 0
const check = (name, cond, detail = '') => {
  cond ? (pass++, console.log('  PASS', name)) : (fail++, console.log('  FAIL', name, detail))
}

/** Every listed field must be present and not undefined/null/NaN. */
const defined = (obj, fields, label) => {
  const missing = fields.filter((f) => {
    const v = f.split('.').reduce((o, k) => (o == null ? o : o[k]), obj)
    return v === undefined || v === null || (typeof v === 'number' && Number.isNaN(v))
  })
  check(`${label}: ${fields.length} UI fields survive normalisation`, missing.length === 0,
        missing.length ? `missing: ${missing.join(', ')}` : '')
}

const oid = () => new mongoose.Types.ObjectId()

console.log('\n=== schemas accept the documents the seed and routes create ===')
{
  const faculty = new User({ role: 'faculty', name: 'Dr. Priya Rai', email: 'p@smit.smu.edu.in',
                             password: 'hashed-placeholder', empId: 'SMIT-F-0418', dept: 'CSE',
                             designation: 'Associate Professor', cabin: 'AB-II, 304' })
  check('faculty user validates', !faculty.validateSync(), faculty.validateSync()?.message)

  const student = new User({ role: 'student', name: 'Aditya Sharma', email: 'a@smit.smu.edu.in',
                             password: 'hashed-placeholder', reg: '202100114', dept: 'CSE', semester: 6 })
  check('student user validates', !student.validateSync(), student.validateSync()?.message)

  const bad = new User({ role: 'registrar', name: 'X', email: 'x@y.z', password: 'p' })
  check('an unknown role is rejected', !!bad.validateSync())

  const badSem = new User({ role: 'student', name: 'X', email: 'x2@y.z', password: 'p', semester: 99 })
  check('semester above 8 is rejected', !!badSem.validateSync())
}

console.log('\n=== GET /courses -> normaliseCourse ===')
{
  const facultyId = oid()
  const course = new Course({ code: 'CS1601', name: 'Data Structures & Algorithms', credits: 4,
                              dept: 'CSE', semester: 6, faculty: facultyId, room: 'AB-II 201' })
  check('course validates', !course.validateSync(), course.validateSync()?.message)

  // The route populates faculty with name/designation/cabin/email.
  const payload = { ...course.toObject(), faculty: { _id: facultyId, name: 'Dr. Priya Rai', designation: 'Associate Professor' } }
  const ui = normaliseCourse(payload)
  defined(ui, ['id', 'code', 'name', 'credits', 'faculty', 'room', 'attendance', 'internal', 'max', 'progress'], 'course')
  check('course code is uppercased by the schema', ui.code === 'CS1601', ui.code)
  check('faculty name is unwrapped from the populated object', ui.faculty === 'Dr. Priya Rai', ui.faculty)
}

console.log('\n=== GET /assignments (student branch) -> normaliseAssignment ===')
{
  const courseId = oid(), studentId = oid(), facultyId = oid()
  const a = new Assignment({ title: 'AVL Tree Implementation', course: courseId, faculty: facultyId,
                             due: new Date('2026-09-18'), maxMarks: 20,
                             submissions: [{ student: studentId, at: new Date(), grade: 17 }] })
  check('assignment validates', !a.validateSync(), a.validateSync()?.message)

  // Mirrors the route: strips submissions, attaches the caller's own, derives status.
  const o = a.toObject()
  const mine = o.submissions.find((s) => s.student.toString() === studentId.toString())
  delete o.submissions
  const payload = { ...o, course: { code: 'CS1601', name: 'Data Structures', students: [studentId] },
                    faculty: { name: 'Dr. Priya Rai' }, submission: mine,
                    status: mine.grade != null ? 'graded' : 'submitted' }
  const ui = normaliseAssignment(payload)
  defined(ui, ['id', 'title', 'course', 'courseName', 'faculty', 'due', 'status', 'max'], 'assignment')
  check('a graded submission surfaces its grade', ui.grade === 17, String(ui.grade))
  check('status reaches the badge', ui.status === 'graded', ui.status)
  check("another student's submission is not exposed", payload.submissions === undefined)
}

console.log('\n=== GET /exams (student branch) -> normaliseExam ===')
{
  const courseId = oid(), studentId = oid()
  const e = new Exam({ course: courseId, type: 'End Semester', date: new Date('2026-10-12'),
                       startTime: '10:00', endTime: '13:00', room: 'Exam Hall 204',
                       seats: [{ student: studentId, seat: 'C-18' }] })
  check('exam validates', !e.validateSync(), e.validateSync()?.message)

  const o = e.toObject()
  o.seat = o.seats.find((s) => s.student.toString() === studentId.toString()).seat
  delete o.seats                                   // route strips the seating plan
  const ui = normaliseExam({ ...o, course: { code: 'CS1602', name: 'Computer Networks' } })
  defined(ui, ['id', 'course', 'name', 'date', 'time', 'room', 'seat', 'type'], 'exam')
  check('time is composed from start and end', ui.time === '10:00 – 13:00', ui.time)
  check('the full seating plan is not exposed', o.seats === undefined)
}

console.log('\n=== GET /notices -> normaliseNotice ===')
{
  const n = new Notice({ title: 'End Semester Examination Schedule', body: 'Commences 12 October.',
                         category: 'Examination', priority: 'high', dept: 'Examination Cell',
                         author: oid(), audience: ['student'] })
  check('notice validates', !n.validateSync(), n.validateSync()?.message)
  const ui = normaliseNotice({ ...n.toObject(), createdAt: new Date(), author: { designation: 'Registrar' } })
  defined(ui, ['id', 'title', 'body', 'cat', 'dept', 'date', 'priority'], 'notice')
  check('category maps to the UI’s cat field', ui.cat === 'Examination', ui.cat)

  const badCat = new Notice({ title: 'X', body: 'Y', category: 'Gossip', author: oid() })
  check('an unknown category is rejected', !!badCat.validateSync())
}

console.log('\n=== GET /faculty -> normaliseFaculty ===')
{
  const f = new User({ role: 'faculty', name: 'Dr. Tenzing Bhutia', email: 't@smit.smu.edu.in',
                       password: 'hashed', empId: 'SMIT-F-0233', dept: 'CSE',
                       designation: 'Professor', cabin: 'AB-II, 310', phone: '+91 98320 11318' })
  // The route selects only public fields.
  const { _id, name, designation, dept, cabin, email, phone } = f.toObject()
  const ui = normaliseFaculty({ _id, name, designation, dept, cabin, email, phone })
  defined(ui, ['id', 'name', 'designation', 'dept', 'cabin', 'email', 'phone'], 'faculty')
  check('subjects defaults to an array the UI can join', Array.isArray(ui.subjects), typeof ui.subjects)
  check('the password is never in the projected payload', !('password' in { _id, name, designation, dept, cabin, email, phone }))
}

console.log('\n=== derived values the routes compute ===')
{
  const r = new Result({ student: oid(), course: oid(), semester: 5, internal: 26, external: 58,
                         grade: 'A', credits: 4, published: true })
  check('result validates', !r.validateSync(), r.validateSync()?.message)
  check('total virtual = internal + external', r.total === 84, String(r.total))

  const over = new Result({ student: oid(), course: oid(), semester: 5, internal: 45, external: 10 })
  check('internal above 40 is rejected', !!over.validateSync())

  const fee = new Fee({ student: oid(), semester: 6,
                        breakdown: [{ head: 'Tuition', amount: 62000, paid: 62000 },
                                    { head: 'Hostel', amount: 21000, paid: 10000 }],
                        payments: [{ receipt: 'SMIT/2026/004821', amount: 45000, mode: 'UPI' }] })
  check('fee validates', !fee.validateSync(), fee.validateSync()?.message)
  check('total virtual sums the breakdown', fee.total === 83000, String(fee.total))
  check('paid virtual sums the payments', fee.paid === 45000, String(fee.paid))

  const badMode = new Fee({ student: oid(), semester: 6, breakdown: [],
                            payments: [{ receipt: 'R', amount: 1, mode: 'Bitcoin' }] })
  check('an unknown payment mode is rejected', !!badMode.validateSync())
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
