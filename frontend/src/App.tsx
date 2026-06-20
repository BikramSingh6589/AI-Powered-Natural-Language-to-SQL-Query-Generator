import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { MainLayout } from './components/MainLayout'
import { AuthLayout } from './components/AuthLayout'
import { useAuth } from './context/AuthContext'

// Pages
import { LandingPage } from './pages/LandingPage'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { OTPVerification } from './pages/OTPVerification'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Dashboard } from './pages/Dashboard'
import { CSVUpload } from './pages/CSVUpload'
import { DatabaseConnection } from './pages/DatabaseConnection'
import { QueryGenerator } from './pages/QueryGenerator'
import { Results } from './pages/Results'
import { QueryHistory } from './pages/QueryHistory'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'

// Guard that redirects to /login if not authenticated
function RequireAuth() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected App Pages */}
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<CSVUpload />} />
            <Route path="/connect" element={<DatabaseConnection />} />
            <Route path="/query" element={<QueryGenerator />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<QueryHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
