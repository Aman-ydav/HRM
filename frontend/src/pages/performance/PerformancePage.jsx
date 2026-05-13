import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, Badge, LoadingSpinner } from '../../components/ui'
import Chart from '../../components/ui/Chart'
import { performanceService } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { normalizeRole, getDefaultRouteForRole } from '../../lib/auth'

function PerformancePage() {
  const { user, employee } = useAuth()
  const role = normalizeRole(user?.role)
  const isEmployee = role === 'employee'
  const fallbackRoute = getDefaultRouteForRole(user?.role)

  const employeeId = employee?._id
  const [activeTab, setActiveTab] = useState('history')
  const [reviews, setReviews] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [topPerformers, setTopPerformers] = useState([])
  const [departmentAnalytics, setDepartmentAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          const response = await performanceService.getHistory(employeeId, 1, 20)
          setReviews(response?.data || [])
        } else if (activeTab === 'analytics') {
          const response = await performanceService.getAnalytics(employeeId)
          setAnalytics(response?.data || null)
        } else if (activeTab === 'top') {
          const response = await performanceService.getTopPerformers(10)
          setTopPerformers(response?.data || [])
        }

        if (employee?.department && activeTab !== 'history') {
          const deptResponse = await performanceService.getDepartmentAnalytics(employee.department)
          setDepartmentAnalytics(deptResponse?.data || null)
        }
      } catch (err) {
        setError(err.message || 'Failed to load performance data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, employeeId, employee?.department, isEmployee])

  if (!isEmployee) {
    return <Navigate to={fallbackRoute} replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance</h1>
        <p className="text-slate-600">Track your reviews and performance metrics</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200">
        {['history', 'analytics', 'top'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'history' && 'Reviews'}
            {tab === 'analytics' && 'Analytics'}
            {tab === 'top' && 'Top Performers'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {activeTab === 'history' && (
            <div className="space-y-4">
              {reviews.length ? (
                reviews.map((review, idx) => (
                  <Card key={review._id || idx}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900">Review {idx + 1}</h3>
                        <p className="text-sm text-slate-600">
                          {new Date(review.reviewPeriod?.startDate).toLocaleDateString()} - {new Date(review.reviewPeriod?.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="font-bold text-orange-600">{review.overallPerformance?.toFixed(1) || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-600">Task Completion</p>
                        <p className="font-bold text-slate-900">{review.taskCompletionRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Productivity</p>
                        <p className="font-bold text-slate-900">{review.productivityScore}/5</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Rating</p>
                        <p className="font-bold text-orange-600">{review.monthlyRating}/5</p>
                      </div>
                    </div>

                    {review.comments && (
                      <div className="p-3 bg-slate-50 rounded">
                        <p className="text-xs text-slate-600 mb-1">Comments</p>
                        <p className="text-sm text-slate-700">{review.comments}</p>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-slate-600 text-center py-12">No performance reviews yet</p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="text-orange-500" />
                  <h3 className="text-lg font-bold text-slate-900">Performance Analytics</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-slate-600 text-sm">Avg Rating</p>
                    <p className="text-2xl font-bold text-orange-600">{analytics.averageRating?.toFixed(1) || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-slate-600 text-sm">Trend Data</p>
                    <p className="text-2xl font-bold text-emerald-600">{Array.isArray(analytics.trend) ? analytics.trend.length : 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-slate-600 text-sm">Reviews Count</p>
                    <p className="text-2xl font-bold text-sky-600">{analytics.totalReviews || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded">
                    <p className="text-slate-600 text-sm">Avg Score</p>
                    <p className="text-2xl font-bold text-purple-600">{analytics.averagePerformance?.toFixed(1) || 0}</p>
                  </div>
                </div>

                {Array.isArray(analytics.trend) && analytics.trend.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">Recent Ratings</h4>
                    <div className="space-y-2">
                      {analytics.trend.slice(0, 6).map((entry, idx) => {
                        const rating = entry.monthlyRating || 0

                        return (
                          <div key={entry._id || idx} className="flex items-center justify-between">
                            <span className="text-slate-600">
                              {entry.reviewPeriod?.startDate
                                ? new Date(entry.reviewPeriod.startDate).toLocaleDateString()
                                : `Review ${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500" style={{ width: `${(rating / 5) * 100}%` }}></div>
                              </div>
                              <span className="text-orange-600 font-bold text-sm w-8">{rating}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {departmentAnalytics && (
                <Card>
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="text-orange-500" />
                    <h3 className="text-lg font-bold text-slate-900">Department Snapshot</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded">
                      <p className="text-slate-600 text-sm">Department Avg</p>
                      <p className="text-2xl font-bold text-orange-600">{departmentAnalytics.averagePerformance?.toFixed(1) || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded">
                      <p className="text-slate-600 text-sm">Employees</p>
                      <p className="text-2xl font-bold text-slate-900">{departmentAnalytics.totalEmployees || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded">
                      <p className="text-slate-600 text-sm">Reviews</p>
                      <p className="text-2xl font-bold text-sky-600">{departmentAnalytics.totalReviews || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded">
                      <p className="text-slate-600 text-sm">Your Dept</p>
                      <p className="text-lg font-bold text-slate-900">{departmentAnalytics.department}</p>
                    </div>
                  </div>

                  <Chart
                    labels={departmentAnalytics.employees?.slice(0, 5).map((emp) => emp.name) || []}
                    datasets={[
                      {
                        label: 'Peer Performance',
                        data: departmentAnalytics.employees?.slice(0, 5).map((emp) => emp.performance || 0) || [],
                        backgroundColor: 'rgba(249, 115, 22, 0.75)',
                        borderRadius: 10,
                      },
                    ]}
                    options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
                  />
                </Card>
              )}
            </div>
          )}

          {activeTab === 'top' && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="text-orange-500" />
                  <h3 className="text-lg font-bold text-slate-900">Top 10 Performers</h3>
                </div>

                <div className="space-y-3">
                  {topPerformers.map((emp, idx) => (
                    <div key={emp._id || idx} className="flex items-center justify-between p-4 bg-slate-50 rounded">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          idx === 0
                            ? 'bg-yellow-400'
                            : idx === 1
                            ? 'bg-slate-400'
                            : idx === 2
                            ? 'bg-orange-600'
                            : 'bg-slate-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{emp.employeeId?.firstName} {emp.employeeId?.lastName}</p>
                          <p className="text-xs text-slate-600">{emp.employeeId?.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="orange">{emp.overallPerformance?.toFixed(1) || 0}</Badge>
                        <p className="text-xs text-slate-600 mt-1">Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PerformancePage
