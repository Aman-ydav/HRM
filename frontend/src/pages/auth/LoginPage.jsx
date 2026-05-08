import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input, LoadingSpinner } from '../../components/ui'
import { getDefaultRouteForRole } from '../../lib/auth'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      navigate(getDefaultRouteForRole(result.user?.role))
    } else {
      setError(result.error || 'Login failed')
    }
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-400">Sign in to your account</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4 rounded accent-orange-500" />
          {/* <span className="text-gray-400">Remember me</span> */}
        </label>
        <Link to="/forgot-password" className="text-orange-500 hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={loading}
      >
        {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 py-5 bg-gray-900 text-gray-400">Don't have an account?</span>
        </div>
      </div>

      <Link to="/register">
        <Button type="button" variant="secondary" className="w-full">
          Create Account
        </Button>
      </Link>

      {/* Demo credentials */}
      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-gray-400">
        <p className="font-medium text-white mb-2">Credentials:</p>
        <p>HR Admin: admin@hrm.com / admin123</p>
        {/* <p>HR Manager: hr@hrm.com / hr12345</p> */}
        <p>Employee: create your account plz</p>
      </div>
    </form>
  )
}

export default LoginPage
