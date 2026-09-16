import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User, Course, Notice, Fee, Attendance, Exam } from './models/index.js'

/**
 * Seeds a demo institute. Destructive: drops the target database first.
 * Run with `npm run seed`. Guarded against production by NODE_ENV.
 */
const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? 'smit@demo2026'

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed a production database.')
    process.exit(1)
  }
  await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/smit-ams')
  await mongoose.connection.dropDatabase()
  console.log('Database cleared.')

  const hash = await bcrypt.hash(DEMO_PASSWORD, 12)

  const faculty = await User.create([
    { role: 'faculty', name: 'Dr. Priya Rai',        email: 'priya.rai@smit.smu.edu.in',      password: hash, empId: 'SMIT-F-0418', dept: 'CSE', designation: 'Associate Professor', cabin: 'AB-II, 304' },
    { role: 'faculty', name: 'Dr. Tenzing Bhutia',   email: 'tenzing.bhutia@smit.smu.edu.in', password: hash, empId: 'SMIT-F-0233', dept: 'CSE', designation: 'Professor',           cabin: 'AB-II, 310' },
    { role: 'faculty', name: 'Prof. Sujata Chettri', email: 'sujata.chettri@smit.smu.edu.in', password: hash, empId: 'SMIT-F-0561', dept: 'CSE', designation: 'Assistant Professor', cabin: 'AB-I, 114' },
  ])

  const admin = await User.create({
    role: 'admin', name: 'Anil Gurung', email: 'anil.gurung@smit.smu.edu.in',
    password: hash, empId: 'SMIT-A-0032', dept: 'Administration', designation: 'Academic Registrar',
  })

  const students = await User.create(
    ['Aditya Sharma', 'Bhavya Rai', 'Chirag Tamang', 'Deepika Subba', 'Eshan Pradhan', 'Farhan Ali']
      .map((name, i) => ({
        role: 'student', name, password: hash,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@smit.smu.edu.in`,
        reg: String(202100114 + i * 4), dept: 'CSE', semester: 6, section: 'B',
        programme: 'B.Tech Computer Science & Engineering',
      })))

  const courses = await Course.create([
    { code: 'CS1601', name: 'Data Structures & Algorithms', credits: 4, dept: 'CSE', semester: 6, faculty: faculty[0]._id, students: students.map((s) => s._id), room: 'AB-II 201' },
    { code: 'CS1602', name: 'Computer Networks',            credits: 4, dept: 'CSE', semester: 6, faculty: faculty[1]._id, students: students.map((s) => s._id), room: 'AB-II 204' },
    { code: 'CS1603', name: 'Database Management Systems',  credits: 4, dept: 'CSE', semester: 6, faculty: faculty[2]._id, students: students.map((s) => s._id), room: 'AB-I 108' },
  ])

  // Six weeks of attendance, so the percentage views have something real to read.
  const sessions = []
  for (const course of courses) {
    for (let d = 0; d < 30; d++) {
      const date = new Date(); date.setDate(date.getDate() - d * 2); date.setHours(0, 0, 0, 0)
      sessions.push({
        course: course._id, date, markedBy: course.faculty,
        records: students.map((s, i) => ({
          student: s._id,
          status: (d + i) % 9 === 0 ? 'absent' : (d + i) % 14 === 0 ? 'late' : 'present',
        })),
      })
    }
  }
  await Attendance.insertMany(sessions)

  await Exam.create(courses.map((c, i) => {
    const date = new Date(); date.setDate(date.getDate() + 26 + i * 3)
    return { course: c._id, type: 'End Semester', date, startTime: '10:00', endTime: '13:00',
             room: `Exam Hall ${201 + i}`, seats: students.map((s, j) => ({ student: s._id, seat: `A-${j + 1}` })) }
  }))

  await Fee.create(students.map((s) => ({
    student: s._id, semester: 6,
    dueDate: new Date(new Date().getFullYear(), 8, 30),
    breakdown: [
      { head: 'Tuition Fee',     amount: 62000, paid: 62000 },
      { head: 'Hostel & Mess',   amount: 21000, paid: 10000 },
      { head: 'Examination Fee', amount:  4500, paid: 0 },
      { head: 'Library & Lab',   amount:  2500, paid: 0 },
    ],
    payments: [
      { receipt: 'SMIT/2026/004821', amount: 45000, mode: 'Net Banking' },
      { receipt: 'SMIT/2026/005930', amount: 17000, mode: 'UPI' },
      { receipt: 'SMIT/2026/006744', amount: 10000, mode: 'UPI' },
    ],
  })))

  await Notice.create([
    { title: 'End Semester Examination Schedule — Autumn 2026', category: 'Examination', priority: 'high', dept: 'Examination Cell', author: admin._id, audience: ['student', 'faculty'],
      body: 'The end semester examination for all B.Tech programmes commences 12 October 2026. Admit cards will be available from 30 September.' },
    { title: 'Fee Payment Deadline — Semester VI', category: 'Administration', priority: 'high', dept: 'Accounts', author: admin._id, audience: ['student'],
      body: 'The final instalment of Semester VI fees is due on 30 September 2026. A late fee of Rs. 500 per week applies thereafter.' },
    { title: 'TechFest 2026 — Registrations Open', category: 'Events', priority: 'normal', dept: 'Student Affairs', author: admin._id, audience: ['student', 'faculty'],
      body: 'SMIT TechFest 2026 will be held 7-9 November. Registrations are open until 20 October.' },
  ])

  console.log(`Seeded ${students.length} students, ${faculty.length} faculty, ${courses.length} courses, ${sessions.length} attendance sessions.`)
  console.log(`Demo sign-in: ${students[0].reg} / ${DEMO_PASSWORD}`)
  await mongoose.disconnect()
}

seed().catch((e) => { console.error(e); process.exit(1) })
