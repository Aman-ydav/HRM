import React, { useState, useEffect } from 'react'
import { Card, Badge, LoadingSpinner } from '../../components/ui'
import Chart from '../../components/ui/Chart'
import { dashboardService, performanceService } from '../../lib/api'
import { BarChart3, Users, Gift, TrendingUp } from 'lucide-react'

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [trends, setTrends] = useState([])
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

        setDashboard(dash?.data || dash || null)
        setTrends(tr?.data || [])
        setTopPerformers(top?.data || [])
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
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Employees</p>
              <p className="text-3xl font-bold text-orange-500">{dashboard?.overview?.totalEmployees || 0}</p>
            </div>
            <Users className="text-orange-500/20" size={32} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Rewards</p>
              <p className="text-3xl font-bold text-emerald-500">{dashboard?.overview?.totalRewards || 0}</p>
            </div>
            <Gift className="text-emerald-500/20" size={32} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Bonus</p>
              <p className="text-3xl font-bold text-sky-500">${dashboard?.rewards?.totalBonusDistributed || 0}</p>
            </div>
            <TrendingUp className="text-sky-500/20" size={32} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Attendance Rate</p>
              <p className="text-3xl font-bold text-purple-500">{dashboard?.attendance?.attendancePercentage || 0}%</p>
            </div>
            <BarChart3 className="text-purple-500/20" size={32} />
          </div>
        </Card>
      </div>

      {trends.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Trends (Last 6 Months)</h3>
          <div>
            <Chart
              labels={trends.map(t => t.month)}
              datasets={[
                {
                  label: 'Rewards',
                  data: trends.map(t => t.rewards || 0),
                  backgroundColor: 'rgba(255,94,0,0.8)'
                },
                {
                  label: 'Performances',
                  data: trends.map(t => t.performances || 0),
                  backgroundColor: 'rgba(34,197,94,0.8)'
                }
              ]}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' } },
              }}
            />
          </div>
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
