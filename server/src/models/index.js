import mongoose from 'mongoose'

const { Schema, model } = mongoose

/* ------------------------------------------------------------------ User */
const userSchema = new Schema({
  role:      { type: String, enum: ['student', 'faculty', 'admin'], required: true, index: true },
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, select: false, minlength: 8 },
  // Students carry a registration number; staff carry an employee ID.
  reg:       { type: String, unique: true, sparse: true, index: true },
  empId:     { type: String, unique: true, sparse: true, index: true },
  dept:      { type: String, index: true },
  programme: String,
  semester:  { type: Number, min: 1, max: 8 },
  section:   String,
  designation: String,
  cabin:     String,
  phone:     String,
  dob:       Date,
  address:   String,
  guardian:  { name: String, relation: String, phone: String, email: String, occupation: String },
  status:    { type: String, enum: ['Active', 'Suspended', 'Graduated'], default: 'Active' },
  lastLoginAt: Date,
}, { timestamps: true })

/* ---------------------------------------------------------------- Course */
const courseSchema = new Schema({
  code:    { type: String, required: true, unique: true, uppercase: true, trim: true },
  name:    { type: String, required: true, trim: true },
  credits: { type: Number, required: true, min: 1, max: 6 },
  dept:    { type: String, required: true, index: true },
  semester:{ type: Number, required: true, min: 1, max: 8 },
  faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  students:[{ type: Schema.Types.ObjectId, ref: 'User' }],
  room:    String,
}, { timestamps: true })

/* ------------------------------------------------------------ Attendance */
const attendanceSchema = new Schema({
  course:  { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  date:    { type: Date, required: true },
  markedBy:{ type: Schema.Types.ObjectId, ref: 'User', required: true },
  records: [{
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status:  { type: String, enum: ['present', 'absent', 'late'], required: true },
  }],
}, { timestamps: true })
// One attendance document per course per day.
attendanceSchema.index({ course: 1, date: 1 }, { unique: true })

/* ------------------------------------------------------------ Assignment */
const assignmentSchema = new Schema({
  title:   { type: String, required: true, trim: true },
  course:  { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  brief:   String,
  due:     { type: Date, required: true },
  maxMarks:{ type: Number, required: true, min: 1 },
  attachments: [{ filename: String, path: String, size: Number }],
  submissions: [{
    student:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    file:     { filename: String, path: String, size: Number },
    remarks:  String,
    at:       { type: Date, default: Date.now },
    late:     { type: Boolean, default: false },
    grade:    { type: Number, min: 0 },
    feedback: String,
  }],
}, { timestamps: true })

/* ------------------------------------------------------------------ Exam */
const examSchema = new Schema({
  course:   { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  type:     { type: String, enum: ['Internal', 'Mid Semester', 'End Semester'], required: true },
  date:     { type: Date, required: true },
  startTime:String,
  endTime:  String,
  room:     String,
  seats:    [{ student: { type: Schema.Types.ObjectId, ref: 'User' }, seat: String }],
}, { timestamps: true })

/* ---------------------------------------------------------------- Result */
const resultSchema = new Schema({
  student:  { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course:   { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: Number, required: true },
  internal: { type: Number, min: 0, max: 40, default: 0 },
  external: { type: Number, min: 0, max: 60, default: 0 },
  grade:    { type: String, enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'] },
  credits:  Number,
  published:{ type: Boolean, default: false },
}, { timestamps: true })
resultSchema.index({ student: 1, course: 1 }, { unique: true })
resultSchema.virtual('total').get(function () { return this.internal + this.external })

/* ---------------------------------------------------------------- Notice */
const noticeSchema = new Schema({
  title:    { type: String, required: true, trim: true },
  body:     { type: String, required: true },
  category: { type: String, enum: ['Academic', 'Examination', 'Administration', 'Events', 'Emergency', 'General'], required: true, index: true },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  dept:     String,
  author:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  audience: [{ type: String, enum: ['student', 'faculty', 'admin'] }],
}, { timestamps: true })

/* ------------------------------------------------------------------- Fee */
const feeSchema = new Schema({
  student:  { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  semester: { type: Number, required: true },
  breakdown:[{ head: String, amount: Number, paid: { type: Number, default: 0 } }],
  dueDate:  Date,
  payments: [{
    receipt: { type: String, required: true },
    amount:  { type: Number, required: true },
    mode:    { type: String, enum: ['UPI', 'Net Banking', 'Card', 'Challan'] },
    at:      { type: Date, default: Date.now },
  }],
}, { timestamps: true })
feeSchema.virtual('total').get(function () { return this.breakdown.reduce((s, b) => s + b.amount, 0) })
feeSchema.virtual('paid').get(function () { return this.payments.reduce((s, p) => s + p.amount, 0) })

/* -------------------------------------------------------------- Feedback */
// Deliberately carries no reference to the student who submitted it, so
// aggregate queries cannot be de-anonymised even with database access.
const feedbackSchema = new Schema({
  faculty:  { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course:   { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: Number, required: true },
  scores:   {
    teaching:      { type: Number, min: 1, max: 5, required: true },
    communication: { type: Number, min: 1, max: 5, required: true },
    knowledge:     { type: Number, min: 1, max: 5, required: true },
    organisation:  { type: Number, min: 1, max: 5, required: true },
  },
  comments: String,
}, { timestamps: true })

// Separate ledger records only THAT a student submitted, never what they said.
const feedbackReceiptSchema = new Schema({
  student:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  faculty:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: Number, required: true },
}, { timestamps: true })
feedbackReceiptSchema.index({ student: 1, faculty: 1, semester: 1 }, { unique: true })

export const User       = model('User', userSchema)
export const Course     = model('Course', courseSchema)
export const Attendance = model('Attendance', attendanceSchema)
export const Assignment = model('Assignment', assignmentSchema)
export const Exam       = model('Exam', examSchema)
export const Result     = model('Result', resultSchema)
export const Notice     = model('Notice', noticeSchema)
export const Fee        = model('Fee', feeSchema)
export const Feedback   = model('Feedback', feedbackSchema)
export const FeedbackReceipt = model('FeedbackReceipt', feedbackReceiptSchema)
