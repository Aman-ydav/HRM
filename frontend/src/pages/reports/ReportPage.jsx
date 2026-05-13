import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, Badge, LoadingSpinner } from '../../components/ui'
import { reportService } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { normalizeRole, getDefaultRouteForRole } from '../../lib/auth'
import { BarChart3, TrendingUp, FileText } from 'lucide-react'
import { Bar } from 'react-chartjs-2'

function ReportPage() {
  const { user, employee } = useAuth()
  const role = normalizeRole(user?.role)
  const isEmployee = role === 'employee'
  const fallbackRoute = getDefaultRouteForRole(user?.role)

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEmployee) {
      return
    }

    const fetchReport = async () => {
      try {
        if (!employee?._id) {
          setError('Employee profile is not available')
          return
        }

        const response = await reportService.getEmployeeReport(employee._id)
        setReport(response?.data || null)
      } catch (err) {
        setError(err.message || 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [employee?._id, isEmployee])

  if (!isEmployee) {
    return <Navigate to={fallbackRoute} replace />
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Performance Report</h1>
        <Card>
          <p className="text-slate-600 text-center py-8">No performance data available yet</p>
        </Card>
      </div>
    )
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'top':
        return 'bg-emerald-50 border border-emerald-200'
      case 'middle':
        return 'bg-sky-50 border border-sky-200'
      default:
        return 'bg-gray-50 border border-gray-200'
    }
  }

  const getCategoryBadgeVariant = (category) => {
    switch (category) {
      case 'top':
        return 'green'
      case 'middle':
        return 'blue'
      default:
        return 'red'
    }
  }

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'top':
        return 'Top Performer (75-100)'
      case 'middle':
        return 'Middle Performer (60-74)'
      default:
        return 'Below Threshold (<60)'
    }
  }

  const chartData = {
    labels: ['Task Completion', 'Productivity', 'Collaboration', 'Rating'],
    datasets: [
      {
        label: 'Performance Metrics',
        data: [
          report.averages?.taskCompletionRate || 0,
          (report.averages?.productivityScore / 5) * 100 || 0,
          (report.averages?.teamCollaborationScore / 5) * 100 || 0,
          (report.averages?.monthlyRating / 5) * 100 || 0,
        ],
        backgroundColor: 'rgba(255, 94, 0, 0.8)',
        borderColor: 'rgba(255, 94, 0, 1)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance Report</h1>
        <p className="text-slate-600">Detailed review and scoring analysis</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Header Card with Category */}
      <Card className={getCategoryColor(report.category)}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-600 text-sm mb-2">Employee</p>
            <h2 className="text-2xl font-bold text-slate-900">{report.employee?.name}</h2>
            <p className="text-slate-600 text-sm">{report.employee?.department}</p>
          </div>
          <div className="text-right">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-2 border-orange-500 mb-2">
              <span className="text-3xl font-bold text-orange-600">{report.score}</span>
            </div>
            <Badge variant={getCategoryBadgeVariant(report.category)}>
              {getCategoryLabel(report.category)}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-current border-opacity-20">
          <div>
            <p className="text-xs text-slate-600">Total Reviews</p>
            <p className="text-lg font-bold text-slate-900">{report.totalReviews}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Avg Rating</p>
            <p className="text-lg font-bold text-orange-600">{report.averages?.monthlyRating?.toFixed(1)}/5</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Overall</p>
            <p className="text-lg font-bold text-slate-900">{report.averages?.overallPerformance?.toFixed(1)}</p>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-orange-500" />
          <h3 className="text-lg font-bold text-slate-900">Key Metrics</h3>
        </div>

        <div>
          <Bar data={chartData} options={{ responsive: true, indexAxis: 'y', plugins: { legend: { position: 'top' } } }} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-xs text-slate-600">Task Completion</p>
            <p className="text-xl font-bold text-slate-900">{report.averages?.taskCompletionRate?.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-xs text-slate-600">Productivity</p>
            <p className="text-xl font-bold text-slate-900">{report.averages?.productivityScore?.toFixed(1)}/5</p>
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-xs text-slate-600">Collaboration</p>
            <p className="text-xl font-bold text-slate-900">{report.averages?.teamCollaborationScore?.toFixed(1)}/5</p>
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-xs text-slate-600">Avg Rating</p>
            <p className="text-xl font-bold text-orange-600">{report.averages?.monthlyRating?.toFixed(1)}/5</p>
          </div>
        </div>
      </Card>

      {/* Scoring Details */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-orange-500" />
          <h3 className="text-lg font-bold text-slate-900">Scoring Categories</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-emerald-900">Top Performer</p>
              <Badge variant="green">75-100 pts</Badge>
            </div>
            <p className="text-sm text-emerald-800">Exceptional performance across all metrics. Eligible for premium rewards and promotions.</p>
          </div>
          <div className="p-3 bg-sky-50 border border-sky-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sky-900">Middle Performer</p>
              <Badge variant="blue">60-74 pts</Badge>
            </div>
            <p className="text-sm text-sky-800">Solid performance with room for improvement. Focus areas identified.</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-red-900">Below Threshold</p>
              <Badge variant="red">&lt;60 pts</Badge>
            </div>
            <p className="text-sm text-red-800">Performance needs improvement. Development plan recommended.</p>
          </div>
        </div>
      </Card>

      {/* Trend Analysis */}
      {report.trend && report.trend.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-orange-500" />
            <h3 className="text-lg font-bold text-slate-900">Performance Trend (Last 6 Reviews)</h3>
          </div>
          <div className="space-y-2">
            {report.trend.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <span className="text-sm text-slate-600 w-32">
                  {entry.reviewPeriod?.startDate
                    ? new Date(entry.reviewPeriod.startDate).toLocaleDateString()
                    : `Review ${idx + 1}`}
                </span>
                <div className="flex-1 mx-4">
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${(entry.overallPerformance / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right w-16">
                  <p className="text-sm font-bold text-slate-900">{entry.overallPerformance?.toFixed(1)}</p>
                  <p className="text-xs text-slate-600">Score</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default ReportPage
