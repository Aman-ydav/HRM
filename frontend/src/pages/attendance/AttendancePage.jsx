import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, LoadingSpinner, Badge } from '../../components/ui'
import { attendanceService } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Calendar, TrendingUp } from 'lucide-react'
import { normalizeRole, getDefaultRouteForRole } from '../../lib/auth'

function AttendancePage() {
  const { user, employee } = useAuth()
  const role = normalizeRole(user?.role)
  const isEmployee = role === 'employee'
  const fallbackRoute = getDefaultRouteForRole(user?.role)

  const employeeId = employee?._id
  const [activeTab, setActiveTab] = useState('history') // history, monthly, analytics
  const [history, setHistory] = useState([])
  const [monthlyReport, setMonthlyReport] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    if (!isEmployee) {
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        if (!employeeId) {
          setError('Employee profile is not available for this account')
          return
        }

        if (activeTab === 'history') {
          const response = await attendanceService.getHistory(employeeId, 1, 50)
          setHistory(response?.data || [])
        } else if (activeTab === 'monthly') {
          const [year, month] = selectedMonth.split('-')
          const response = await attendanceService.getMonthlyReport(employeeId, parseInt(month), parseInt(year))
          setMonthlyReport(response?.data || null)
        } else if (activeTab === 'analytics') {
          const response = await attendanceService.getAnalytics(employeeId, 12)
          setAnalytics(response?.data || null)
        }
      } catch (err) {
        setError(err.message || 'Failed to load attendance data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, selectedMonth, employeeId, isEmployee])

  if (!isEmployee) {
    return <Navigate to={fallbackRoute} replace />
  }

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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Attendance</h1>
        <p className="text-slate-600">Track your attendance and working hours</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {['history', 'monthly', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
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
                          <p className="font-medium text-slate-900">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-600">
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
                          <p className="text-xs text-slate-600 mt-2">{record.totalHours.toFixed(1)}h</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-slate-600 text-center py-8">No attendance records found</p>
                </Card>
              )}
            </div>
          )}

          {/* Monthly Report View */}
          {activeTab === 'monthly' && monthlyReport && (
            <div className="space-y-4">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Monthly Report</h3>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-white text-slate-900 px-3 py-1 rounded border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-slate-600 text-sm">Total Days</p>
                    <p className="text-2xl font-bold text-orange-500">{monthlyReport.total || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-slate-600 text-sm">Present</p>
                    <p className="text-2xl font-bold text-green-600">{monthlyReport.present || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-slate-600 text-sm">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{monthlyReport.absent || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-slate-600 text-sm">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{monthlyReport.late || 0}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded">
                  <p className="text-slate-600 text-sm mb-2">Attendance Percentage</p>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-orange-500 h-3 rounded-full transition-all"
                      style={{ width: `${monthlyReport.percentage || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-orange-600 font-bold mt-2">{monthlyReport.percentage?.toFixed(1) || 0}%</p>
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
                  <h3 className="text-lg font-bold text-slate-900">12-Month Analytics</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-slate-600 text-sm">Avg Daily Hours</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {analytics.averageWorkingHours?.toFixed(1) || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-slate-600 text-sm">Avg Attendance</p>
                    <p className="text-2xl font-bold text-green-500">
                      {analytics.attendancePercentage?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-slate-600 text-sm">Late Arrivals</p>
                    <p className="text-2xl font-bold text-yellow-500">{analytics.lateCount || 0}</p>
                  </div>
                </div>

                {analytics.totalRecords !== undefined && (
                  <div className="mt-6">
                    <h4 className="font-medium text-slate-900 mb-3">Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 hover:bg-slate-100 rounded">
                        <span className="text-slate-600">Total Records</span>
                        <span className="text-orange-600">{analytics.totalRecords}</span>
                      </div>
                      <div className="flex justify-between p-2 hover:bg-slate-100 rounded">
                        <span className="text-slate-600">Present</span>
                        <span className="text-green-600">{analytics.presentCount || 0}</span>
                      </div>
                      <div className="flex justify-between p-2 hover:bg-slate-100 rounded">
                        <span className="text-slate-600">Absent</span>
                        <span className="text-red-600">{analytics.absentCount || 0}</span>
                      </div>
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
