import React, { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, LogOut, Home, Clock, Gift, BarChart3, MessageSquare, Zap, Users, PieChart } from 'lucide-react'
import { Button } from '../components/ui'
import { normalizeRole } from '../lib/auth'

function DashboardLayout() {
  const { user, employee, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const role = normalizeRole(user?.role)
  const menuByRole = {
    employee: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Clock, label: 'Attendance', path: '/attendance' },
      { icon: Gift, label: 'Rewards', path: '/rewards' },
      { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
      { icon: Zap, label: 'AI Insights', path: '/ai-insights' },
    ],
    admin: [
      { icon: Home, label: 'Admin Dashboard', path: '/admin/dashboard' },
      { icon: Users, label: 'Employees', path: '/admin/employees' },
      { icon: Gift, label: 'Manage Rewards', path: '/admin/rewards' },
        { icon: PieChart, label: 'Department Rewards', path: '/admin/department-rewards' },
      { icon: Zap, label: 'AI Insights', path: '/ai-insights' },
    ],
    hr_manager: [
      { icon: Gift, label: 'Manage Rewards', path: '/admin/rewards' },
      { icon: Zap, label: 'AI Insights', path: '/ai-insights' },
    ],
  }
  const menuItems = menuByRole[role] || menuByRole.employee

  return (
    <div className="relative flex min-h-screen bg-white text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-80 max-w-[88vw] flex-col border-r border-slate-200 bg-white shadow-lg transform transition-transform duration-300 md:translate-x-0 md:w-80 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold tracking-tight text-orange-600">HRM</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-600">Employee Reward System</p>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 ring-1 ring-orange-200">
              <span className="text-sm font-bold text-orange-600">{user?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {employee?.firstName || user?.email?.split('@')[0] || 'User'} {employee?.lastName || ''}
              </p>
              <p className="truncate text-xs text-slate-600">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(({ icon: Icon, label, path }) => {
            const isActive =
              location.pathname === path ||
              (path !== '/dashboard' && location.pathname.startsWith(`${path}/`))

            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-200 p-4">
          <Button variant="ghost" className="w-full justify-start rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-w-0 flex-1 flex flex-col overflow-hidden md:pl-80">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200 bg-white px-4 backdrop-blur-xl sm:px-6 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <button
              onClick={handleLogout}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
