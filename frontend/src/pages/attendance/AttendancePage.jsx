import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, LoadingSpinner, Badge } from '../../components/ui'
import { attendanceService } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Calendar, TrendingUp } from 'lucide-react'

function AttendancePage() {
  const { user, employee } = useAuth()
  const navigate = useNavigate()

  // Redirect admin users - they don't have personal attendance
  if (user?.role === 'admin') {
    navigate('/admin/dashboard', { replace: true })
    return null
  }

  const employeeId = employee?._id
  const [activeTab, setActiveTab] = useState('history') // history, monthly, analytics
  const [history, setHistory] = useState([])
  const [monthlyReport, setMonthlyReport] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        if (!employeeId) {
          setError('Employee profile is not available for this account')
          return
        }

        if (activeTab === 'history') {
          const data = await attendanceService.getHistory(employeeId, 1, 50)
          setHistory(data.data || [])
        } else if (activeTab === 'monthly') {
          const [year, month] = selectedMonth.split('-')
          const data = await attendanceService.getMonthlyReport(employeeId, parseInt(month), parseInt(year))
          setMonthlyReport(data)
        } else if (activeTab === 'analytics') {
          const data = await attendanceService.getAnalytics(employeeId, 12)
          setAnalytics(data)
        }
      } catch (err) {
        setError(err.message || 'Failed to load attendance data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, selectedMonth, employeeId])

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'green'
      case 'absent': return 'red'
      case 'late': return 'yellow'
      case 'on_leave': return 'blue'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Attendance</h1>
        <p className="text-gray-400">Track your attendance and working hours</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {['history', 'monthly', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* History View */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {history.length ? (
                history.map((record, idx) => (
                  <Card key={idx}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Calendar className="text-orange-500" size={20} />
                        <div>
                          <p className="font-medium text-white">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-400">
                            {record.checkInTime && `Check-in: ${new Date(record.checkInTime).toLocaleTimeString()}`}
                            {record.checkOutTime && ` | Check-out: ${new Date(record.checkOutTime).toLocaleTimeString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(record.status)}>
                          {record.status.toUpperCase()}
                        </Badge>
                        {record.totalHours && (
                          <p className="text-xs text-gray-400 mt-2">{record.totalHours.toFixed(1)}h</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-gray-400 text-center py-8">No attendance records found</p>
                </Card>
              )}
            </div>
          )}

          {/* Monthly Report View */}
          {activeTab === 'monthly' && monthlyReport && (
            <div className="space-y-4">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Monthly Report</h3>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-800 rounded">
                    <p className="text-gray-400 text-sm">Total Days</p>
                    <p className="text-2xl font-bold text-orange-500">{monthlyReport.totalDays || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded">
                    <p className="text-gray-400 text-sm">Present</p>
                    <p className="text-2xl font-bold text-green-400">{monthlyReport.presentDays || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded">
                    <p className="text-gray-400 text-sm">Absent</p>
                    <p className="text-2xl font-bold text-red-400">{monthlyReport.absentDays || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded">
                    <p className="text-gray-400 text-sm">Late</p>
                    <p className="text-2xl font-bold text-yellow-400">{monthlyReport.lateDays || 0}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-800 rounded">
                  <p className="text-gray-400 text-sm mb-2">Attendance Percentage</p>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-orange-500 h-3 rounded-full transition-all"
                      style={{ width: `${monthlyReport.attendancePercentage || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-orange-400 font-bold mt-2">{monthlyReport.attendancePercentage?.toFixed(1) || 0}%</p>
                </div>
              </Card>
            </div>
          )}

          {/* Analytics View */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="text-orange-500" />
                  <h3 className="text-lg font-bold text-white">12-Month Analytics</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800 rounded">
                    <p className="text-gray-400 text-sm">Avg Daily Hours</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {analytics.averageDailyHours?.toFixed(1) || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded">
                    <p className="text-gray-400 text-sm">Avg Attendance</p>
                    <p className="text-2xl font-bold text-green-500">
                      {analytics.averageAttendance?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded">
                    <p className="text-gray-400 text-sm">Late Arrivals</p>
                    <p className="text-2xl font-bold text-yellow-500">{analytics.lateArrivals || 0}</p>
                  </div>
                </div>

                {analytics.monthlyBreakdown && (
                  <div className="mt-6">
                    <h4 className="font-medium text-white mb-3">Monthly Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.monthlyBreakdown).map(([month, data]) => (
                        <div key={month} className="flex justify-between text-sm p-2 hover:bg-gray-800 rounded">
                          <span className="text-gray-400">{month}</span>
                          <span className="text-orange-400">{data.percentage?.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AttendancePage
