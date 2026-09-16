import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User, Course, Notice, Fee, Feedback, FeedbackReceipt, Attendance, Result } from '../models/index.js'
import { authenticate, authorise, ownRecordOnly } from '../middleware/auth.js'
import { wrap } from '../middleware/errors.js'

const router = Router()
router.use(authenticate)

/* ------------------------------------------------------------- Directory */
router.get('/users', authorise('faculty', 'admin'), wrap(async (req, res) => {
  const { role, dept, q, page = 1, limit = 20 } = req.query
  const filter = {}
  if (role) filter.role = role
  if (dept) filter.dept = dept
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { reg: new RegExp(q, 'i') }, { empId: new RegExp(q, 'i') }]

  const [users, total] = await Promise.all([
    User.find(filter).skip((page - 1) * limit).limit(Math.min(+limit, 100)).sort('name'),
    User.countDocuments(filter),
  ])
  res.json({ users, total, page: +page, pages: Math.ceil(total / limit) })
}))

// The faculty directory is readable by everyone; it exposes only public fields.
router.get('/faculty', wrap(async (req, res) => {
  const faculty = await User.find({ role: 'faculty' })
    .select('name designation dept cabin email phone')
    .sort('name')
  res.json({ faculty })
}))

router.post('/users', authorise('admin'), wrap(async (req, res) => {
  const { password, ...rest } = req.body
  if (!password || password.length < 8) return res.status(422).json({ error: 'Password must be at least 8 characters' })
  const user = await User.create({ ...rest, password: await bcrypt.hash(password, 12) })
  const safe = user.toObject(); delete safe.password
  res.status(201).json({ user: safe })
}))

/* --------------------------------------------------------------- Notices */
router.get('/notices', wrap(async (req, res) => {
  const notices = await Notice.find({ $or: [{ audience: req.user.role }, { audience: { $size: 0 } }] })
    .populate('author', 'name designation').sort('-createdAt').limit(100)
  res.json({ notices })
}))

router.post('/notices', authorise('faculty', 'admin'), wrap(async (req, res) => {
  const notice = await Notice.create({ ...req.body, author: req.user._id })
  res.status(201).json({ notice })
}))

/* ------------------------------------------------------------------ Fees */
router.get('/fees/:studentId', ownRecordOnly(), wrap(async (req, res) => {
  const fee = await Fee.findOne({ student: req.params.studentId })
  if (!fee) return res.status(404).json({ error: 'No fee record for this student' })
  const total = fee.breakdown.reduce((s, b) => s + b.amount, 0)
  const paid = fee.payments.reduce((s, p) => s + p.amount, 0)
  res.json({ fee, total, paid, pending: total - paid })
}))

router.post('/fees/:studentId/pay', ownRecordOnly(), wrap(async (req, res) => {
  const { amount, mode } = req.body
  if (!(amount > 0)) return res.status(422).json({ error: 'Amount must be greater than zero' })

  const fee = await Fee.findOne({ student: req.params.studentId })
  if (!fee) return res.status(404).json({ error: 'No fee record for this student' })

  const total = fee.breakdown.reduce((s, b) => s + b.amount, 0)
  const paid = fee.payments.reduce((s, p) => s + p.amount, 0)
  if (amount > total - paid) return res.status(422).json({ error: 'Amount exceeds the outstanding balance' })

  const receipt = `SMIT/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`
  fee.payments.push({ receipt, amount, mode })
  await fee.save()
  res.status(201).json({ receipt, paid: paid + amount, pending: total - paid - amount })
}))

/* -------------------------------------------------------------- Feedback */
router.post('/feedback', authorise('student'), wrap(async (req, res) => {
  const { faculty, course, semester, scores, comments } = req.body

  // The receipt enforces one response per faculty per semester. It is written
  // first and separately, so the response itself never carries the student ID.
  try {
    await FeedbackReceipt.create({ student: req.user._id, faculty, semester })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'You have already submitted feedback for this faculty member' })
    throw err
  }
  await Feedback.create({ faculty, course, semester, scores, comments })
  res.status(201).json({ ok: true })
}))

router.get('/feedback/:facultyId', authorise('faculty', 'admin'), wrap(async (req, res) => {
  if (req.user.role === 'faculty' && req.params.facultyId !== req.user._id.toString()) {
    return res.status(403).json({ error: 'You can only view your own feedback' })
  }
  const rows = await Feedback.find({ faculty: req.params.facultyId })

  // Aggregates are withheld below a threshold, where small samples could be
  // traced back to individuals.
  const MIN = 5
  if (rows.length < MIN) {
    return res.json({ responses: rows.length, withheld: true,
                      message: `Aggregates are released once at least ${MIN} responses are recorded.` })
  }
  const keys = ['teaching', 'communication', 'knowledge', 'organisation']
  const averages = Object.fromEntries(
    keys.map((k) => [k, +(rows.reduce((s, r) => s + r.scores[k], 0) / rows.length).toFixed(2)]))
  const overall = +(Object.values(averages).reduce((a, b) => a + b, 0) / keys.length).toFixed(2)
  res.json({ responses: rows.length, averages, overall, withheld: false })
}))

/* ------------------------------------------------------------ Dashboards */
router.get('/stats', authorise('admin'), wrap(async (req, res) => {
  const [students, faculty, courses, sessions, fees] = await Promise.all([
    User.countDocuments({ role: 'student', status: 'Active' }),
    User.countDocuments({ role: 'faculty' }),
    Course.countDocuments(),
    Attendance.find().select('records'),
    Fee.find().select('breakdown payments'),
  ])

  const marks = sessions.flatMap((s) => s.records)
  const attendance = marks.length
    ? +((marks.filter((r) => r.status !== 'absent').length / marks.length) * 100).toFixed(1)
    : 0

  const demand = fees.reduce((s, f) => s + f.breakdown.reduce((a, b) => a + b.amount, 0), 0)
  const collected = fees.reduce((s, f) => s + f.payments.reduce((a, p) => a + p.amount, 0), 0)

  res.json({ students, faculty, courses, attendance, demand, collected,
             collectionRate: demand ? +((collected / demand) * 100).toFixed(1) : 0 })
}))

export default router
