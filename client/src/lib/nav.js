import {
  LayoutDashboard, User, GraduationCap, CalendarCheck, BookOpen, FileText, ClipboardList,
  Award, CalendarDays, Users, Megaphone, MessageSquare, Wallet, FolderOpen, Star,
  BarChart3, Settings, Building2, ShieldCheck,
} from 'lucide-react'

/** Role decides the menu. Primary (mobile bottom nav) is capped at 5 (bottom-nav-limit). */
export const NAV = {
  student: [
    { to: '/app',             label: 'Dashboard',   icon: LayoutDashboard, primary: true },
    { to: '/app/academics',   label: 'Academics',   icon: GraduationCap,   primary: true },
    { to: '/app/attendance',  label: 'Attendance',  icon: CalendarCheck },
    { to: '/app/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/app/exams',       label: 'Examinations',icon: FileText },
    { to: '/app/results',     label: 'Results',     icon: Award },
    { to: '/app/timetable',   label: 'Timetable',   icon: CalendarDays,    primary: true },
    { to: '/app/faculty',     label: 'Faculty',     icon: Users },
    { to: '/app/notices',     label: 'Notices',     icon: Megaphone,       primary: true },
    { to: '/app/fees',        label: 'Fees & Payments', icon: Wallet },
    { to: '/app/documents',   label: 'Documents',   icon: FolderOpen },
    { to: '/app/feedback',    label: 'Feedback',    icon: Star },
    { to: '/app/profile',     label: 'Profile',     icon: User,            primary: true },
    { to: '/app/settings',    label: 'Settings',    icon: Settings },
  ],
  faculty: [
    { to: '/app',             label: 'Dashboard',   icon: LayoutDashboard, primary: true },
    { to: '/app/courses',     label: 'My Courses',  icon: BookOpen,        primary: true },
    { to: '/app/attendance',  label: 'Attendance',  icon: CalendarCheck,   primary: true },
    { to: '/app/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/app/students',    label: 'Students',    icon: Users },
    { to: '/app/marks',       label: 'Marks Entry', icon: Award },
    { to: '/app/timetable',   label: 'Timetable',   icon: CalendarDays },
    { to: '/app/notices',     label: 'Notices',     icon: Megaphone,       primary: true },
    { to: '/app/feedback',    label: 'My Feedback', icon: Star },
    { to: '/app/reports',     label: 'Reports',     icon: BarChart3 },
    { to: '/app/profile',     label: 'Profile',     icon: User,            primary: true },
    { to: '/app/settings',    label: 'Settings',    icon: Settings },
  ],
  admin: [
    { to: '/app',             label: 'Dashboard',   icon: LayoutDashboard, primary: true },
    { to: '/app/students',    label: 'Students',    icon: Users,           primary: true },
    { to: '/app/faculty',     label: 'Faculty',     icon: GraduationCap,   primary: true },
    { to: '/app/departments', label: 'Departments', icon: Building2 },
    { to: '/app/courses',     label: 'Courses',     icon: BookOpen },
    { to: '/app/attendance',  label: 'Attendance',  icon: CalendarCheck },
    { to: '/app/fees',        label: 'Fees & Finance', icon: Wallet,       primary: true },
    { to: '/app/notices',     label: 'Notices',     icon: Megaphone },
    { to: '/app/feedback',    label: 'Feedback Analytics', icon: Star },
    { to: '/app/reports',     label: 'Reports',     icon: BarChart3 },
    { to: '/app/access',      label: 'Access Control', icon: ShieldCheck },
    { to: '/app/profile',     label: 'Profile',     icon: User,            primary: true },
    { to: '/app/settings',    label: 'Settings',    icon: Settings },
  ],
}

export const primaryNav = (role) => NAV[role].filter((i) => i.primary).slice(0, 5)
