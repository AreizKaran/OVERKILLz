/** Wraps an async handler so rejected promises reach the error middleware. */
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

export function notFound(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      error: 'Validation failed',
      fields: Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message])),
    })
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'A record with that value already exists', key: err.keyValue })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Malformed ${err.path}` })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
