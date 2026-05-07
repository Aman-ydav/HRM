import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner, Modal } from '../../components/ui'
import { rewardService } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Gift, Trophy } from 'lucide-react'

function RewardsPage() {
  const { user, employee } = useAuth()
  const employeeId = employee?._id
  const [activeTab, setActiveTab] = useState('rewards') // rewards, leaderboard, bonus
  const [rewards, setRewards] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [bonusHistory, setBonusHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedReward, setSelectedReward] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        if (!employeeId) {
          setError('Employee profile is not available for this account')
          return
        }

        if (activeTab === 'rewards') {
          const data = await rewardService.getRewards(employeeId)
          setRewards(data.data || [])
        } else if (activeTab === 'leaderboard') {
          const data = await rewardService.getLeaderboard(50)
          setLeaderboard(data.data || [])
        } else if (activeTab === 'bonus') {
          const data = await rewardService.getBonusHistory(employeeId)
          setBonusHistory(data.data || [])
        }
      } catch (err) {
        setError(err.message || 'Failed to load rewards')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, employeeId])

  const getRewardColor = (type) => {
    switch (type) {
      case 'points': return 'orange'
      case 'bonus': return 'green'
      case 'badge': return 'yellow'
      case 'employee_of_month': return 'orange'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'green'
      case 'pending': return 'yellow'
      case 'rejected': return 'red'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Rewards & Recognition</h1>
        <p className="text-gray-400">View your earned rewards and compare with colleagues</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 overflow-x-auto">
        {['rewards', 'leaderboard', 'bonus'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'rewards' && 'My Rewards'}
            {tab === 'leaderboard' && 'Leaderboard'}
            {tab === 'bonus' && 'Bonus History'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Rewards View */}
          {activeTab === 'rewards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.length ? (
                rewards.map((reward, idx) => (
                  <Card
                    key={idx}
                    className="cursor-pointer hover:border-orange-500/50 transition-colors"
                    onClick={() => {
                      setSelectedReward(reward)
                      setModalOpen(true)
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Gift className="text-orange-500" size={20} />
                      </div>
                      <Badge variant={getStatusColor(reward.approvalStatus)}>
                        {reward.approvalStatus?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="font-bold text-white mb-2">{reward.rewardType?.replace('_', ' ')}</p>
                    <p className="text-gray-400 text-sm mb-4">{reward.reason}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-lg font-bold text-orange-500">
                        {reward.points && `${reward.points} pts`}
                        {reward.bonus && `$${reward.bonus}`}
                      </span>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="md:col-span-2 lg:col-span-3">
                  <p className="text-gray-400 text-center py-12">No rewards yet. Keep up the great work!</p>
                </Card>
              )}
            </div>
          )}

          {/* Leaderboard View */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="text-orange-500" />
                  <h3 className="text-lg font-bold text-white">Top Performers</h3>
                </div>

                <div className="space-y-3">
                  {leaderboard.map((emp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-800 rounded hover:bg-gray-700 transition">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          idx === 0 ? 'bg-yellow-500 text-black' :
                          idx === 1 ? 'bg-gray-400 text-black' :
                          idx === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-700 text-white'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-gray-400">{emp.employeeId}</p>
                        </div>
                      </div>
                      <Badge variant="orange">{emp.rewardPoints || 0} pts</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Bonus History View */}
          {activeTab === 'bonus' && (
            <div className="space-y-4">
              <Card>
                <h3 className="text-lg font-bold text-white mb-4">Bonus History</h3>

                {bonusHistory.length ? (
                  <div className="space-y-3">
                    {bonusHistory.map((bonus, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-800 rounded">
                        <div>
                          <p className="font-medium text-white">{bonus.month}</p>
                          <p className="text-sm text-gray-400">{bonus.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-400">${bonus.amount}</p>
                          <Badge variant={getStatusColor(bonus.status)}>
                            {bonus.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No bonus history yet</p>
                )}
              </Card>
            </div>
          )}
        </>
      )}

      {/* Reward Detail Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Reward Details"
        footer={<Button variant="secondary" onClick={() => setModalOpen(false)}>Close</Button>}
      >
        {selectedReward && (
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm">Type</p>
              <p className="font-bold text-white capitalize">{selectedReward.rewardType?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Reason</p>
              <p className="text-white">{selectedReward.reason}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <Badge variant={getStatusColor(selectedReward.approvalStatus)}>
                  {selectedReward.approvalStatus}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="font-medium text-white">
                  {new Date(selectedReward.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {selectedReward.points && (
              <div>
                <p className="text-gray-400 text-sm">Points</p>
                <p className="text-lg font-bold text-orange-500">{selectedReward.points}</p>
              </div>
            )}
            {selectedReward.bonus && (
              <div>
                <p className="text-gray-400 text-sm">Bonus Amount</p>
                <p className="text-lg font-bold text-green-400">${selectedReward.bonus}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RewardsPage
