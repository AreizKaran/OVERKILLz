/**
 * Pure shape adapters: Mongo/Express payloads in, sample-data shape out.
 *
 * Kept free of import.meta so the client/server contract test can import them
 * directly in Node. source.js re-exports nothing from here; it just uses them.
 */
export const normaliseCourse = (c) => ({
  id: c._id, code: c.code, name: c.name, credits: c.credits,
  faculty: c.faculty?.name ?? '—', facultyId: c.faculty?._id,
  room: c.room, attendance: c.attendance ?? 0, internal: c.internal ?? 0,
  max: 30, progress: c.progress ?? 0,
})

export const normaliseAssignment = (a) => ({
  id: a._id, title: a.title,
  course: a.course?.code ?? '—', courseName: a.course?.name ?? '—',
  faculty: a.faculty?.name ?? '—',
  due: a.due, status: a.status ?? 'pending',
  grade: a.submission?.grade ?? null, max: a.maxMarks,
  submitted: a.submissions?.length ?? 0, total: a.course?.students?.length ?? 0,
})

export const normaliseNotice = (n) => ({
  id: n._id, title: n.title, body: n.body, cat: n.category,
  dept: n.dept ?? n.author?.designation ?? 'Institute',
  date: n.createdAt, priority: n.priority,
})

export const normaliseFaculty = (f) => ({
  id: f._id, name: f.name, designation: f.designation, dept: f.dept,
  cabin: f.cabin, email: f.email, phone: f.phone,
  subjects: f.subjects ?? [], rating: f.rating ?? null,
  experience: f.experience ?? '—', qualification: f.qualification ?? '—',
})

export const normaliseExam = (e) => ({
  id: e._id, course: e.course?.code ?? '—', name: e.course?.name ?? '—',
  date: e.date, time: `${e.startTime} – ${e.endTime}`,
  room: e.room, seat: e.seat ?? '—', type: e.type,
})
