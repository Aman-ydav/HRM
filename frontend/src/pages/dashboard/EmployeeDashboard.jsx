import React, { useState, useEffect } from 'react'
import { Clock, Gift, TrendingUp, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, Button, Badge, LoadingSpinner } from '../../components/ui'
import { employeeService, attendanceService, rewardService } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

function EmployeeDashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkInStatus, setCheckInStatus] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await employeeService.getDashboard()
        setDashboard(data)

        // Check today's attendance status
        if (data.attendance) {
          const today = new Date().toISOString().split('T')[0]
          const todayAttendance = data.attendance.find(a => 
            new Date(a.date).toISOString().split('T')[0] === today
          )
          if (todayAttendance) {
            setCheckInStatus({
              checkedIn: !!todayAttendance.checkInTime,
              checkedOut: !!todayAttendance.checkOutTime,
              status: todayAttendance.status,
            })
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

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
        <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-400">Here's your performance overview</p>
      </div>

      {/* Quick Actions - Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Today's Attendance</h3>
            <Clock className="text-orange-500" size={24} />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {checkInStatus?.checkedIn ? (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded">
                <CheckCircle size={18} className="text-green-400" />
                <div>
                  <p className="text-green-400 font-medium text-sm">Checked In</p>
                  <p className="text-gray-400 text-xs">Status: {checkInStatus.status}</p>
                </div>
              </div>
            ) : (
              <Button variant="primary" onClick={handleCheckIn} className="w-full">
                Check In
              </Button>
            )}

            {checkInStatus?.checkedOut ? (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded">
                <CheckCircle size={18} className="text-green-400" />
                <p className="text-green-400 font-medium text-sm">Checked Out</p>
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
          <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
          <div className="space-y-3">
            {dashboard?.attendance && (
              <div className="flex justify-between items-center p-2 hover:bg-gray-800 rounded">
                <span className="text-gray-400">Attendance This Month</span>
                <Badge variant="orange">{dashboard.attendance.currentMonth}%</Badge>
              </div>
            )}
            {dashboard?.rewards && (
              <div className="flex justify-between items-center p-2 hover:bg-gray-800 rounded">
                <span className="text-gray-400">Reward Points</span>
                <Badge variant="orange">{dashboard.rewards.totalPoints}</Badge>
              </div>
            )}
            {dashboard?.totalBonus && (
              <div className="flex justify-between items-center p-2 hover:bg-gray-800 rounded">
                <span className="text-gray-400">Total Bonus</span>
                <Badge variant="green">${dashboard.totalBonus}</Badge>
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
            <h3 className="text-lg font-bold text-white">Recent Rewards</h3>
            <Gift className="text-orange-500" size={20} />
          </div>
          <div className="space-y-2">
            {dashboard?.recentRewards?.length ? (
              dashboard.recentRewards.slice(0, 3).map((reward, idx) => (
                <div key={idx} className="p-2 bg-gray-800 rounded flex justify-between">
                  <span className="text-sm text-gray-300">{reward.rewardType}</span>
                  <Badge variant="orange">{reward.points || reward.bonus}</Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No rewards yet</p>
            )}
          </div>
        </Card>

        {/* Performance Score */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Performance</h3>
            <TrendingUp className="text-orange-500" size={20} />
          </div>
          {dashboard?.performance ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Score</span>
                <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-400">
                    {dashboard.performance.overallPerformance?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                <p>Rating: {dashboard.performance.monthlyRating}/5</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No performance data</p>
          )}
        </Card>

        {/* Feedback */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Feedback</h3>
            <MessageSquare className="text-orange-500" size={20} />
          </div>
          {dashboard?.recentFeedback?.length ? (
            <div className="space-y-2">
              {dashboard.recentFeedback.slice(0, 3).map((fb, idx) => (
                <div key={idx} className="p-2 bg-gray-800 rounded flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <p className="text-xs text-gray-300 truncate">{fb.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No feedback yet</p>
          )}
        </Card>
      </div>

      {/* Badges Section */}
      {dashboard?.badges?.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {dashboard.badges.map((badge, idx) => (
              <Badge key={idx} variant="orange">{badge}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Alerts */}
      {dashboard?.alerts?.length > 0 && (
        <Card className="border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-500 flex-shrink-0 mt-1" size={18} />
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Alerts</h3>
              {dashboard.alerts.map((alert, idx) => (
                <p key={idx} className="text-sm text-yellow-300 mb-1">{alert}</p>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default EmployeeDashboard
