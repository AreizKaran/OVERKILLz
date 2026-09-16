import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

const SECRET = () => {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET is not set — refusing to sign or verify tokens')
  return s
}

export const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, SECRET(),
           { expiresIn: process.env.JWT_TTL ?? '8h' })

/** Verifies the bearer token and loads the current user onto req.user. */
export async function authenticate(req, res, next) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required' })

  try {
    const payload = jwt.verify(token, SECRET())
    const user = await User.findById(payload.sub)
    if (!user) return res.status(401).json({ error: 'Account no longer exists' })
    if (user.status !== 'Active') return res.status(403).json({ error: 'Account is not active' })
    req.user = user
    next()
  } catch (err) {
    const expired = err.name === 'TokenExpiredError'
    res.status(401).json({ error: expired ? 'Session expired — sign in again' : 'Invalid token' })
  }
}

/** Route guard: authorise('faculty', 'admin') */
export const authorise = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' })
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Your role does not have access to this resource' })
  }
  next()
}

/**
 * Students may only ever address their own record. Staff may address any.
 * Applied on every route that takes a :studentId, so a student cannot read
 * another student's marks, fees or attendance by changing the URL.
 */
export const ownRecordOnly = (param = 'studentId') => (req, res, next) => {
  if (req.user.role !== 'student') return next()
  if (req.params[param] !== req.user._id.toString()) {
    return res.status(403).json({ error: 'You can only access your own record' })
  }
  next()
}
