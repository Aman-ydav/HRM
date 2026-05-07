import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, Button, Badge, Textarea, Modal, LoadingSpinner } from '../../components/ui'
import { feedbackService, employeeService } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Send } from 'lucide-react'
import { normalizeRole, getDefaultRouteForRole } from '../../lib/auth'

function FeedbackPage() {
  const { user, employee } = useAuth()
  const role = normalizeRole(user?.role)
  const isEmployee = role === 'employee'
  const fallbackRoute = getDefaultRouteForRole(user?.role)

  const employeeId = employee?._id
  const [activeTab, setActiveTab] = useState('received')
  const [receivedFeedback, setReceivedFeedback] = useState([])
  const [givenFeedback, setGivenFeedback] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [directory, setDirectory] = useState([])
  const [newFeedback, setNewFeedback] = useState({
    receiverId: '',
    rating: 5,
    category: 'other',
    comment: '',
  })

  useEffect(() => {
    if (!isEmployee) {
      return
    }

    const fetchDirectory = async () => {
      try {
        const response = await employeeService.getDirectory()
        const rows = (response?.data || []).filter((row) => row._id !== employeeId)
        setDirectory(rows)
      } catch (err) {
        console.warn('Failed to load employee directory:', err)
      }
    }

    fetchDirectory()
  }, [employeeId, isEmployee])

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

        if (activeTab === 'received') {
          const response = await feedbackService.getReceived(employeeId, 1, 50)
          setReceivedFeedback(response?.data || [])
        } else if (activeTab === 'given') {
          const response = await feedbackService.getGiven(employeeId, 1, 50)
          setGivenFeedback(response?.data || [])
        } else if (activeTab === 'analytics') {
          const response = await feedbackService.getAnalytics(employeeId)
          setAnalytics(response?.data || null)
        }
      } catch (err) {
        setError(err.message || 'Failed to load feedback')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, employeeId, isEmployee])

  if (!isEmployee) {
    return <Navigate to={fallbackRoute} replace />
  }

  const handleSubmitFeedback = async () => {
    try {
      if (!newFeedback.receiverId) {
        setError('Please select an employee to submit feedback')
        return
      }

      await feedbackService.submit({
        receiverId: newFeedback.receiverId,
        feedbackType: 'peer_review',
        rating: newFeedback.rating,
        category: newFeedback.category,
        comment: newFeedback.comment,
      })

      setSubmitModalOpen(false)
      setNewFeedback({ receiverId: '', rating: 5, category: 'other', comment: '' })

      const response = await feedbackService.getGiven(employeeId, 1, 50)
      setGivenFeedback(response?.data || [])
      setActiveTab('given')
    } catch (err) {
      setError(err.message || 'Failed to submit feedback')
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'green'
    if (rating >= 3) return 'yellow'
    return 'red'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Feedback</h1>
          <p className="text-gray-400">Give and receive constructive feedback</p>
        </div>
        <Button variant="primary" onClick={() => setSubmitModalOpen(true)}>
          <Send size={16} className="mr-2" />
          Submit Feedback
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-800">
        {['received', 'given', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'received' && 'Received'}
            {tab === 'given' && 'Given'}
            {tab === 'analytics' && 'Analytics'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {activeTab === 'received' && (
            <div className="space-y-4">
              {receivedFeedback.length ? (
                receivedFeedback.map((fb, idx) => (
                  <Card key={fb._id || idx}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-white">
                          {fb.sender?.firstName} {fb.sender?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={getRatingColor(fb.rating)}>{fb.rating}/5</Badge>
                    </div>
                    <p className="text-gray-300 mb-3">{fb.comment}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{fb.category?.replace('_', ' ')}</Badge>
                      {fb.isPositive && <Badge variant="green">Positive</Badge>}
                    </div>
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-gray-400 text-center py-12">No feedback received yet</p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'given' && (
            <div className="space-y-4">
              {givenFeedback.length ? (
                givenFeedback.map((fb, idx) => (
                  <Card key={fb._id || idx}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-white">To: {fb.receiver?.firstName} {fb.receiver?.lastName}</p>
                        <p className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={getRatingColor(fb.rating)}>{fb.rating}/5</Badge>
                    </div>
                    <p className="text-gray-300 mb-3">{fb.comment}</p>
                    <Badge variant="default">{fb.category?.replace('_', ' ')}</Badge>
                  </Card>
                ))
              ) : (
                <Card>
                  <p className="text-gray-400 text-center py-12">No feedback given yet</p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-bold text-white mb-4">Overall Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 hover:bg-gray-800 rounded">
                    <span className="text-gray-400">Average Rating</span>
                    <span className="text-xl font-bold text-orange-400">{analytics.averageRating?.toFixed(1) || 0}/5</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-800 rounded">
                    <span className="text-gray-400">Total Feedback</span>
                    <span className="text-xl font-bold text-orange-400">{analytics.totalFeedback || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-gray-800 rounded">
                    <span className="text-gray-400">Positive %</span>
                    <span className="text-xl font-bold text-green-400">{analytics.positivePercentage?.toFixed(1) || 0}%</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-bold text-white mb-4">By Category</h3>
                <div className="space-y-2">
                  {analytics.byCategory && Object.entries(analytics.byCategory).map(([cat, details]) => (
                    <div key={cat} className="flex justify-between items-center p-2 hover:bg-gray-800 rounded">
                      <span className="text-gray-400 capitalize">{cat.replace('_', ' ')}</span>
                      <Badge variant="orange">{details.count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      <Modal
        open={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Submit Feedback"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setSubmitModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitFeedback}>Submit</Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-300 mb-2">To (Employee)</label>
            <select
              value={newFeedback.receiverId}
              onChange={(e) => setNewFeedback({ ...newFeedback, receiverId: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
              required
            >
              <option value="">Select employee</option>
              {directory.map((person) => (
                <option key={person._id} value={person._id}>
                  {person.firstName} {person.lastName} ({person.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setNewFeedback({ ...newFeedback, rating })}
                  className={`px-4 py-2 rounded transition ${
                    newFeedback.rating === rating
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={newFeedback.category}
              onChange={(e) => setNewFeedback({ ...newFeedback, category: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
            >
              <option value="work_quality">Work Quality</option>
              <option value="collaboration">Collaboration</option>
              <option value="communication">Communication</option>
              <option value="attendance">Attendance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Textarea
            label="Comments"
            placeholder="Share your constructive feedback..."
            value={newFeedback.comment}
            onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
            required
            rows={4}
          />
        </form>
      </Modal>
    </div>
  )
}

export default FeedbackPage
