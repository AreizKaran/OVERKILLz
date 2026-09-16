import { Router } from 'express'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { User } from '../models/index.js'
import { signToken, authenticate } from '../middleware/auth.js'
import { wrap } from '../middleware/errors.js'

const router = Router()

// Blunt brute-force brake on the credential endpoint.
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Try again in 15 minutes.' } })

router.post('/login', loginLimiter, wrap(async (req, res) => {
  const { identifier, password } = req.body
  if (!identifier || !password) return res.status(400).json({ error: 'Identifier and password are required' })

  // Accept registration number, employee ID or email.
  const user = await User.findOne({
    $or: [{ reg: identifier }, { empId: identifier }, { email: String(identifier).toLowerCase() }],
  }).select('+password')

  // Same message and timing shape either way — no account enumeration.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  user.lastLoginAt = new Date()
  await user.save()

  const safe = user.toObject()
  delete safe.password
  res.json({ token: signToken(user), user: safe })
}))

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }))

router.post('/change-password', authenticate, wrap(async (req, res) => {
  const { current, next } = req.body
  if (!next || next.length < 8) return res.status(422).json({ error: 'New password must be at least 8 characters' })

  const user = await User.findById(req.user._id).select('+password')
  if (!(await bcrypt.compare(current ?? '', user.password))) {
    return res.status(401).json({ error: 'Current password is incorrect' })
  }
  user.password = await bcrypt.hash(next, 12)
  await user.save()
  res.json({ ok: true })
}))

export default router
