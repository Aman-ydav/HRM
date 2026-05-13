import React, { useState, useEffect } from 'react'
import { Card, Badge, LoadingSpinner } from '../../components/ui'
import Chart from '../../components/ui/Chart'
import { dashboardService, performanceService } from '../../lib/api'
import { BarChart3, Users, Gift, TrendingUp, Sparkles, Layers3 } from 'lucide-react'

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [trends, setTrends] = useState([])
  const [departmentAnalytics, setDepartmentAnalytics] = useState([])
  const [rewardAnalytics, setRewardAnalytics] = useState(null)
  const [topPerformers, setTopPerformers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [dash, tr, top] = await Promise.all([
          dashboardService.getAdminDashboard(),
          dashboardService.getMonthlyTrends(),
          performanceService.getTopPerformers(5),
        ])

        const [departmentData, rewardData] = await Promise.all([
          dashboardService.getDepartmentAnalytics(),
          dashboardService.getRewardAnalytics(),
        ])

        setDashboard(dash?.data || dash || null)
        setTrends(tr?.data || [])
        setTopPerformers(top?.data || [])
        setDepartmentAnalytics(departmentData?.data || [])
        setRewardAnalytics(rewardData?.data || null)
      } catch (err) {
        setError(err.message || 'Failed to load admin dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const rewardBreakdown = Array.isArray(dashboard?.rewards?.byType) ? dashboard.rewards.byType : []
  const rewardByType = Array.isArray(rewardAnalytics?.byType)
    ? rewardAnalytics.byType
    : Object.entries(rewardAnalytics?.byType || {}).map(([key, value]) => ({ _id: key, ...value }))
  const rewardByDepartment = Array.isArray(rewardAnalytics?.byDepartment)
    ? rewardAnalytics.byDepartment
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">System Overview & Analytics</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Employees</p>
              <p className="text-3xl font-bold text-orange-500">{dashboard?.overview?.totalEmployees || 0}</p>
            </div>
            <Users className="text-orange-500/20" size={32} />
          </div>
        </Card>

        <Card className="transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Rewards</p>
              <p className="text-3xl font-bold text-emerald-500">{dashboard?.overview?.totalRewards || 0}</p>
            </div>
            <Gift className="text-emerald-500/20" size={32} />
          </div>
        </Card>

        <Card className="transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Bonus</p>
              <p className="text-3xl font-bold text-sky-500">${dashboard?.rewards?.totalBonusDistributed || 0}</p>
            </div>
            <TrendingUp className="text-sky-500/20" size={32} />
          </div>
        </Card>

        <Card className="transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Attendance Rate</p>
              <p className="text-3xl font-bold text-purple-500">{dashboard?.attendance?.attendancePercentage || 0}%</p>
            </div>
            <BarChart3 className="text-purple-500/20" size={32} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trends.length > 0 && (
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-orange-500" size={20} />
              <h3 className="text-lg font-bold text-slate-900">Monthly Trends</h3>
            </div>
            <Chart
              type="line"
              labels={trends.map(t => t.month)}
              datasets={[
                {
                  label: 'Rewards',
                  data: trends.map(t => t.rewards || 0),
                  borderColor: 'rgb(249, 115, 22)',
                  backgroundColor: 'rgba(249, 115, 22, 0.15)',
                  tension: 0.35,
                  fill: true,
                },
                {
                  label: 'Performance Reviews',
                  data: trends.map(t => t.performances || 0),
                  borderColor: 'rgb(34, 197, 94)',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  tension: 0.35,
                  fill: true,
                },
              ]}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' } },
              }}
            />
          </Card>
        )}

        {rewardByType.length > 0 && (
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <Layers3 className="text-sky-500" size={20} />
              <h3 className="text-lg font-bold text-slate-900">Reward Mix by Type</h3>
            </div>
            <Chart
              type="doughnut"
              labels={rewardByType.map(entry => entry._id?.replace('_', ' ') || 'Unknown')}
              datasets={[
                {
                  label: 'Rewards',
                  data: rewardByType.map(entry => entry.count || 0),
                  backgroundColor: [
                    'rgba(249, 115, 22, 0.85)',
                    'rgba(16, 185, 129, 0.85)',
                    'rgba(59, 130, 246, 0.85)',
                    'rgba(168, 85, 247, 0.85)',
                    'rgba(236, 72, 153, 0.85)',
                    'rgba(245, 158, 11, 0.85)',
                  ],
                  borderColor: '#ffffff',
                  borderWidth: 2,
                },
              ]}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </Card>
        )}
      </div>

      {rewardByDepartment.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Rewards by Department</h3>
          <Chart
            labels={rewardByDepartment.map(entry => entry._id)}
            datasets={[
              {
                label: 'Reward Count',
                data: rewardByDepartment.map(entry => entry.count || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.75)',
                borderRadius: 10,
              },
              {
                label: 'Badge Count',
                data: rewardByDepartment.map(entry => entry.badgeCount || 0),
                backgroundColor: 'rgba(168, 85, 247, 0.75)',
                borderRadius: 10,
              },
            ]}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
            }}
          />
        </Card>
      )}

      {departmentAnalytics.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Department Performance Overview</h3>
          <Chart
            labels={departmentAnalytics.map(entry => entry.department)}
            datasets={[
              {
                label: 'Average Performance',
                data: departmentAnalytics.map(entry => Number(entry.averagePerformance || 0).toFixed(1)),
                backgroundColor: 'rgba(16, 185, 129, 0.75)',
                borderRadius: 10,
              },
              {
                label: 'Reward Points',
                data: departmentAnalytics.map(entry => entry.rewardSummary?.totalPoints || 0),
                backgroundColor: 'rgba(249, 115, 22, 0.75)',
                borderRadius: 10,
              },
            ]}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
            }}
          />
        </Card>
      )}

      {topPerformers.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top 5 Performers</h3>
          <div className="space-y-2">
            {topPerformers.map((record, idx) => (
              <div key={record._id || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0
                      ? 'bg-yellow-400 text-slate-900'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-900'
                      : idx === 2
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-200 text-slate-900'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{record.employeeId?.firstName} {record.employeeId?.lastName}</p>
                    <p className="text-xs text-slate-600">{record.employeeId?.department}</p>
                  </div>
                </div>
                <Badge variant="orange">{record.overallPerformance?.toFixed(1) || 0}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {rewardBreakdown.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Reward Distribution</h3>
          <div className="space-y-2">
            {rewardBreakdown.map((entry) => (
              <div key={entry._id} className="flex items-center justify-between">
                <span className="text-slate-600 capitalize">{entry._id?.replace('_', ' ')}</span>
                <Badge variant="orange">{entry.count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AdminDashboard
