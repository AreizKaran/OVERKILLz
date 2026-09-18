// Realistic sample data for the SMIT AMS demo.
// Shaped to match the REST payloads in ../../server so swapping to the live
// API is a change of data source, not a change of component code.

export const USERS = [
  { id: 'u1', role: 'student', name: 'Aditya Sharma', email: 'aditya.sharma@smit.smu.edu.in',
    reg: '202100114', program: 'B.Tech Computer Science & Engineering', dept: 'CSE',
    semester: 6, section: 'B', status: 'Active', cgpa: 8.24, attendance: 78,
    phone: '+91 98320 41192', dob: '2003-04-17', blood: 'O+',
    address: 'Hostel Block C, Room 214, SMIT Campus, Majhitar, Sikkim 737136',
    guardian: { name: 'Rakesh Sharma', relation: 'Father', phone: '+91 94341 20887', email: 'rakesh.sharma@gmail.com', occupation: 'Civil Engineer' } },
  { id: 'u2', role: 'faculty', name: 'Dr. Priya Rai', email: 'priya.rai@smit.smu.edu.in',
    empId: 'SMIT-F-0418', dept: 'CSE', designation: 'Associate Professor', cabin: 'AB-II, 304' },
  { id: 'u3', role: 'admin', name: 'Anil Gurung', email: 'anil.gurung@smit.smu.edu.in',
    empId: 'SMIT-A-0032', dept: 'Administration', designation: 'Academic Registrar' },
]

export const COURSES = [
  { id: 'c1', type: 'Theory', code: 'CS1601', name: 'Data Structures & Algorithms', credits: 4, faculty: 'Dr. Priya Rai', facultyId: 'f1', attendance: 82, internal: 27, max: 30, progress: 72, room: 'AB-II 201' },
  { id: 'c2', type: 'Theory', code: 'CS1602', name: 'Computer Networks',            credits: 4, faculty: 'Dr. Tenzing Bhutia', facultyId: 'f2', attendance: 76, internal: 24, max: 30, progress: 65, room: 'AB-II 204' },
  { id: 'c3', type: 'Theory', code: 'CS1603', name: 'Database Management Systems',  credits: 4, faculty: 'Prof. Sujata Chettri', facultyId: 'f3', attendance: 88, internal: 28, max: 30, progress: 80, room: 'AB-I 108' },
  { id: 'c4', type: 'Theory', code: 'CS1604', name: 'Operating Systems',            credits: 3, faculty: 'Dr. Manish Pradhan', facultyId: 'f4', attendance: 79, internal: 25, max: 30, progress: 68, room: 'AB-II 110' },
  { id: 'c5', type: 'Theory', code: 'CS1605', name: 'Software Engineering',         credits: 3, faculty: 'Dr. Priya Rai', facultyId: 'f1', attendance: 91, internal: 26, max: 30, progress: 75, room: 'AB-II 201' },
  { id: 'c6', type: 'Theory', code: 'HS1601', name: 'Engineering Economics',        credits: 2, faculty: 'Prof. Nabin Subba', facultyId: 'f5', attendance: 69, internal: 21, max: 30, progress: 58, room: 'AB-I 002' },
]

export const FACULTY = [
  { id: 'f1', name: 'Dr. Priya Rai',       designation: 'Associate Professor', dept: 'CSE', cabin: 'AB-II, 304', email: 'priya.rai@smit.smu.edu.in',      phone: '+91 98320 11204', subjects: ['Data Structures & Algorithms', 'Software Engineering'], rating: 4.6, experience: '12 years', qualification: 'Ph.D. (IIT Guwahati)' },
  { id: 'f2', name: 'Dr. Tenzing Bhutia',  designation: 'Professor',           dept: 'CSE', cabin: 'AB-II, 310', email: 'tenzing.bhutia@smit.smu.edu.in', phone: '+91 98320 11318', subjects: ['Computer Networks'], rating: 4.4, experience: '18 years', qualification: 'Ph.D. (NIT Silchar)' },
  { id: 'f3', name: 'Prof. Sujata Chettri',designation: 'Assistant Professor', dept: 'CSE', cabin: 'AB-I, 114',  email: 'sujata.chettri@smit.smu.edu.in', phone: '+91 98320 11492', subjects: ['Database Management Systems'], rating: 4.8, experience: '7 years', qualification: 'M.Tech (SMIT)' },
  { id: 'f4', name: 'Dr. Manish Pradhan',  designation: 'Associate Professor', dept: 'CSE', cabin: 'AB-II, 118', email: 'manish.pradhan@smit.smu.edu.in', phone: '+91 98320 11655', subjects: ['Operating Systems'], rating: 4.2, experience: '10 years', qualification: 'Ph.D. (Jadavpur University)' },
  { id: 'f5', name: 'Prof. Nabin Subba',   designation: 'Assistant Professor', dept: 'HSS', cabin: 'AB-I, 006',  email: 'nabin.subba@smit.smu.edu.in',    phone: '+91 98320 11877', subjects: ['Engineering Economics'], rating: 4.0, experience: '5 years', qualification: 'M.A. Economics (NBU)' },
  { id: 'f6', name: 'Dr. Ritu Lepcha',     designation: 'Professor & HOD',     dept: 'ECE', cabin: 'AB-III, 201',email: 'ritu.lepcha@smit.smu.edu.in',    phone: '+91 98320 11901', subjects: ['Digital Signal Processing', 'VLSI Design'], rating: 4.7, experience: '21 years', qualification: 'Ph.D. (IISc Bangalore)' },
]

export const ASSIGNMENTS = [
  { id: 'a1', title: 'AVL Tree Implementation',        course: 'CS1601', courseName: 'Data Structures & Algorithms', faculty: 'Dr. Priya Rai',        due: '2026-09-18', status: 'pending',   grade: null,      max: 20, submitted: 38, total: 62 },
  { id: 'a2', title: 'Subnetting & VLSM Worksheet',    course: 'CS1602', courseName: 'Computer Networks',            faculty: 'Dr. Tenzing Bhutia',   due: '2026-09-16', status: 'pending',   grade: null,      max: 15, submitted: 44, total: 62 },
  { id: 'a3', title: 'Normalisation Case Study',       course: 'CS1603', courseName: 'Database Management Systems',  faculty: 'Prof. Sujata Chettri', due: '2026-09-12', status: 'submitted', grade: null,      max: 20, submitted: 60, total: 62 },
  { id: 'a4', title: 'CPU Scheduling Simulation',      course: 'CS1604', courseName: 'Operating Systems',            faculty: 'Dr. Manish Pradhan',   due: '2026-09-08', status: 'graded',    grade: 17,        max: 20, submitted: 62, total: 62 },
  { id: 'a5', title: 'SRS Document — Team Project',    course: 'CS1605', courseName: 'Software Engineering',         faculty: 'Dr. Priya Rai',        due: '2026-09-05', status: 'graded',    grade: 23,        max: 25, submitted: 61, total: 62 },
  { id: 'a6', title: 'Cost–Benefit Analysis Report',   course: 'HS1601', courseName: 'Engineering Economics',        faculty: 'Prof. Nabin Subba',    due: '2026-09-02', status: 'overdue',   grade: null,      max: 10, submitted: 51, total: 62 },
]

export const EXAMS = [
  { id: 'e1', course: 'CS1602', name: 'Computer Networks',            date: '2026-10-12', time: '10:00 – 13:00', room: 'Exam Hall 204', seat: 'C-18', type: 'End Semester' },
  { id: 'e2', course: 'CS1601', name: 'Data Structures & Algorithms', date: '2026-10-15', time: '10:00 – 13:00', room: 'Exam Hall 201', seat: 'A-42', type: 'End Semester' },
  { id: 'e3', course: 'CS1603', name: 'Database Management Systems',  date: '2026-10-18', time: '14:00 – 17:00', room: 'Exam Hall 108', seat: 'B-07', type: 'End Semester' },
]

export const RESULTS = [
  { code: 'CS1501', name: 'Discrete Mathematics',        internal: 26, external: 58, total: 84, grade: 'A',  credits: 4, sem: 5 },
  { code: 'CS1502', name: 'Design & Analysis of Algo.',  internal: 24, external: 51, total: 75, grade: 'B+', credits: 4, sem: 5 },
  { code: 'CS1503', name: 'Computer Organisation',       internal: 28, external: 61, total: 89, grade: 'A+', credits: 4, sem: 5 },
  { code: 'CS1504', name: 'Object Oriented Programming', internal: 27, external: 55, total: 82, grade: 'A',  credits: 3, sem: 5 },
  { code: 'HS1501', name: 'Technical Communication',     internal: 25, external: 49, total: 74, grade: 'B+', credits: 2, sem: 5 },
]

export const CGPA_TREND = [
  { sem: 'Sem 1', cgpa: 7.42, sgpa: 7.42 }, { sem: 'Sem 2', cgpa: 7.68, sgpa: 7.94 },
  { sem: 'Sem 3', cgpa: 7.91, sgpa: 8.37 }, { sem: 'Sem 4', cgpa: 8.05, sgpa: 8.47 },
  { sem: 'Sem 5', cgpa: 8.24, sgpa: 8.81 },
]

export const ATTENDANCE_MONTHS = [
  { month: 'Apr', pct: 84 }, { month: 'May', pct: 81 }, { month: 'Jun', pct: 74 },
  { month: 'Jul', pct: 79 }, { month: 'Aug', pct: 76 }, { month: 'Sep', pct: 78 },
]

export const TIMETABLE = {
  Mon: [{ t: '09:00', c: 'CS1601', n: 'Data Structures', r: 'AB-II 201' }, { t: '11:00', c: 'CS1603', n: 'DBMS', r: 'AB-I 108' }, { t: '14:00', c: 'CS1605', n: 'Software Engg.', r: 'AB-II 201' }],
  Tue: [{ t: '10:00', c: 'CS1602', n: 'Computer Networks', r: 'AB-II 204' }, { t: '12:00', c: 'CS1604', n: 'Operating Systems', r: 'AB-II 110' }],
  Wed: [{ t: '09:00', c: 'CS1601', n: 'Data Structures (Lab)', r: 'Lab 3' }, { t: '14:00', c: 'HS1601', n: 'Engg. Economics', r: 'AB-I 002' }],
  Thu: [{ t: '10:00', c: 'CS1603', n: 'DBMS (Lab)', r: 'Lab 1' }, { t: '13:00', c: 'CS1602', n: 'Computer Networks', r: 'AB-II 204' }],
  Fri: [{ t: '09:00', c: 'CS1604', n: 'Operating Systems', r: 'AB-II 110' }, { t: '11:00', c: 'CS1605', n: 'Software Engg.', r: 'AB-II 201' }],
  Sat: [],
}

export const NOTICES = [
  { id: 'n1', title: 'End Semester Examination Schedule — Autumn 2026', cat: 'Examination',    dept: 'Examination Cell',   date: '2026-09-12', priority: 'high',   body: 'The end semester examination for all B.Tech programmes commences 12 October 2026. Admit cards will be available on the AMS portal from 30 September. Students with attendance below 75% must obtain condonation approval before 25 September.' },
  { id: 'n2', title: 'Fee Payment Deadline — Semester VI',              cat: 'Administration', dept: 'Accounts',           date: '2026-09-10', priority: 'high',   body: 'The final instalment of Semester VI fees is due on 30 September 2026. A late fee of ₹500 per week applies thereafter. Payment can be completed through the Fees & Payments module.' },
  { id: 'n3', title: 'TechFest 2026 — Registrations Open',              cat: 'Events',         dept: 'Student Affairs',    date: '2026-09-08', priority: 'normal', body: 'SMIT TechFest 2026 will be held 7–9 November. Registrations for hackathon, robotics and paper presentation tracks are open until 20 October.' },
  { id: 'n4', title: 'Revised Academic Calendar — Autumn Semester',     cat: 'Academic',       dept: 'Dean Academics',     date: '2026-09-04', priority: 'normal', body: 'The academic calendar has been revised to accommodate the extended Durga Puja break. Classes resume 14 October. The revised calendar is available under Documents.' },
  { id: 'n5', title: 'Library Renovation — Temporary Relocation',       cat: 'General',        dept: 'Central Library',    date: '2026-08-29', priority: 'low',    body: 'The reading hall on the first floor will remain closed from 1–20 September for renovation. Reference services shift to the ground floor annexe.' },
  { id: 'n6', title: 'Heavy Rainfall Advisory — Campus Movement',       cat: 'Emergency',      dept: 'Campus Security',    date: '2026-08-24', priority: 'high',   body: 'In view of the IMD red alert for East Sikkim, students are advised to avoid non-essential movement outside campus. Hostel wardens will conduct roll call at 20:00.' },
]

export const FEES = {
  total: 90000, paid: 72000, pending: 18000, due: '2026-09-30',
  breakdown: [
    { head: 'Tuition Fee',        amount: 62000, paid: 62000 },
    { head: 'Hostel & Mess',      amount: 21000, paid: 10000 },
    { head: 'Examination Fee',    amount:  4500, paid: 0     },
    { head: 'Library & Lab',      amount:  2500, paid: 0     },
  ],
  history: [
    { id: 'r1', receipt: 'SMIT/2026/004821', date: '2026-07-14', amount: 45000, mode: 'Net Banking', status: 'paid' },
    { id: 'r2', receipt: 'SMIT/2026/005930', date: '2026-08-11', amount: 17000, mode: 'UPI',         status: 'paid' },
    { id: 'r3', receipt: 'SMIT/2026/006744', date: '2026-09-02', amount: 10000, mode: 'UPI',         status: 'paid' },
    { id: 'r4', receipt: '—',                date: '2026-09-30', amount: 18000, mode: '—',           status: 'pending' },
  ],
}

export const NOTIFICATIONS = [
  { id: 'x1', type: 'assignment', title: 'DBMS assignment is due tomorrow',            time: '2 hours ago',  read: false },
  { id: 'x2', type: 'exam',       title: 'New examination schedule published',         time: '1 day ago',    read: false },
  { id: 'x3', type: 'fee',        title: 'Fee payment deadline is approaching',        time: '2 days ago',   read: false },
  { id: 'x4', type: 'attendance', title: 'Attendance in Engg. Economics below 75%',    time: '4 days ago',   read: true  },
  { id: 'x5', type: 'result',     title: 'Semester V results have been published',     time: '1 week ago',   read: true  },
]

// ---- Faculty-side ----
export const FACULTY_CLASSES = [
  { id: 'fc1', course: 'CS1601', name: 'Data Structures & Algorithms', time: '09:00 – 10:00', room: 'AB-II 201', students: 62, marked: true  },
  { id: 'fc2', course: 'CS1605', name: 'Software Engineering',         time: '14:00 – 15:00', room: 'AB-II 201', students: 58, marked: false },
]
const FIRST = ['Aditya','Bhavya','Chirag','Deepika','Eshan','Farhan','Gauri','Hemant','Ishita','Jigme',
  'Karma','Lhamu','Manish','Nima','Ongdi','Pema','Rinzing','Sangay','Tashi','Ugyen','Yangchen','Zomba',
  'Ankit','Bipul','Chandan','Diksha','Ekta','Gopal','Himal','Indra']
const LAST = ['Sharma','Rai','Tamang','Subba','Pradhan','Ali','Chettri','Bhutia','Lepcha','Gurung','Limbu','Thapa']

/** 62 students — the class size the faculty dashboard reports. */
export const ROSTER = Array.from({ length: 62 }, (_, i) => ({
  id: `s${i + 1}`,
  reg: String(202100114 + i * 3),
  name: `${FIRST[i % FIRST.length]} ${LAST[(i * 5) % LAST.length]}`,
  att: Math.max(58, Math.min(97, 62 + ((i * 17) % 36))),
}))

// ---- Admin-side ----
export const ADMIN_KPIS = { students: 4218, faculty: 286, courses: 174, attendance: 81.4, collected: 6.42, pending: 37 }
export const ENROLMENT_TREND = [
  { year: '2021', students: 3480 }, { year: '2022', students: 3712 }, { year: '2023', students: 3905 },
  { year: '2024', students: 4056 }, { year: '2025', students: 4141 }, { year: '2026', students: 4218 },
]
export const DEPT_ATTENDANCE = [
  { dept: 'CSE', pct: 83 }, { dept: 'ECE', pct: 79 }, { dept: 'ME', pct: 76 },
  { dept: 'CE',  pct: 81 }, { dept: 'EE',  pct: 78 }, { dept: 'IT',  pct: 85 },
]
export const FEE_SPLIT = [
  { name: 'Collected', value: 642, fill: '#1F6B4A' },
  { name: 'Pending',   value: 148, fill: '#8A5A12' },
  { name: 'Overdue',   value:  43, fill: '#A3241C' },
]
export const ACTIVITY = [
  { id: 'v1', who: 'Dr. Priya Rai',        what: 'marked attendance for CS1601',          when: '12 min ago',  type: 'attendance' },
  { id: 'v2', who: 'Accounts',             what: 'received ₹18,000 from 202100126',       when: '38 min ago',  type: 'fee' },
  { id: 'v3', who: 'Examination Cell',     what: 'published the end-semester schedule',   when: '2 hours ago', type: 'notice' },
  { id: 'v4', who: 'Prof. Sujata Chettri', what: 'uploaded an assignment for CS1603',     when: '3 hours ago', type: 'assignment' },
  { id: 'v5', who: 'Registrar',            what: 'registered a new student (202100418)',  when: '5 hours ago', type: 'student' },
]

export const FEEDBACK_CRITERIA = [
  { key: 'teaching',     label: 'Teaching quality' },
  { key: 'communication',label: 'Communication' },
  { key: 'knowledge',    label: 'Subject knowledge' },
  { key: 'organisation', label: 'Course organisation' },
]

// ---- Documents ----
export const DOCUMENTS = [
  { id: 'd1', name: 'Semester V Marksheet',      cat: 'Academic',   size: '284 KB', date: '2026-08-18', verified: true,  type: 'pdf' },
  { id: 'd2', name: 'Class XII Marksheet',       cat: 'Admission',  size: '1.2 MB', date: '2021-07-04', verified: true,  type: 'pdf' },
  { id: 'd3', name: 'Class X Marksheet',         cat: 'Admission',  size: '1.1 MB', date: '2021-07-04', verified: true,  type: 'pdf' },
  { id: 'd4', name: 'Admission Letter',          cat: 'Admission',  size: '156 KB', date: '2021-07-22', verified: true,  type: 'pdf' },
  { id: 'd5', name: 'Migration Certificate',     cat: 'Admission',  size: '402 KB', date: '2021-08-02', verified: true,  type: 'pdf' },
  { id: 'd6', name: 'Fee Receipt — Jul 2026',    cat: 'Financial',  size: '88 KB',  date: '2026-07-14', verified: true,  type: 'pdf' },
  { id: 'd7', name: 'Fee Receipt — Aug 2026',    cat: 'Financial',  size: '88 KB',  date: '2026-08-11', verified: true,  type: 'pdf' },
  { id: 'd8', name: 'Hostel Allotment Letter',   cat: 'Hostel',     size: '212 KB', date: '2026-06-30', verified: true,  type: 'pdf' },
  { id: 'd9', name: 'Medical Certificate',       cat: 'Personal',   size: '640 KB', date: '2026-09-02', verified: false, type: 'jpg' },
]

// ---- Departments ----
export const DEPARTMENTS = [
  { id: 'dp1', code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. Tenzing Bhutia', faculty: 48, students: 912, courses: 34, block: 'AB-II', established: 1997 },
  { id: 'dp2', code: 'ECE', name: 'Electronics & Communication',    hod: 'Dr. Ritu Lepcha',    faculty: 41, students: 764, courses: 31, block: 'AB-III', established: 1997 },
  { id: 'dp3', code: 'ME',  name: 'Mechanical Engineering',         hod: 'Dr. Suresh Rai',     faculty: 38, students: 702, courses: 29, block: 'AB-IV', established: 1998 },
  { id: 'dp4', code: 'CE',  name: 'Civil Engineering',              hod: 'Dr. Pema Dorjee',    faculty: 33, students: 648, courses: 27, block: 'AB-IV', established: 2001 },
  { id: 'dp5', code: 'EE',  name: 'Electrical & Electronics',       hod: 'Dr. Anita Sharma',   faculty: 36, students: 671, courses: 28, block: 'AB-III', established: 1999 },
  { id: 'dp6', code: 'IT',  name: 'Information Technology',         hod: 'Dr. Karma Bhutia',   faculty: 29, students: 521, courses: 25, block: 'AB-II', established: 2004 },
  { id: 'dp7', code: 'HSS', name: 'Humanities & Social Sciences',   hod: 'Prof. Nabin Subba',  faculty: 18, students:   0, courses: 12, block: 'AB-I', established: 1997 },
]

// ---- Access control ----
export const PERMISSIONS = [
  { key: 'view_own_record',    label: 'View own academic record',       student: 'full', faculty: 'full', admin: 'full' },
  { key: 'view_any_student',   label: 'View any student record',        student: 'none', faculty: 'own',  admin: 'full' },
  { key: 'mark_attendance',    label: 'Mark attendance',                student: 'none', faculty: 'own',  admin: 'full' },
  { key: 'enter_marks',        label: 'Enter internal marks',           student: 'none', faculty: 'own',  admin: 'full' },
  { key: 'publish_results',    label: 'Publish results',                student: 'none', faculty: 'none', admin: 'full' },
  { key: 'create_assignment',  label: 'Create and grade assignments',   student: 'none', faculty: 'own',  admin: 'full' },
  { key: 'publish_notice',     label: 'Publish notices',                student: 'none', faculty: 'full', admin: 'full' },
  { key: 'submit_feedback',    label: 'Submit faculty feedback',        student: 'full', faculty: 'none', admin: 'none' },
  { key: 'view_feedback',      label: 'View aggregated feedback',       student: 'none', faculty: 'own',  admin: 'full' },
  { key: 'collect_fees',       label: 'Record fee payments',            student: 'own',  faculty: 'none', admin: 'full' },
  { key: 'manage_users',       label: 'Create and deactivate accounts', student: 'none', faculty: 'none', admin: 'full' },
  { key: 'export_reports',     label: 'Export institutional reports',   student: 'none', faculty: 'own',  admin: 'full' },
]

export const AUDIT_LOG = [
  { id: 'al1', actor: 'Anil Gurung',       action: 'published Semester V results',            role: 'admin',   when: '18 Aug 2026, 14:22', severity: 'high' },
  { id: 'al2', actor: 'Dr. Priya Rai',     action: 'graded 24 submissions for CS1601',        role: 'faculty', when: '12 Sep 2026, 11:04', severity: 'normal' },
  { id: 'al3', actor: 'Anil Gurung',       action: 'created account 202100418',               role: 'admin',   when: '11 Sep 2026, 09:47', severity: 'high' },
  { id: 'al4', actor: 'Prof. Sujata Chettri', action: 'marked attendance for CS1603',         role: 'faculty', when: '11 Sep 2026, 09:12', severity: 'normal' },
  { id: 'al5', actor: 'System',            action: 'blocked 6 sign-in attempts from one IP',  role: 'system',  when: '09 Sep 2026, 02:31', severity: 'high' },
  { id: 'al6', actor: 'Anil Gurung',       action: 'revised the academic calendar',           role: 'admin',   when: '04 Sep 2026, 16:08', severity: 'normal' },
]

// Lab courses run alongside the theory papers and are filtered separately (§Course List).
export const LAB_COURSES = [
  { id: 'l1', type: 'Lab', code: 'CS1691', name: 'Data Structures Laboratory',  credits: 2, faculty: 'Dr. Priya Rai',        facultyId: 'f1', attendance: 86, internal: 18, max: 20, progress: 74, room: 'Lab 3' },
  { id: 'l2', type: 'Lab', code: 'CS1692', name: 'Networks Laboratory',         credits: 2, faculty: 'Dr. Tenzing Bhutia',   facultyId: 'f2', attendance: 80, internal: 16, max: 20, progress: 66, room: 'Lab 2' },
  { id: 'l3', type: 'Lab', code: 'CS1693', name: 'DBMS Laboratory',             credits: 2, faculty: 'Prof. Sujata Chettri', facultyId: 'f3', attendance: 92, internal: 19, max: 20, progress: 81, room: 'Lab 1' },
  { id: 'l4', type: 'Lab', code: 'CS1694', name: 'Operating Systems Laboratory',credits: 1, faculty: 'Dr. Manish Pradhan',   facultyId: 'f4', attendance: 77, internal: 15, max: 20, progress: 62, room: 'Lab 4' },
]

/** Per-subject feedback: a student rates each registered subject, not just the teacher. */
export const SUBJECT_FEEDBACK_CRITERIA = [
  { key: 'content',   label: 'Syllabus coverage' },
  { key: 'pace',      label: 'Pace of delivery' },
  { key: 'material',  label: 'Quality of study material' },
  { key: 'relevance', label: 'Practical relevance' },
]

/** Aggregated subject feedback the faculty and admin views read. */
export const SUBJECT_FEEDBACK = [
  { code: 'CS1601', name: 'Data Structures & Algorithms', responses: 58, content: 4.5, pace: 4.1, material: 4.4, relevance: 4.7 },
  { code: 'CS1602', name: 'Computer Networks',            responses: 54, content: 4.2, pace: 3.8, material: 4.0, relevance: 4.3 },
  { code: 'CS1603', name: 'Database Management Systems',  responses: 60, content: 4.7, pace: 4.5, material: 4.6, relevance: 4.8 },
  { code: 'CS1604', name: 'Operating Systems',            responses: 51, content: 4.0, pace: 3.6, material: 3.9, relevance: 4.1 },
  { code: 'CS1605', name: 'Software Engineering',         responses: 49, content: 4.4, pace: 4.2, material: 4.3, relevance: 4.6 },
  { code: 'HS1601', name: 'Engineering Economics',        responses: 44, content: 3.8, pace: 3.9, material: 3.7, relevance: 3.5 },
]

/** Cohort totals shown above the roster (§Total students count). */
export const COHORT = { total: 62, present: 54, departments: 1, sections: 2, semester: 'VI' }
