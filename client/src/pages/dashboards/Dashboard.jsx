import { useAuth } from '../../lib/auth'
import StudentDashboard from './StudentDashboard'
import FacultyDashboard from './FacultyDashboard'
import AdminDashboard from './AdminDashboard'

export default function Dashboard() {
  const { user } = useAuth()
  if (user.role === 'faculty') return <FacultyDashboard />
  if (user.role === 'admin')   return <AdminDashboard />
  return <StudentDashboard />
}
