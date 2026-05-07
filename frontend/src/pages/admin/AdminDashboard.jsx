import React, { useState, useEffect } from 'react'
import { Card, Badge, LoadingSpinner } from '../../components/ui'
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
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">System Overview & Analytics</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Employees</p>
              <p className="text-3xl font-bold text-orange-500">{dashboard?.overview?.totalEmployees || 0}</p>
            </div>
            <Users className="text-orange-500/30" size={32} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Rewards</p>
              <p className="text-3xl font-bold text-green-500">{dashboard?.overview?.totalRewards || 0}</p>
            </div>
            <Gift className="text-green-500/30" size={32} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Bonus</p>
              <p className="text-3xl font-bold text-blue-500">${dashboard?.rewards?.totalBonusDistributed || 0}</p>
            </div>
            <TrendingUp className="text-blue-500/30" size={32} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Attendance Rate</p>
              <p className="text-3xl font-bold text-purple-500">{dashboard?.attendance?.attendancePercentage || 0}%</p>
            </div>
            <BarChart3 className="text-purple-500/30" size={32} />
          </div>
        </Card>
      </div>

      {trends.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Monthly Trends (Last 6 Months)</h3>
          <div className="space-y-3">
            {trends.map((monthData) => (
              <div key={monthData.month} className="p-3 bg-gray-800 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{monthData.month}</span>
                  <div className="flex gap-2">
                    <Badge variant="orange">Rewards: {monthData.rewards || 0}</Badge>
                    <Badge variant="green">Reviews: {monthData.performances || 0}</Badge>
                  </div>
                </div>
                <div className="text-xs text-gray-400">Attendance: {monthData.attendance || 0}%</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {topPerformers.length > 0 && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Top 5 Performers</h3>
          <div className="space-y-2">
            {topPerformers.map((record, idx) => (
              <div key={record._id || idx} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
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
                    <p className="font-medium text-white text-sm">{record.employeeId?.firstName} {record.employeeId?.lastName}</p>
                    <p className="text-xs text-gray-400">{record.employeeId?.department}</p>
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
          <h3 className="text-lg font-bold text-white mb-4">Reward Distribution</h3>
          <div className="space-y-2">
            {rewardBreakdown.map((entry) => (
              <div key={entry._id} className="flex items-center justify-between">
                <span className="text-gray-400 capitalize">{entry._id?.replace('_', ' ')}</span>
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
