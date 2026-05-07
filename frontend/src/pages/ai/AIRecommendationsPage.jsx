import React, { useMemo, useState, useEffect } from 'react'
import { Card, Badge, LoadingSpinner, Button, Input } from '../../components/ui'
import { aiService } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Zap, AlertTriangle, TrendingDown, Lightbulb, Send } from 'lucide-react'
import { normalizeRole } from '../../lib/auth'

function AIRecommendationsPage() {
  const { employee, user } = useAuth()
  const role = normalizeRole(user?.role)
  const employeeId = employee?._id || null
  const canViewOrgInsights = role === 'admin' || role === 'hr_manager'

  const [recommendations, setRecommendations] = useState(null)
  const [burnoutAnalysis, setBurnoutAnalysis] = useState(null)
  const [fairnessAnalysis, setFairnessAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask me about attendance trends, reward fairness, performance focus, or team risks based on app data.',
    },
  ])

  useEffect(() => {
    const fetchAIData = async () => {
      setLoading(true)
      setError('')

      try {
        const requests = []

        if (employeeId) {
          requests.push(
            aiService.getRecommendations(employeeId).then((res) => ({ key: 'rec', data: res?.data || res }))
          )
        }

        if (canViewOrgInsights) {
          requests.push(
            aiService.getBurnoutAnalysis().then((res) => ({ key: 'burnout', data: res?.data || res })),
            aiService.getRewardFairnessAnalysis().then((res) => ({ key: 'fairness', data: res?.data || res }))
          )
        }

        const results = await Promise.allSettled(requests)

        results.forEach((result) => {
          if (result.status !== 'fulfilled') {
            return
          }

          const payload = result.value
          if (payload.key === 'rec') setRecommendations(payload.data)
          if (payload.key === 'burnout') setBurnoutAnalysis(payload.data)
          if (payload.key === 'fairness') setFairnessAnalysis(payload.data)
        })
      } catch (err) {
        setError(err.message || 'Failed to load AI insights')
      } finally {
        setLoading(false)
      }
    }

    fetchAIData()
  }, [employeeId, canViewOrgInsights])

  const recommendationData = useMemo(() => {
    const data = recommendations?.recommendations
    if (!data) return null

    if (typeof data === 'string') {
      return {
        assessment: data,
        improvements: [],
        rewardEligibility: '',
        alerts: [],
        nextSteps: [],
      }
    }

    return {
      assessment: data.assessment || '',
      improvements: Array.isArray(data.improvements) ? data.improvements : [],
      rewardEligibility: data.rewardEligibility || '',
      alerts: Array.isArray(data.alerts) ? data.alerts : [],
      nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
    }
  }, [recommendations])

  const burnoutRows = burnoutAnalysis?.employees || burnoutAnalysis?.burnoutRisks || []
  const fairnessRows = fairnessAnalysis?.anomalies || []

  const getRiskColor = (level) => {
    switch (String(level || '').toLowerCase()) {
      case 'high':
        return 'red'
      case 'medium':
        return 'yellow'
      case 'low':
        return 'green'
      default:
        return 'default'
    }
  }

  const handleSendChat = async () => {
    const text = chatInput.trim()
    if (!text || chatLoading) {
      return
    }

    setChatMessages((prev) => [...prev, { role: 'user', text }])
    setChatInput('')
    setChatLoading(true)

    try {
      const response = await aiService.chat(text)
      const payload = response?.data || response
      const reply = payload?.reply || 'I could not generate an answer right now.'

      setChatMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: err.message || 'AI chat failed. Please try again.' },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const handleChatKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendChat()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="text-orange-500" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-white">AI Insights</h1>
          <p className="text-gray-400">Use app data to analyze employee and team performance</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <Card className="border border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-transparent">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-white">AI Chat</h2>
          <Badge variant="orange">{role || 'user'}</Badge>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
          {chatMessages.map((message, idx) => (
            <div
              key={`${message.role}-${idx}`}
              className={`rounded-xl p-3 text-sm ${
                message.role === 'user'
                  ? 'bg-orange-500/20 text-orange-100 ml-8'
                  : 'bg-gray-800 text-gray-200 mr-8'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
          ))}
          {chatLoading && (
            <div className="bg-gray-800 rounded-xl p-3 text-sm text-gray-300 mr-8">
              Thinking...
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Ask AI anything about attendance, rewards, or performance..."
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={handleChatKeyDown}
            disabled={chatLoading}
          />
          <Button variant="primary" onClick={handleSendChat} disabled={chatLoading || !chatInput.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {recommendationData && (
            <Card className="border border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-transparent">
              <div className="flex items-start gap-4">
                <Lightbulb className="text-orange-500 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1 space-y-4">
                  <h2 className="text-xl font-bold text-white">Personal Recommendations</h2>

                  {recommendationData.assessment && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Assessment</p>
                      <p className="text-gray-200">{recommendationData.assessment}</p>
                    </div>
                  )}

                  {recommendationData.improvements.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Improvements</p>
                      <div className="space-y-2">
                        {recommendationData.improvements.map((item, idx) => (
                          <div key={idx} className="p-2 bg-gray-800 rounded text-gray-200">- {item}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendationData.rewardEligibility && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Reward Eligibility</p>
                      <p className="text-green-300">{recommendationData.rewardEligibility}</p>
                    </div>
                  )}

                  {recommendationData.alerts.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Alerts</p>
                      <div className="space-y-2">
                        {recommendationData.alerts.map((item, idx) => (
                          <div key={idx} className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300">{item}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendationData.nextSteps.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Next Steps</p>
                      <div className="space-y-2">
                        {recommendationData.nextSteps.map((item, idx) => (
                          <div key={idx} className="p-2 bg-gray-800 rounded text-gray-200">- {item}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {canViewOrgInsights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-yellow-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="text-yellow-500" size={24} />
                  <h3 className="text-lg font-bold text-white">Burnout Analysis</h3>
                </div>

                {burnoutRows.length > 0 ? (
                  <div className="space-y-3">
                    {burnoutRows.slice(0, 6).map((emp) => (
                      <div key={emp.employeeId} className="p-3 bg-gray-800 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{emp.name}</span>
                          <Badge variant={getRiskColor(emp.riskLevel)}>{String(emp.riskLevel || '').toUpperCase()}</Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{emp.reason || 'No reason available'}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              String(emp.riskLevel || '').toLowerCase() === 'high'
                                ? 'bg-red-500'
                                : String(emp.riskLevel || '').toLowerCase() === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(emp.riskScore || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No burnout indicators available right now.</p>
                )}
              </Card>

              <Card className="border border-teal-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingDown className="text-teal-500" size={24} />
                  <h3 className="text-lg font-bold text-white">Reward Fairness</h3>
                </div>

                {fairnessRows.length > 0 ? (
                  <div className="space-y-3">
                    {fairnessRows.slice(0, 6).map((anom, idx) => (
                      <div key={anom.employeeId || idx} className="p-3 bg-gray-800 rounded border-l-2 border-teal-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{anom.employeeName}</span>
                          <Badge variant="orange">{anom.percentage?.toFixed(0) || 0}% above avg</Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          Reward count: {anom.rewardPoints || 0} | Average: {anom.average || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No major fairness anomalies detected.</p>
                )}

                {fairnessAnalysis?.summary && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <p className="text-sm text-green-300">{fairnessAnalysis.summary}</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          <Card className="bg-gray-800/50 border border-gray-700">
            <div className="flex items-start gap-3">
              <Zap className="text-orange-500 flex-shrink-0 mt-1" size={18} />
              <div>
                <p className="font-medium text-white mb-1">About AI Insights</p>
                <p className="text-sm text-gray-400">
                  AI uses current app data (attendance, rewards, performance, feedback) to generate role-aware insights.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default AIRecommendationsPage
