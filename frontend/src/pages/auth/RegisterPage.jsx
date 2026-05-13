import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input, LoadingSpinner } from '../../components/ui'
import { getDefaultRouteForRole } from '../../lib/auth'

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    department: '',
    position: '',
    role: 'employee',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // Remove admin role selection from frontend
    if (formData.role === 'admin') {
      setError('Admin accounts must be created by system administrator')
      return
    }

    setLoading(true)

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      employeeId: formData.employeeId,
      department: formData.department,
      position: formData.position,
      role: 'employee', // Force employee role
    })

    if (result.success) {
      navigate(getDefaultRouteForRole(result.user?.role))
    } else {
      setError(result.error || 'Registration failed')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
        <p className="text-slate-600">Join our reward system</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <Input
        label="Employee ID"
        placeholder="EMP001"
        name="employeeId"
        value={formData.employeeId}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Department"
          placeholder="Engineering"
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <Input
          label="Position"
          placeholder="Developer"
          name="position"
          value={formData.position}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <Input
        label="Password"
        type="password"
        placeholder="Min 6 characters"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <div className="flex items-center gap-2">
        <input type="checkbox" className="w-4 h-4 rounded accent-orange-600" required />
        <span className="text-sm text-slate-600">
          I agree to the <Link to="#" className="text-orange-600 hover:underline">Terms of Service</Link>
        </span>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={loading}
      >
        {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
      </Button>

      <div className="text-center text-sm">
        <span className="text-slate-600">Already have an account? </span>
        <Link to="/login" className="text-orange-600 hover:underline">Sign in</Link>
      </div>
    </form>
  )
}

export default RegisterPage
