import React, { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner } from '../../components/ui'
import Chart from '../../components/ui/Chart'
import DepartmentRewardChart from '../../components/DepartmentRewardChart'
import DepartmentBadges from '../../components/DepartmentBadges'
import { rewardService } from '../../lib/api'
import { DEPARTMENTS } from '../../constants/enums'

function DepartmentRewardsPage() {
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDept, setSelectedDept] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [byDepartment, setByDepartment] = useState([])
  const [badgeAnalytics, setBadgeAnalytics] = useState([])

  useEffect(() => {
    const fetchRewards = async () => {
      setLoading(true)
      setError('')
      try {
        const [rewardsData, departmentData, badgeData] = await Promise.all([
          rewardService.getAllRewards(1, 1000, '', '', '', ''),
          rewardService.getByDepartment(),
          rewardService.getBadgeAnalytics(),
        ])

        setRewards(rewardsData.data || [])
        setByDepartment(departmentData.data || [])
        setBadgeAnalytics(badgeData.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load rewards')
      } finally {
        setLoading(false)
      }
    }

    fetchRewards()
  }, [])

  const getDepartmentStats = (deptValue) => {
    const deptRewards = rewards.filter(r => r.employeeId?.department === deptValue)
    return {
      totalRewards: deptRewards.length,
      totalPoints: deptRewards.reduce((sum, r) => sum + (r.points || 0), 0),
      totalBonus: deptRewards.reduce((sum, r) => sum + (r.bonus || 0), 0),
      avgPerEmployee: deptRewards.length > 0 
        ? Math.round(deptRewards.reduce((sum, r) => sum + (r.points || 0), 0) / new Set(deptRewards.map(r => r.employeeId?._id)).size)
        : 0,
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Department Rewards & Badges</h1>
        <p className="text-slate-600">Analyze reward distribution and manage badges by department</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {['overview', 'departments', 'badges'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors font-medium ${
              activeTab === tab
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'departments' && 'By Department'}
            {tab === 'badges' && 'Badges'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <DepartmentRewardChart rewards={rewards} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {byDepartment.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Department Reward Mix</h3>
                <Chart
                  labels={byDepartment.map((item) => item._id)}
                  datasets={[
                    {
                      label: 'Rewards',
                      data: byDepartment.map((item) => item.count || 0),
                      backgroundColor: 'rgba(249, 115, 22, 0.8)',
                    },
                    {
                      label: 'Badge Rewards',
                      data: byDepartment.map((item) => item.badgeCount || 0),
                      backgroundColor: 'rgba(168, 85, 247, 0.8)',
                    },
                  ]}
                  options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
                />
              </Card>
            )}

            {badgeAnalytics.length > 0 && (
              <Card>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Badge Distribution</h3>
                <Chart
                  type="doughnut"
                  labels={badgeAnalytics.map((item) => item._id || 'Unknown')}
                  datasets={[
                    {
                      label: 'Badges',
                      data: badgeAnalytics.map((item) => item.count || 0),
                      backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(14, 165, 233, 0.8)',
                      ],
                      borderColor: '#fff',
                      borderWidth: 2,
                    },
                  ]}
                  options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                />
              </Card>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(DEPARTMENTS).map(dept => {
              const stats = getDepartmentStats(dept.value)
              return (
                <Card key={dept.value}>
                  <div className="text-sm text-slate-600 mb-2">{dept.label}</div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats.totalRewards}</p>
                      <p className="text-xs text-slate-600">Total Rewards</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-orange-600">{stats.totalPoints}</p>
                      <p className="text-xs text-slate-600">Total Points</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* By Department Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
            {Object.values(DEPARTMENTS).map(dept => {
            const stats = getDepartmentStats(dept.value)
            const deptRewards = rewards.filter(r => r.employeeId?.department === dept.value)
            
            return (
              <Card key={dept.value}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{dept.label}</h3>
                    <p className="text-sm text-slate-600">Reward Statistics</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${dept.color}-100 text-${dept.color}-900`}>
                    {stats.totalRewards} rewards
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded">
                    <p className="text-slate-600 text-sm mb-1">Total Points</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.totalPoints}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded">
                    <p className="text-slate-600 text-sm mb-1">Total Bonus</p>
                    <p className="text-2xl font-bold text-green-600">${stats.totalBonus}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded">
                    <p className="text-slate-600 text-sm mb-1">Avg per Employee</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.avgPerEmployee}</p>
                  </div>
                </div>

                {deptRewards.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-medium text-slate-900 text-sm">Recent Rewards:</p>
                    {deptRewards.slice(0, 3).map((reward, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded text-sm">
                        <span className="text-slate-900">{reward.employeeId?.firstName} {reward.employeeId?.lastName}</span>
                        <span className="font-semibold text-orange-600">
                          {reward.points && `${reward.points} pts`}
                          {reward.bonus && `$${reward.bonus}`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-4">No rewards for this department yet</p>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <DepartmentBadges />
      )}
    </div>
  )
}

export default DepartmentRewardsPage
