import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Clock, Gift, TrendingUp, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, Button, Badge, LoadingSpinner } from '../../components/ui'
import { employeeService, attendanceService } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { normalizeRole, getDefaultRouteForRole } from '../../lib/auth'

function EmployeeDashboard() {
  const { user, employee } = useAuth()
  const role = normalizeRole(user?.role)
  const isEmployee = role === 'employee'
  const fallbackRoute = getDefaultRouteForRole(user?.role)

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkInStatus, setCheckInStatus] = useState(null)

  useEffect(() => {
    if (!isEmployee) {
      return
    }

    const fetchDashboard = async () => {
      try {
        const data = await employeeService.getDashboard()
        const payload = data?.data || data || {}
        setDashboard(payload)

        // Check today's attendance status
        if (employee?._id) {
          const historyResponse = await attendanceService.getHistory(employee._id, 1, 31)
          const history = historyResponse?.data || []
          const today = new Date().toISOString().split('T')[0]
          const todayAttendance = history.find(
            (record) => new Date(record.date).toISOString().split('T')[0] === today
          )
          setCheckInStatus({
            checkedIn: !!todayAttendance?.checkInTime,
            checkedOut: !!todayAttendance?.checkOutTime,
            status: todayAttendance?.status || 'present',
          })
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [employee?._id, isEmployee])

  if (!isEmployee) {
    return <Navigate to={fallbackRoute} replace />
  }

  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn()
      setCheckInStatus(prev => ({ ...prev, checkedIn: true }))
    } catch (err) {
      setError(err.message || 'Check-in failed')
    }
  }

  const handleCheckOut = async () => {
    try {
      await attendanceService.checkOut()
      setCheckInStatus(prev => ({ ...prev, checkedOut: true }))
    } catch (err) {
      setError(err.message || 'Check-out failed')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome, {user?.firstName}!</h1>
        <p className="text-slate-600">Here's your performance overview</p>
      </div>

      {/* Quick Actions - Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Today's Attendance</h3>
            <Clock className="text-orange-500" size={24} />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {checkInStatus?.checkedIn ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded">
                <CheckCircle size={18} className="text-emerald-600" />
                <div>
                  <p className="text-emerald-700 font-medium text-sm">Checked In</p>
                  <p className="text-slate-600 text-xs">Status: {checkInStatus.status}</p>
                </div>
              </div>
            ) : (
              <Button variant="primary" onClick={handleCheckIn} className="w-full">
                Check In
              </Button>
            )}

            {checkInStatus?.checkedOut ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded">
                <CheckCircle size={18} className="text-emerald-600" />
                <p className="text-emerald-700 font-medium text-sm">Checked Out</p>
              </div>
            ) : (
              checkInStatus?.checkedIn && (
                <Button variant="secondary" onClick={handleCheckOut} className="w-full">
                  Check Out
                </Button>
              )
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            {dashboard?.attendance && (
              <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                <span className="text-slate-600">Attendance This Month</span>
                <Badge variant="orange">{dashboard.attendance.percentage || 0}%</Badge>
              </div>
            )}
            {dashboard?.employee && (
              <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                <span className="text-slate-600">Reward Points</span>
                <Badge variant="orange">{dashboard.employee.rewardPoints || 0}</Badge>
              </div>
            )}
            {dashboard?.employee && (
              <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                <span className="text-slate-600">Total Bonus</span>
                <Badge variant="green">${dashboard.employee.totalBonus || 0}</Badge>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Rewards */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Rewards</h3>
            <Gift className="text-orange-500" size={20} />
          </div>
          <div className="space-y-2">
            {dashboard?.recentRewards?.length ? (
              dashboard.recentRewards.slice(0, 3).map((reward, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded flex justify-between">
                  <span className="text-sm text-slate-700">{reward.rewardType}</span>
                  <Badge variant="orange">{reward.points || reward.bonus}</Badge>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No rewards yet</p>
            )}
          </div>
        </Card>

        {/* Performance Score */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Performance</h3>
            <TrendingUp className="text-orange-500" size={20} />
          </div>
          {dashboard?.performance ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Score</span>
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-600">
                    {dashboard.performance.overallPerformance?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                <p>Rating: {dashboard.performance.monthlyRating}/5</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No performance data</p>
          )}
        </Card>

        {/* Feedback */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Feedback</h3>
            <MessageSquare className="text-orange-500" size={20} />
          </div>
          {dashboard?.recentFeedback?.length ? (
            <div className="space-y-2">
              {dashboard.recentFeedback.slice(0, 3).map((fb, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <p className="text-xs text-slate-700 truncate">{fb.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No feedback yet</p>
          )}
        </Card>
      </div>

      {/* Badges Section */}
      {dashboard?.badges?.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {dashboard.badges.map((badge, idx) => (
              <Badge key={idx} variant="orange">{badge}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Alerts */}
      {dashboard?.alerts?.length > 0 && (
        <Card className="border border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={18} />
            <div>
              <h3 className="font-bold text-yellow-700 mb-2">Alerts</h3>
              {dashboard.alerts.map((alert, idx) => (
                <p key={idx} className="text-sm text-yellow-700 mb-1">{alert}</p>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default EmployeeDashboard
