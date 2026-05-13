import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'
import AuthLayout from './layouts/AuthLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import LandingPage from './pages/LandingPage'

// Dashboard Pages
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard'
import AttendancePage from './pages/attendance/AttendancePage'
import RewardsPage from './pages/rewards/RewardsPage'
import PerformancePage from './pages/performance/PerformancePage'
import ReportPage from './pages/reports/ReportPage'
import FeedbackPage from './pages/feedback/FeedbackPage'
import AIRecommendationsPage from './pages/ai/AIRecommendationsPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import EmployeesManagement from './pages/admin/EmployeesManagement'
import RewardManagement from './pages/admin/RewardManagement'
import DepartmentRewardsPage from './pages/admin/DepartmentRewardsPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Route>

          {/* Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/ai-insights" element={<AIRecommendationsPage />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/employees" element={<ProtectedRoute requiredRole="admin"><EmployeesManagement /></ProtectedRoute>} />
            <Route path="/admin/rewards" element={<ProtectedRoute requiredRole={['admin', 'hr_manager']}><RewardManagement /></ProtectedRoute>} />
                      <Route path="/admin/department-rewards" element={<ProtectedRoute requiredRole="admin"><DepartmentRewardsPage /></ProtectedRoute>} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
