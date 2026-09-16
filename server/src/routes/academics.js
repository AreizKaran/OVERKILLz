import { Router } from 'express'
import { Course, Attendance, Assignment, Exam, Result } from '../models/index.js'
import { authenticate, authorise, ownRecordOnly } from '../middleware/auth.js'
import { wrap } from '../middleware/errors.js'

const router = Router()
router.use(authenticate)

/* -------------------------------------------------------------- Courses */
router.get('/courses', wrap(async (req, res) => {
  // Each role sees only the courses it is entitled to.
  const filter = req.user.role === 'student' ? { students: req.user._id }
               : req.user.role === 'faculty' ? { faculty: req.user._id }
               : {}
  const courses = await Course.find(filter).populate('faculty', 'name designation cabin email')
  res.json({ courses })
}))

router.post('/courses', authorise('admin'), wrap(async (req, res) => {
  const course = await Course.create(req.body)
  res.status(201).json({ course })
}))

/* ----------------------------------------------------------- Attendance */
router.get('/attendance/:studentId', ownRecordOnly(), wrap(async (req, res) => {
  const sessions = await Attendance.find({ 'records.student': req.params.studentId })
    .populate('course', 'code name')
  const byCourse = {}
  for (const s of sessions) {
    const rec = s.records.find((r) => r.student.toString() === req.params.studentId)
    const key = s.course.code
    byCourse[key] ??= { code: key, name: s.course.name, held: 0, attended: 0 }
    byCourse[key].held += 1
    if (rec.status !== 'absent') byCourse[key].attended += 1
  }
  const courses = Object.values(byCourse).map((c) => ({ ...c, pct: Math.round((c.attended / c.held) * 100) }))
  const held = courses.reduce((s, c) => s + c.held, 0)
  const attended = courses.reduce((s, c) => s + c.attended, 0)
  res.json({ overall: held ? Math.round((attended / held) * 100) : 0, courses })
}))

router.post('/attendance', authorise('faculty', 'admin'), wrap(async (req, res) => {
  const { course, date, records } = req.body

  // A faculty member can only mark attendance for a course they own.
  const owned = await Course.findOne({ _id: course, ...(req.user.role === 'faculty' ? { faculty: req.user._id } : {}) })
  if (!owned) return res.status(403).json({ error: 'You are not assigned to this course' })

  const day = new Date(date)
  day.setHours(0, 0, 0, 0)

  const session = await Attendance.findOneAndUpdate(
    { course, date: day },
    { course, date: day, markedBy: req.user._id, records },
    { upsert: true, new: true, runValidators: true },
  )
  res.status(201).json({ session })
}))

/* ---------------------------------------------------------- Assignments */
router.get('/assignments', wrap(async (req, res) => {
  const courses = await Course.find(
    req.user.role === 'student' ? { students: req.user._id }
    : req.user.role === 'faculty' ? { faculty: req.user._id } : {},
  ).select('_id')

  const all = await Assignment.find({ course: { $in: courses.map((c) => c._id) } })
    .populate('course', 'code name').populate('faculty', 'name')

  // Students see their own submission only; never a classmate's.
  if (req.user.role === 'student') {
    const id = req.user._id.toString()
    return res.json({
      assignments: all.map((a) => {
        const mine = a.submissions.find((s) => s.student.toString() === id)
        const o = a.toObject()
        delete o.submissions
        return { ...o, submission: mine ?? null,
                 status: mine ? (mine.grade != null ? 'graded' : 'submitted')
                              : (a.due < new Date() ? 'overdue' : 'pending') }
      }),
    })
  }
  res.json({ assignments: all })
}))

router.post('/assignments', authorise('faculty', 'admin'), wrap(async (req, res) => {
  const assignment = await Assignment.create({ ...req.body, faculty: req.user._id })
  res.status(201).json({ assignment })
}))

router.post('/assignments/:id/submit', authorise('student'), wrap(async (req, res) => {
  const a = await Assignment.findById(req.params.id)
  if (!a) return res.status(404).json({ error: 'Assignment not found' })

  const id = req.user._id.toString()
  const existing = a.submissions.find((s) => s.student.toString() === id)
  if (existing?.grade != null) return res.status(409).json({ error: 'This submission has already been graded' })

  const entry = { student: req.user._id, file: req.body.file, remarks: req.body.remarks,
                  at: new Date(), late: new Date() > a.due }
  if (existing) Object.assign(existing, entry)
  else a.submissions.push(entry)

  await a.save()
  res.status(201).json({ ok: true, late: entry.late })
}))

router.post('/assignments/:id/grade', authorise('faculty', 'admin'), wrap(async (req, res) => {
  const { studentId, grade, feedback } = req.body
  const a = await Assignment.findById(req.params.id)
  if (!a) return res.status(404).json({ error: 'Assignment not found' })
  if (req.user.role === 'faculty' && a.faculty.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'You did not set this assignment' })
  }
  if (grade > a.maxMarks) return res.status(422).json({ error: `Grade exceeds the maximum of ${a.maxMarks}` })

  const sub = a.submissions.find((s) => s.student.toString() === studentId)
  if (!sub) return res.status(404).json({ error: 'No submission from that student' })
  sub.grade = grade
  sub.feedback = feedback
  await a.save()
  res.json({ ok: true })
}))

/* ------------------------------------------------------- Exams & results */
router.get('/exams', wrap(async (req, res) => {
  const courses = await Course.find(req.user.role === 'student' ? { students: req.user._id } : {}).select('_id')
  const exams = await Exam.find({ course: { $in: courses.map((c) => c._id) }, date: { $gte: new Date() } })
    .populate('course', 'code name').sort('date')

  if (req.user.role === 'student') {
    const id = req.user._id.toString()
    return res.json({ exams: exams.map((e) => {
      const o = e.toObject()
      o.seat = e.seats.find((s) => s.student?.toString() === id)?.seat ?? null
      delete o.seats                       // never expose the full seating plan
      return o
    }) })
  }
  res.json({ exams })
}))

router.get('/results/:studentId', ownRecordOnly(), wrap(async (req, res) => {
  const results = await Result.find({ student: req.params.studentId, published: true })
    .populate('course', 'code name credits')
  const points = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, F: 0 }
  const credits = results.reduce((s, r) => s + (r.credits ?? 0), 0)
  const weighted = results.reduce((s, r) => s + (points[r.grade] ?? 0) * (r.credits ?? 0), 0)
  res.json({
    results: results.map((r) => ({ ...r.toObject(), total: r.internal + r.external })),
    credits,
    cgpa: credits ? +(weighted / credits).toFixed(2) : null,
  })
}))

router.post('/results', authorise('faculty', 'admin'), wrap(async (req, res) => {
  const { student, course, semester, internal, external, grade, credits } = req.body
  const result = await Result.findOneAndUpdate(
    { student, course },
    { student, course, semester, internal, external, grade, credits },
    { upsert: true, new: true, runValidators: true },
  )
  res.status(201).json({ result })
}))

// Publishing results is an admin act — faculty enter marks, admin releases them.
router.post('/results/publish', authorise('admin'), wrap(async (req, res) => {
  const { semester } = req.body
  const r = await Result.updateMany({ semester }, { published: true })
  res.json({ published: r.modifiedCount })
}))

export default router
