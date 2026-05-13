import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Select, Badge, LoadingSpinner, Modal, Textarea } from '../../components/ui'
import { rewardService, employeeService } from '../../lib/api'
import { Check, X, Eye } from 'lucide-react'

function RewardManagement() {
  const [activeTab, setActiveTab] = useState('pending')
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReward, setSelectedReward] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [approvalReason, setApprovalReason] = useState('')
  const [approvalAction, setApprovalAction] = useState('approved')
  const [employees, setEmployees] = useState([])
  const [newRewardForm, setNewRewardForm] = useState({
    employeeId: '',
    rewardType: 'points',
    points: '',
    bonus: '',
    reason: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        // Fetch employees for dropdown
        const empData = await employeeService.getAllEmployees(1, 100)
        setEmployees(empData.data || [])

        const rewardsData = await rewardService.getAllRewards(1, 100, '', '', '', '')
        setRewards(rewardsData.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleApproveReward = async () => {
    try {
      await rewardService.approveReward(selectedReward._id, approvalAction, approvalReason)
      setModalOpen(false)
      setSelectedReward(null)
      setApprovalReason('')
      // Refresh rewards
      const data = await rewardService.getAllRewards(1, 100, '', '', '', '')
      setRewards(data.data || [])
    } catch (err) {
      setError(err.message || 'Failed to approve reward')
    }
  }

  const handleAssignReward = async () => {
    try {
      await rewardService.assignReward({
        employeeId: newRewardForm.employeeId,
        rewardType: newRewardForm.rewardType,
        points: newRewardForm.rewardType === 'points' ? parseInt(newRewardForm.points) : undefined,
        bonus: newRewardForm.rewardType === 'bonus' ? parseInt(newRewardForm.bonus) : undefined,
        reason: newRewardForm.reason,
        month: new Date().toISOString().slice(0, 7),
      })
      setNewRewardForm({ employeeId: '', rewardType: 'points', points: '', bonus: '', reason: '' })
      const data = await rewardService.getAllRewards(1, 100, '', '', '', '')
      setRewards(data.data || [])
    } catch (err) {
      setError(err.message || 'Failed to assign reward')
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

  const filteredRewards = rewards.filter(r => {
    if (activeTab === 'pending') return r.approvalStatus === 'pending'
    if (activeTab === 'approved') return r.approvalStatus === 'approved'
    if (activeTab === 'rejected') return r.approvalStatus === 'rejected'
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Reward Management</h1>
        <p className="text-slate-600">Assign and approve employee rewards</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Assign Reward Form */}
      <Card>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Assign New Reward</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Employee"
              value={newRewardForm.employeeId}
              onChange={(e) => setNewRewardForm({ ...newRewardForm, employeeId: e.target.value })}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </Select>

            <Select
              label="Reward Type"
              value={newRewardForm.rewardType}
              onChange={(e) => setNewRewardForm({ ...newRewardForm, rewardType: e.target.value })}
            >
              <option value="points">Points</option>
              <option value="bonus">Bonus</option>
              <option value="badge">Badge</option>
              <option value="employee_of_month">Employee of Month</option>
            </Select>

            {newRewardForm.rewardType === 'points' ? (
              <Input
                label="Points"
                type="number"
                placeholder="0-500"
                value={newRewardForm.points}
                onChange={(e) => setNewRewardForm({ ...newRewardForm, points: e.target.value })}
                min="0"
                max="500"
              />
            ) : (
              <Input
                label="Bonus Amount ($)"
                type="number"
                placeholder="0-100000"
                value={newRewardForm.bonus}
                onChange={(e) => setNewRewardForm({ ...newRewardForm, bonus: e.target.value })}
                min="0"
                max="100000"
              />
            )}
          </div>

          <Textarea
            label="Reason"
            placeholder="Why are you giving this reward?"
            value={newRewardForm.reason}
            onChange={(e) => setNewRewardForm({ ...newRewardForm, reason: e.target.value })}
            rows={2}
          />

          <Button variant="primary" onClick={handleAssignReward}>
            Assign Reward
          </Button>
        </div>
      </Card>

      {/* Rewards Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {['pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-orange-500 text-orange-500'
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
        <div className="space-y-3">
          {filteredRewards.length ? (
            filteredRewards.map((reward) => (
              <Card key={reward._id} className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-slate-900">
                      {reward.employeeId?.firstName} {reward.employeeId?.lastName}
                    </h4>
                    <Badge variant={reward.rewardType === 'points' ? 'orange' : 'green'}>
                      {reward.rewardType}
                    </Badge>
                  </div>
                  <p className="text-slate-600 mb-2">{reward.reason}</p>
                  <div className="flex gap-3 text-sm">
                    <span className="text-slate-500">
                      {reward.points && `${reward.points} pts`}
                      {reward.bonus && `$${reward.bonus}`}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-500">
                      {new Date(reward.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={getStatusColor(reward.approvalStatus)}>
                    {reward.approvalStatus}
                  </Badge>
                  {reward.approvalStatus === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedReward(reward)
                          setApprovalAction('approved')
                          setModalOpen(true)
                        }}
                        className="p-2 hover:bg-green-500/20 rounded text-green-400"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReward(reward)
                          setApprovalAction('rejected')
                          setModalOpen(true)
                        }}
                        className="p-2 hover:bg-red-500/20 rounded text-red-400"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-slate-600 text-center py-8">No rewards found</p>
            </Card>
          )}
        </div>
      )}

      {/* Approval Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${approvalAction === 'approved' ? 'Approve' : 'Reject'} Reward`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              variant={approvalAction === 'approved' ? 'primary' : 'danger'}
              onClick={handleApproveReward}
            >
              {approvalAction === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        }
      >
        {selectedReward && (
          <div className="space-y-4">
            <div>
              <p className="text-slate-600 text-sm">Reward</p>
              <p className="font-bold text-slate-900">
                {selectedReward.employeeId?.firstName} {selectedReward.employeeId?.lastName} - {selectedReward.rewardType}
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-sm">Reason</p>
              <p className="text-slate-900">{selectedReward.reason}</p>
            </div>
            <Textarea
              label={`${approvalAction === 'approved' ? 'Approval' : 'Rejection'} Notes (Optional)`}
              placeholder="Add any additional notes..."
              value={approvalReason}
              onChange={(e) => setApprovalReason(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RewardManagement
