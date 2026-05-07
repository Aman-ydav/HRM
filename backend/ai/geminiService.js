// ai/geminiService.js
// Google Gemini AI Integration Service

import axios from 'axios';

/**
 * Initialize Gemini API Service
 * This file is a placeholder for Gemini API integration
 * 
 * To use:
 * 1. Get API key from: https://makersuite.google.com/app/apikey
 * 2. Add to .env: GEMINI_API_KEY=your_key
 * 3. Uncomment and use the functions below
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

/**
 * Call Gemini API for text generation
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - Generated content from Gemini
 */
export const callGeminiAPI = async (prompt) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY not configured. Using mock responses.');
      return getMockResponse(prompt);
    }

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    // Extract text from response
    const textContent = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error('No content in Gemini response');
    }

    return textContent;
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return getMockResponse(prompt);
  }
};

/**
 * Generate employee performance insights
 * @param {object} employeeData - Employee data for analysis
 * @returns {Promise<object>} - Insights and recommendations
 */
export const getPerformanceInsights = async (employeeData) => {
  const prompt = `
    Analyze the following employee performance data and provide insights:
    
    Employee: ${employeeData.name}
    Department: ${employeeData.department}
    Position: ${employeeData.position}
    
    Current Month Attendance: ${employeeData.attendance}%
    Performance Score: ${employeeData.performance}/5
    Task Completion Rate: ${employeeData.taskCompletion}%
    Team Collaboration: ${employeeData.collaboration}/5
    Total Rewards This Year: ${employeeData.rewardCount}
    
    Please provide:
    1. Brief performance assessment (2-3 lines)
    2. Top 2-3 recommendations for improvement
    3. Reward eligibility (yes/no with reason)
    4. Any concerns or alerts
    5. Suggested next steps for manager
    
    Keep response professional and actionable. Use bullet points where appropriate.
  `;

  const response = await callGeminiAPI(prompt);

  return {
    assessment: response,
    generatedAt: new Date(),
  };
};

/**
 * Analyze burnout risk
 * @param {object} riskData - Employee risk indicators
 * @returns {Promise<object>} - Burnout analysis
 */
export const analyzeBurnoutRisk = async (riskData) => {
  const prompt = `
    Analyze burnout risk for this employee:
    
    Attendance Rate: ${riskData.attendancePercentage}%
    Late Arrivals (This Month): ${riskData.lateCount}
    Performance Trend: ${riskData.performanceTrend}
    Feedback Score: ${riskData.feedbackScore}/5
    Overtime Hours: ${riskData.overtimeHours}h
    Recent Leave: ${riskData.recentLeave ? 'Yes' : 'No'}
    
    Provide:
    1. Burnout risk level (Low/Medium/High)
    2. Key indicators of risk
    3. Recommended interventions
    4. Suggested support measures
    
    Be concise and specific.
  `;

  const response = await callGeminiAPI(prompt);

  return {
    analysis: response,
    analyzedAt: new Date(),
  };
};

/**
 * Check reward distribution fairness
 * @param {array} rewardData - Array of reward distributions
 * @returns {Promise<object>} - Fairness analysis
 */
export const checkRewardFairness = async (rewardData) => {
  const summaryText = rewardData
    .slice(0, 10)
    .map((r) => `${r.name}: ${r.rewardCount} rewards (${r.totalBonus} bonus)`)
    .join('\n');

  const prompt = `
    Analyze reward distribution fairness:
    
    ${summaryText}
    
    Total Employees: ${rewardData.length}
    Average Rewards per Employee: ${(rewardData.reduce((s, r) => s + r.rewardCount, 0) / rewardData.length).toFixed(1)}
    
    Provide:
    1. Overall fairness assessment
    2. Identified anomalies or biases
    3. Recommendations for better distribution
    4. Departments or roles that need attention
    
    Be specific and actionable.
  `;

  const response = await callGeminiAPI(prompt);

  return {
    fairnessAnalysis: response,
    analyzedAt: new Date(),
  };
};

/**
 * Generate AI recommendations for team management
 * @param {object} teamData - Team statistics and data
 * @returns {Promise<object>} - Management recommendations
 */
export const getTeamRecommendations = async (teamData) => {
  const prompt = `
    Provide management recommendations for this team:
    
    Team: ${teamData.teamName}
    Department: ${teamData.department}
    Manager: ${teamData.manager}
    Team Size: ${teamData.size}
    
    Average Attendance: ${teamData.avgAttendance}%
    Average Performance: ${teamData.avgPerformance}/5
    Team Collaboration Score: ${teamData.collaborationScore}/5
    Monthly Turnover: ${teamData.turnover}%
    Top Performers: ${teamData.topPerformers}
    Underperformers: ${teamData.underperformers}
    
    Provide:
    1. Team health assessment
    2. Top 3 strengths
    3. Top 3 areas for improvement
    4. Specific action items for manager
    5. Team building recommendations
    
    Be strategic and practical.
  `;

  const response = await callGeminiAPI(prompt);

  return {
    recommendations: response,
    generatedAt: new Date(),
  };
};

/**
 * Get mock response (when API not configured)
 * @param {string} prompt - Original prompt
 * @returns {string} - Mock response
 */
const getMockResponse = (prompt) => {
  const responses = {
    performance:
      '✓ Employee shows consistent performance. Recommend focus on team collaboration skills. Eligible for quarterly bonus based on productivity metrics. Schedule performance review within 2 weeks.',
    burnout:
      'Risk Level: Medium\n\nIndicators:\n- 75% attendance (below target)\n- 3 late arrivals this month\n- Performance trending down\n\nRecommendations:\n- Schedule wellness check-in\n- Consider workload review\n- Suggest stress management resources',
    fairness:
      'Overall Fairness: Fair with minor anomalies\n\nKey Findings:\n- Distribution is relatively balanced\n- Top 10% of employees received 30% of rewards\n- Consider increasing recognition frequency\n\nRecommendations:\n- Implement peer recognition program\n- Review criteria for edge cases\n- Conduct quarterly fairness audit',
    default:
      'Analysis generated successfully using mock data. Configure GEMINI_API_KEY for real AI analysis.',
  };

  // Return appropriate mock response based on prompt keywords
  if (prompt.includes('burnout')) return responses.burnout;
  if (prompt.includes('fairness')) return responses.fairness;
  if (prompt.includes('performance')) return responses.performance;

  return responses.default;
};

/**
 * Validate Gemini API configuration
 * @returns {boolean} - Whether API is properly configured
 */
export const isGeminiConfigured = () => {
  return !!process.env.GEMINI_API_KEY;
};

export default {
  callGeminiAPI,
  getPerformanceInsights,
  analyzeBurnoutRisk,
  checkRewardFairness,
  getTeamRecommendations,
  isGeminiConfigured,
};
