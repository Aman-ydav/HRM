import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, Badge, LoadingSpinner } from '../../components/ui'
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
      } catch (err) {
        setError(err.message || 'Failed to load performance data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, employeeId, isEmployee])

  if (!isEmployee) {
    return <Navigate to={fallbackRoute} replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Performance</h1>
        <p className="text-gray-400">Track your reviews and performance metrics</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-800">
        {['history', 'analytics', 'top'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-white'
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
                        <h3 className="font-bold text-white">Review {idx + 1}</h3>
                        <p className="text-sm text-gray-400">
                          {new Date(review.reviewPeriod?.startDate).toLocaleDateString()} - {new Date(review.reviewPeriod?.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <span className="font-bold text-orange-400">{review.overallPerformance?.toFixed(1) || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Task Completion</p>
                        <p className="font-bold text-white">{review.taskCompletionRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Productivity</p>
                        <p className="font-bold text-white">{review.productivityScore}/5</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rating</p>
                        <p className="font-bold text-orange-400">{review.monthlyRating}/5</p>
                      </div>
                    </div>

                    {review.comments && (
                      <div className="p-3 bg-gray-800 rounded">
                        <p className="text-xs text-gray-500 mb-1">Comments</p>
                        <p className="text-sm text-gray-300">{review.comments}</p>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-gray-400 text-center py-12">No performance reviews yet</p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="text-orange-500" />
                  <h3 className="text-lg font-bold text-white">Performance Analytics</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gray-800 rounded">
                    <p className="text-gray-400 text-sm">Avg Rating</p>
                    <p className="text-2xl font-bold text-orange-400">{analytics.averageRating?.toFixed(1) || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded">
                    <p className="text-gray-400 text-sm">Trend Data</p>
                    <p className="text-2xl font-bold text-green-400">{Array.isArray(analytics.trend) ? analytics.trend.length : 0}</p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded">
                    <p className="text-gray-400 text-sm">Reviews Count</p>
                    <p className="text-2xl font-bold text-blue-400">{analytics.totalReviews || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-800 rounded">
                    <p className="text-gray-400 text-sm">Avg Score</p>
                    <p className="text-2xl font-bold text-purple-400">{analytics.averagePerformance?.toFixed(1) || 0}</p>
                  </div>
                </div>

                {Array.isArray(analytics.trend) && analytics.trend.length > 0 && (
                  <div>
                    <h4 className="font-bold text-white mb-3">Recent Ratings</h4>
                    <div className="space-y-2">
                      {analytics.trend.slice(0, 6).map((entry, idx) => {
                        const rating = entry.monthlyRating || 0

                        return (
                          <div key={entry._id || idx} className="flex items-center justify-between">
                            <span className="text-gray-400">
                              {entry.reviewPeriod?.startDate
                                ? new Date(entry.reviewPeriod.startDate).toLocaleDateString()
                                : `Review ${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500" style={{ width: `${(rating / 5) * 100}%` }}></div>
                              </div>
                              <span className="text-orange-400 font-bold text-sm w-8">{rating}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'top' && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="text-orange-500" />
                  <h3 className="text-lg font-bold text-white">Top 10 Performers</h3>
                </div>

                <div className="space-y-3">
                  {topPerformers.map((emp, idx) => (
                    <div key={emp._id || idx} className="flex items-center justify-between p-4 bg-gray-800 rounded">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          idx === 0
                            ? 'bg-yellow-500 text-black'
                            : idx === 1
                            ? 'bg-gray-400 text-black'
                            : idx === 2
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{emp.employeeId?.firstName} {emp.employeeId?.lastName}</p>
                          <p className="text-xs text-gray-400">{emp.employeeId?.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="orange">{emp.overallPerformance?.toFixed(1) || 0}</Badge>
                        <p className="text-xs text-gray-400 mt-1">Score</p>
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
