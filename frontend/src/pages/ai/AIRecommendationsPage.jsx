import React, { useState, useEffect } from 'react'
import { Card, Badge, LoadingSpinner } from '../../components/ui'
import { aiService } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Zap, AlertTriangle, TrendingDown, Lightbulb } from 'lucide-react'

function AIRecommendationsPage() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState(null)
  const [burnoutAnalysis, setBurnoutAnalysis] = useState(null)
  const [fairnessAnalysis, setFairnessAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAIData = async () => {
      setLoading(true)
      setError('')
      try {
        const [rec, burnout, fairness] = await Promise.all([
          aiService.getRecommendations(user?._id).catch(err => {
            console.warn('Recommendations error:', err)
            return null
          }),
          aiService.getBurnoutAnalysis().catch(err => {
            console.warn('Burnout analysis error:', err)
            return null
          }),
          aiService.getRewardFairnessAnalysis().catch(err => {
            console.warn('Fairness analysis error:', err)
            return null
          }),
        ])

        setRecommendations(rec)
        setBurnoutAnalysis(burnout)
        setFairnessAnalysis(fairness)
      } catch (err) {
        setError(err.message || 'Failed to load AI insights')
      } finally {
        setLoading(false)
      }
    }

    fetchAIData()
  }, [user?._id])

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'red'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="text-orange-500" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-white">AI Insights</h1>
          <p className="text-gray-400">Powered by Gemini AI</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* AI Recommendations */}
          {recommendations && (
            <Card className="border border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-transparent">
              <div className="flex items-start gap-4">
                <Lightbulb className="text-orange-500 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-3">
                    AI Recommendations for You
                  </h2>
                  <div className="space-y-3">
                    {recommendations.recommendations ? (
                      Array.isArray(recommendations.recommendations) ? (
                        recommendations.recommendations.map((rec, idx) => (
                          <div key={idx} className="p-3 bg-gray-800 rounded flex items-start gap-3">
                            <span className="text-orange-500 flex-shrink-0">→</span>
                            <p className="text-gray-300">{rec}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-gray-800 rounded">
                          <p className="text-gray-300">{recommendations.recommendations}</p>
                        </div>
                      )
                    ) : (
                      <p className="text-gray-400">No recommendations available at this time</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Burnout Analysis */}
            {burnoutAnalysis && (
              <Card className="border border-yellow-500/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="text-yellow-500" size={24} />
                    <h3 className="text-lg font-bold text-white">Burnout Analysis</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {burnoutAnalysis.employees ? (
                    burnoutAnalysis.employees.slice(0, 5).map((emp, idx) => (
                      <div key={idx} className="p-3 bg-gray-800 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">
                            {emp.name || emp.firstName}
                          </span>
                          <Badge variant={getRiskColor(emp.riskLevel)}>
                            {emp.riskLevel?.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{emp.reason}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              emp.riskLevel?.toLowerCase() === 'high'
                                ? 'bg-red-500'
                                : emp.riskLevel?.toLowerCase() === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${(emp.riskScore || 0) * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No burnout data available</p>
                  )}
                </div>
              </Card>
            )}

            {/* Reward Fairness */}
            {fairnessAnalysis && (
              <Card className="border border-teal-500/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="text-teal-500" size={24} />
                    <h3 className="text-lg font-bold text-white">Reward Fairness</h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {fairnessAnalysis.anomalies && fairnessAnalysis.anomalies.length > 0 ? (
                    fairnessAnalysis.anomalies.slice(0, 5).map((anom, idx) => (
                      <div key={idx} className="p-3 bg-gray-800 rounded border-l-2 border-teal-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">
                            {anom.employeeName}
                          </span>
                          <Badge variant="orange">
                            {anom.percentage?.toFixed(0)}% above avg
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          Reward points: {anom.rewardPoints} | Avg: {anom.average}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">Rewards are fairly distributed</p>
                  )}

                  {fairnessAnalysis.summary && (
                    <div className="p-3 bg-green-500/10 rounded border border-green-500/20 mt-4">
                      <p className="text-sm text-green-400">{fairnessAnalysis.summary}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* AI Info Card */}
          <Card className="bg-gray-800/50 border border-gray-700">
            <div className="flex items-start gap-3">
              <Zap className="text-orange-500 flex-shrink-0 mt-1" size={18} />
              <div>
                <p className="font-medium text-white mb-1">About AI Insights</p>
                <p className="text-sm text-gray-400">
                  These insights are powered by Google Gemini AI and analyze employee performance, 
                  burnout risk, and reward distribution fairness. Recommendations are updated weekly.
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
