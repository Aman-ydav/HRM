import React, { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, LogOut, Home, Clock, Gift, BarChart3, MessageSquare, Zap, Users, Settings } from 'lucide-react'
import { Button } from '../components/ui'

function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'
  const isHR = user?.role === 'hr_manager'

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', show: true },
    { icon: Clock, label: 'Attendance', path: '/attendance', show: true },
    { icon: Gift, label: 'Rewards', path: '/rewards', show: true },
    { icon: BarChart3, label: 'Performance', path: '/performance', show: true },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback', show: true },
    { icon: Zap, label: 'AI Insights', path: '/ai-insights', show: true },
    { icon: Users, label: 'Employees', path: '/admin/employees', show: isAdmin },
    { icon: Gift, label: 'Manage Rewards', path: '/admin/rewards', show: isAdmin || isHR },
    { icon: BarChart3, label: 'Admin Dashboard', path: '/admin/dashboard', show: isAdmin },
  ]

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <aside className={`fixed md:relative w-64 bg-gray-900 border-r border-gray-800 z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-orange-500">HRM</h1>
          <p className="text-xs text-gray-400 mt-1">Employee Reward System</p>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-500 font-bold">{user?.firstName?.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-white text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-2">
          {menuItems
            .filter(item => item.show)
            .map(({ icon: Icon, label, path }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <Icon size={18} />
                <span className="text-sm">{label}</span>
              </Link>
            ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{new Date().toLocaleDateString()}</span>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
