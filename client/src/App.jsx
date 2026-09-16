import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { ToastProvider } from './components/ui/Toast'
import AppShell from './components/layout/AppShell'
import Login from './pages/Login'
import RouteFallback from './components/ui/RouteFallback'

// Each module is its own chunk — recharts only downloads on a route that charts (bundle-splitting).
const Dashboard = lazy(() => import('./pages/dashboards/Dashboard'))
const Academics = lazy(() => import('./pages/modules/Academics'))
const Attendance = lazy(() => import('./pages/modules/Attendance'))
const Assignments = lazy(() => import('./pages/modules/Assignments'))
const Examinations = lazy(() => import('./pages/modules/Examinations'))
const Results = lazy(() => import('./pages/modules/Results'))
const Timetable = lazy(() => import('./pages/modules/Timetable'))
const Faculty = lazy(() => import('./pages/modules/Faculty'))
const Notices = lazy(() => import('./pages/modules/Notices'))
const Fees = lazy(() => import('./pages/modules/Fees'))
const Feedback = lazy(() => import('./pages/modules/Feedback'))
const Profile = lazy(() => import('./pages/modules/Profile'))
const Settings = lazy(() => import('./pages/modules/Settings'))
const Students = lazy(() => import('./pages/modules/Students'))
const Reports = lazy(() => import('./pages/modules/Reports'))
const Documents = lazy(() => import('./pages/modules/Documents'))
const Departments = lazy(() => import('./pages/modules/Departments'))
const AccessControl = lazy(() => import('./pages/modules/AccessControl'))


/** Route guard — an unauthenticated session can never reach /app. */
function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/" replace />
}

function Shell() {
  const { user } = useAuth()
  return user ? <Navigate to="/app" replace /> : <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-3 focus:left-3
                                     focus:bg-surface focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lift">
            Skip to main content
          </a>
          <Routes>
            <Route path="/" element={<Shell />} />
            <Route path="/app" element={<Protected><AppShell /></Protected>}>
              <Route index element={<Dashboard />} />
              <Route path="academics"   element={<Academics />} />
              <Route path="attendance"  element={<Attendance />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="exams"       element={<Examinations />} />
              <Route path="results"     element={<Results />} />
              <Route path="marks"       element={<Results />} />
              <Route path="timetable"   element={<Timetable />} />
              <Route path="faculty"     element={<Faculty />} />
              <Route path="notices"     element={<Notices />} />
              <Route path="fees"        element={<Fees />} />
              <Route path="feedback"    element={<Feedback />} />
              <Route path="profile"     element={<Profile />} />
              <Route path="settings"    element={<Settings />} />
              <Route path="students"    element={<Students />} />
              <Route path="courses"     element={<Academics />} />
              <Route path="reports"     element={<Reports />} />
              <Route path="documents"   element={<Documents />} />
              <Route path="departments" element={<Departments />} />
              <Route path="access"      element={<AccessControl />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
