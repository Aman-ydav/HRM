import React from 'react'
import { Outlet, Link } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">HRM</h1>
          <p className="text-gray-400">Employee Reward System</p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <Outlet />
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>
            Need help? <Link to="/forgot-password" className="text-orange-500 hover:underline">Reset password</Link>
          </p>
        </div>
      </div>

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 opacity-5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}

export default AuthLayout
