/**
 * Transport for the Express API in ../../server.
 *
 * The app runs in one of two modes, decided by VITE_API_URL:
 *   unset -> sample-data mode. Every screen works offline from src/data/mock.js.
 *   set   -> live mode. Requests go to that origin with a bearer token.
 *
 * Keeping both behind one module means components never know which is active.
 */

export const API_URL = import.meta.env.VITE_API_URL ?? ''
export const isLive = Boolean(API_URL)

const TOKEN_KEY = 'smit-ams.token'

export const getToken = () => {
  try { return sessionStorage.getItem(TOKEN_KEY) } catch { return null }
}
export const setToken = (t) => {
  try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY) } catch { /* private mode */ }
}

/** Thrown for any non-2xx response, carrying the server's message and status. */
export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

/** Set by AuthProvider so a 401 anywhere can end the session once, centrally. */
let onUnauthorised = null
export const setUnauthorisedHandler = (fn) => { onUnauthorised = fn }

export async function request(path, { method = 'GET', body, signal } = {}) {
  if (!isLive) throw new ApiError('API is not configured (VITE_API_URL is unset)', 0)

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method, headers, signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Cannot reach the server. Check your connection.', 0)
  }

  if (res.status === 204) return null

  let payload = null
  try { payload = await res.json() } catch { /* empty or non-JSON body */ }

  if (!res.ok) {
    // An expired or rejected token ends the session rather than leaving the UI
    // in a half-authenticated state.
    if (res.status === 401) onUnauthorised?.()
    throw new ApiError(payload?.error ?? `Request failed (${res.status})`, res.status, payload?.fields)
  }
  return payload
}

const get  = (p, o) => request(p, { ...o })
const post = (p, body, o) => request(p, { ...o, method: 'POST', body })

export const api = {
  auth: {
    login:  (identifier, password) => post('/api/auth/login', { identifier, password }),
    me:     () => get('/api/auth/me'),
    changePassword: (current, next) => post('/api/auth/change-password', { current, next }),
  },
  courses:     () => get('/api/courses'),
  attendance:  (studentId) => get(`/api/attendance/${studentId}`),
  markAttendance: (course, date, records) => post('/api/attendance', { course, date, records }),
  assignments: () => get('/api/assignments'),
  submitAssignment: (id, file, remarks) => post(`/api/assignments/${id}/submit`, { file, remarks }),
  gradeAssignment:  (id, studentId, grade, feedback) => post(`/api/assignments/${id}/grade`, { studentId, grade, feedback }),
  exams:       () => get('/api/exams'),
  results:     (studentId) => get(`/api/results/${studentId}`),
  notices:     () => get('/api/notices'),
  publishNotice: (notice) => post('/api/notices', notice),
  faculty:     () => get('/api/faculty'),
  students:    ({ q = '', page = 1, limit = 20 } = {}) =>
                 get(`/api/users?role=student&page=${page}&limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  fees:        (studentId) => get(`/api/fees/${studentId}`),
  payFees:     (studentId, amount, mode) => post(`/api/fees/${studentId}/pay`, { amount, mode }),
  submitFeedback: (payload) => post('/api/feedback', payload),
  facultyFeedback: (facultyId) => get(`/api/feedback/${facultyId}`),
  stats:       () => get('/api/stats'),
  health:      () => get('/api/health'),
}
