import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import academicRoutes from './routes/academics.js'
import adminRoutes from './routes/admin.js'
import { notFound, errorHandler } from './middleware/errors.js'

const app = express()
const PORT = process.env.PORT ?? 4000

app.set('trust proxy', 1)
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '1mb' }))
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}
app.use(rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true, legacyHeaders: false }))

app.get('/api/health', (req, res) =>
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }))

app.use('/api/auth', authRoutes)
app.use('/api', academicRoutes)
app.use('/api', adminRoutes)

app.use(notFound)
app.use(errorHandler)

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set. Copy .env.example to .env and set it before starting.')
    process.exit(1)
  }
  await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/smit-ams')
  console.log('MongoDB connected')
  app.listen(PORT, () => console.log(`SMIT AMS API listening on http://localhost:${PORT}`))
}

// Allows the app to be imported by tests without opening a port.
if (process.env.NODE_ENV !== 'test') start().catch((e) => { console.error(e); process.exit(1) })

export default app
