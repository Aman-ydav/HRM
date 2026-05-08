import { GoogleGenerativeAI } from '@google/generative-ai';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Performance from '../models/Performance.js';
import Reward from '../models/Reward.js';
import Feedback from '../models/Feedback.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

const ATTENDED_STATUSES = new Set(['present', 'late', 'half_day']);

const getMonthRange = (baseDate = new Date()) => {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const safeRound = (value, decimals = 2) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const getAttendanceRate = (records = []) => {
  if (!records.length) return 0;
  const attended = records.filter((item) => ATTENDED_STATUSES.has(item.status)).length;
  return safeRound((attended / records.length) * 100, 1);
};

const getEmployeeFromUser = async (userId) => {
  return Employee.findOne({ userId });
};

const canAccessEmployee = async (req, employeeId) => {
  if (req.userRole !== 'employee') {
    return true;
  }

  const myEmployee = await getEmployeeFromUser(req.userId);
  if (!myEmployee) {
    return false;
  }

  return myEmployee._id.toString() === employeeId.toString();
};

const buildEmployeeContext = async (employeeId) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return null;
  }

  const { start, end } = getMonthRange();

  const [attendance, performance, rewards, feedbackReceived] = await Promise.all([
    Attendance.find({ employeeId, date: { $gte: start, $lte: end } }),
    Performance.findOne({ employeeId }).sort({ createdAt: -1 }),
    Reward.find({ employeeId, approvalStatus: 'approved' }).sort({ createdAt: -1 }),
    Feedback.find({ receiver: employeeId }).sort({ createdAt: -1 }).limit(20),
  ]);

  const attendanceRate = getAttendanceRate(attendance);
  const lateCount = attendance.filter((item) => item.status === 'late').length;
  const rewardPoints = rewards.reduce((sum, item) => sum + (item.points || 0), 0);
  const rewardBonus = rewards.reduce((sum, item) => sum + (item.bonus || 0), 0);
  const averageFeedback = feedbackReceived.length
    ? safeRound(feedbackReceived.reduce((sum, item) => sum + (item.rating || 0), 0) / feedbackReceived.length, 1)
    : 0;

  return {
    employee: {
      id: employee._id,
      name: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      position: employee.position,
    },
    metrics: {
      attendanceRate,
      attendanceRecords: attendance.length,
      lateCount,
      overallPerformance: performance?.overallPerformance || 0,
      monthlyRating: performance?.monthlyRating || 0,
      taskCompletionRate: performance?.taskCompletionRate || 0,
      collaborationScore: performance?.teamCollaborationScore || 0,
      rewardCount: rewards.length,
      rewardPoints,
      rewardBonus,
      averageFeedback,
    },
  };
};

const buildOrgContext = async () => {
  const { start, end } = getMonthRange();

  const [employees, attendanceRecords, rewards, topPerformances] = await Promise.all([
    Employee.find({ status: 'active' }),
    Attendance.find({ date: { $gte: start, $lte: end } }),
    Reward.find({ approvalStatus: 'approved' }),
    Performance.find().sort({ overallPerformance: -1 }).limit(5).populate('employeeId', 'firstName lastName department'),
  ]);

  const attendanceRate = getAttendanceRate(attendanceRecords);
  const totalBonus = rewards.reduce((sum, item) => sum + (item.bonus || 0), 0);
  const rewardsByType = rewards.reduce((acc, item) => {
    acc[item.rewardType] = (acc[item.rewardType] || 0) + 1;
    return acc;
  }, {});

  const departmentBreakdown = employees.reduce((acc, item) => {
    acc[item.department] = (acc[item.department] || 0) + 1;
    return acc;
  }, {});

  return {
    org: {
      totalActiveEmployees: employees.length,
      attendanceRate,
      totalRewards: rewards.length,
      totalBonus,
      rewardsByType,
      departmentBreakdown,
      topPerformers: topPerformances.map((item) => ({
        name: `${item.employeeId?.firstName || ''} ${item.employeeId?.lastName || ''}`.trim(),
        department: item.employeeId?.department || 'N/A',
        score: item.overallPerformance || 0,
      })),
    },
  };
};

const extractJsonObject = (text) => {
  if (!text || typeof text !== 'string') return null;

  const direct = text.trim();
  try {
    return JSON.parse(direct);
  } catch {
    // continue
  }

  const startIdx = direct.indexOf('{');
  const endIdx = direct.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return null;
  }

  const slice = direct.slice(startIdx, endIdx + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
};

let geminiClient = null;
let geminiClientKey = '';

const getGeminiApiKey = () => process.env.GENAI_API_KEY || process.env.GEMINI_API_KEY || '';

const getGeminiModelName = () => process.env.GENAI_MODEL || 'gemini-2.5-flash';

const getGeminiClient = () => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return null;
  }

  if (!geminiClient || geminiClientKey !== apiKey) {
    geminiClient = new GoogleGenerativeAI(apiKey);
    geminiClientKey = apiKey;
  }

  return geminiClient;
};

const logGeminiError = (label, error) => {
  console.error(`[Gemini] ${label} failed`, {
    model: getGeminiModelName(),
    status: error?.status || error?.response?.status || error?.cause?.status || null,
    message: error?.message || 'Unknown Gemini error',
    responseBody:
      error?.response?.data ||
      error?.response?.body ||
      error?.details ||
      error?.error ||
      error?.cause?.response?.data ||
      error?.cause?.response?.body ||
      error?.cause ||
      null,
  });
};

const isLocationRestrictedError = (error) => {
  const status = error?.status || error?.response?.status || error?.cause?.status || null;
  const message = String(error?.message || '').toLowerCase();
  return (
    status === 400 &&
    (message.includes('user location is not supported') ||
      message.includes('location is not supported') ||
      message.includes('not supported for the api use'))
  );
};

const callAIText = async (prompt, fallbackText) => {
  const client = getGeminiClient();
  const modelName = getGeminiModelName();

  if (!client) {
    return fallbackText;
  }

  try {
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        responseMimeType: 'text/plain',
      },
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = result?.response?.text?.() || '';
    return text || fallbackText;
  } catch (error) {
    if (isLocationRestrictedError(error)) {
      console.warn('[Gemini] API access blocked for this deployment location; using fallback response.', {
        model: modelName,
      });
      return fallbackText;
    }

    logGeminiError('AI call', error);
    return fallbackText;
  }
};

const defaultRecommendations = (context) => {
  const metrics = context?.metrics || {};

  return {
    assessment: `Attendance is ${metrics.attendanceRate || 0}% and performance score is ${metrics.overallPerformance || 0}/5.`,
    improvements: [
      'Keep daily attendance consistency above 95%.',
      'Focus on collaboration and timely delivery for next review cycle.',
    ],
    rewardEligibility: metrics.overallPerformance >= 4 && metrics.attendanceRate >= 90
      ? 'Eligible for recognition this month.'
      : 'Needs improvement before bonus recommendation.',
    alerts: metrics.lateCount > 3 ? ['Frequent late arrivals detected this month.'] : [],
    nextSteps: [
      'Review monthly goals with manager.',
      'Track progress weekly and update feedback notes.',
    ],
  };
};

export const getAIRecommendations = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!(await canAccessEmployee(req, employeeId))) {
      return sendError(res, 'Not authorized to access this employee recommendations', 403);
    }

    const context = await buildEmployeeContext(employeeId);
    if (!context) {
      return sendError(res, 'Employee not found', 404);
    }

    const fallback = defaultRecommendations(context);

    const prompt = `
You are an HR performance assistant.
Use this employee context and return JSON only with keys:
assessment (string), improvements (string[]), rewardEligibility (string), alerts (string[]), nextSteps (string[]).

Context:
${JSON.stringify(context, null, 2)}
    `;

    const aiText = await callAIText(prompt, JSON.stringify(fallback));
    const parsed = extractJsonObject(aiText);

    const recommendations = {
      assessment: parsed?.assessment || fallback.assessment,
      improvements: Array.isArray(parsed?.improvements) ? parsed.improvements : fallback.improvements,
      rewardEligibility: parsed?.rewardEligibility || fallback.rewardEligibility,
      alerts: Array.isArray(parsed?.alerts) ? parsed.alerts : fallback.alerts,
      nextSteps: Array.isArray(parsed?.nextSteps) ? parsed.nextSteps : fallback.nextSteps,
    };

    return sendSuccess(
      res,
      { recommendations, contextSummary: context.metrics },
      'AI recommendations generated successfully',
      200
    );
  } catch (error) {
    console.error('Get AI recommendations error:', error);
    next(error);
  }
};

export const getBurnoutAnalysis = async (req, res, next) => {
  try {
    const { start, end } = getMonthRange();
    const employees = await Employee.find({ status: 'active' });

    const burnoutRisks = [];

    for (const emp of employees) {
      const [attendance, performance] = await Promise.all([
        Attendance.find({ employeeId: emp._id, date: { $gte: start, $lte: end } }),
        Performance.findOne({ employeeId: emp._id }).sort({ createdAt: -1 }),
      ]);

      const attendanceRate = getAttendanceRate(attendance);
      const lateCount = attendance.filter((item) => item.status === 'late').length;

      let riskScore = 0;
      const indicators = [];

      if (attendanceRate < 85) {
        riskScore += 30;
        indicators.push('Low attendance');
      }

      if (lateCount >= 4) {
        riskScore += 25;
        indicators.push('Frequent late arrivals');
      }

      if ((performance?.overallPerformance || 0) < 3) {
        riskScore += 30;
        indicators.push('Low performance trend');
      }

      if (riskScore > 0) {
        burnoutRisks.push({
          employeeId: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          riskScore,
          riskLevel: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
          reason: indicators.join(', ') || 'No major indicators',
        });
      }
    }

    const sorted = burnoutRisks.sort((a, b) => b.riskScore - a.riskScore);

    return sendSuccess(
      res,
      {
        employees: sorted,
        burnoutRisks: sorted,
        summary: `${sorted.length} employees with burnout risk indicators this month.`,
      },
      'Burnout risk analysis completed successfully',
      200
    );
  } catch (error) {
    console.error('Get burnout analysis error:', error);
    next(error);
  }
};

export const getRewardFairnessAnalysis = async (req, res, next) => {
  try {
    const { month } = req.query;
    const query = { approvalStatus: 'approved' };

    if (month) {
      query.month = month;
    }

    const [rewards, employees] = await Promise.all([
      Reward.find(query),
      Employee.find({ status: 'active' }),
    ]);

    if (!employees.length) {
      return sendSuccess(
        res,
        {
          totalRewards: 0,
          averageRewardsPerEmployee: 0,
          anomalies: [],
          summary: 'No employees found for fairness analysis.',
        },
        'Reward fairness analysis completed successfully',
        200
      );
    }

    const rewardCountByEmployee = new Map();

    for (const emp of employees) {
      rewardCountByEmployee.set(emp._id.toString(), {
        employeeId: emp._id.toString(),
        employeeName: `${emp.firstName} ${emp.lastName}`,
        rewardPoints: 0,
      });
    }

    for (const reward of rewards) {
      const key = reward.employeeId.toString();
      if (!rewardCountByEmployee.has(key)) continue;
      const row = rewardCountByEmployee.get(key);
      row.rewardPoints += 1;
      rewardCountByEmployee.set(key, row);
    }

    const rows = Array.from(rewardCountByEmployee.values());
    const avg = rows.reduce((sum, row) => sum + row.rewardPoints, 0) / rows.length;

    const anomalies = rows
      .filter((row) => row.rewardPoints > avg * 2 && avg > 0)
      .map((row) => ({
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        rewardPoints: row.rewardPoints,
        average: safeRound(avg, 2),
        percentage: safeRound(((row.rewardPoints - avg) / avg) * 100, 1),
      }))
      .sort((a, b) => b.rewardPoints - a.rewardPoints);

    const summary = anomalies.length
      ? `${anomalies.length} potential outliers found in reward distribution.`
      : 'Reward distribution looks balanced for the selected period.';

    return sendSuccess(
      res,
      {
        totalRewards: rewards.length,
        averageRewardsPerEmployee: safeRound(avg, 2),
        distribution: rows.sort((a, b) => b.rewardPoints - a.rewardPoints).slice(0, 10),
        anomalies,
        summary,
      },
      'Reward fairness analysis completed successfully',
      200
    );
  } catch (error) {
    console.error('Get fairness analysis error:', error);
    next(error);
  }
};

export const chatWithAI = async (req, res, next) => {
  try {
    const { message, employeeId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return sendError(res, 'Message is required', 400);
    }

    let scope = 'organization';
    let context;

    if (req.userRole === 'employee') {
      const myEmployee = await getEmployeeFromUser(req.userId);
      if (!myEmployee) {
        return sendError(res, 'Employee profile not found', 404);
      }
      context = await buildEmployeeContext(myEmployee._id);
      scope = 'employee';
    } else if (employeeId) {
      context = await buildEmployeeContext(employeeId);
      scope = 'employee';
    } else {
      context = await buildOrgContext();
      scope = 'organization';
    }

    if (!context) {
      return sendError(res, 'Context data not found for chat', 404);
    }

    const fallbackReply = scope === 'employee'
      ? `Summary:\n- Attendance: ${context.metrics?.attendanceRate || 0}%\n- Performance score: ${context.metrics?.overallPerformance || 0}/5\n- Rewards: ${context.metrics?.rewardCount || 0}\n\nDetailed analysis:\n- Strong area: current reward and feedback trends are stable.\n- Risk area: improve attendance consistency and reduce late arrivals.\n\nAction plan:\n1. Weekly goal review with manager.\n2. Track attendance and delivery cadence every Friday.\n3. Reassess for reward eligibility at month end.`
      : `Summary:\n- Active employees: ${context.org?.totalActiveEmployees || 0}\n- Attendance: ${context.org?.attendanceRate || 0}%\n- Total rewards: ${context.org?.totalRewards || 0}\n\nDetailed analysis:\n- Use department breakdown to compare staffing and performance pressure.\n- Review top performers and reward distribution outliers together.\n\nAction plan:\n1. Run monthly department-level performance calibration.\n2. Audit reward fairness exceptions.\n3. Start targeted coaching plans for risk groups.`;

    const prompt = `
You are an HR analytics assistant.
Give a detailed answer using this structure:
1) Summary
2) What the data indicates
3) Risks or anomalies
4) Recommended actions (with priority)
5) What to monitor next
Use clear bullet points and reference exact values from context where possible.
Role asking: ${req.userRole}
Scope: ${scope}

App context:
${JSON.stringify(context, null, 2)}

User question:
${message}
    `;

    const reply = await callAIText(prompt, fallbackReply);

    return sendSuccess(
      res,
      {
        reply,
        scope,
        contextSummary: scope === 'employee' ? context.metrics : context.org,
      },
      'AI chat response generated successfully',
      200
    );
  } catch (error) {
    console.error('AI chat error:', error);
    next(error);
  }
};

export default {
  getAIRecommendations,
  getBurnoutAnalysis,
  getRewardFairnessAnalysis,
  chatWithAI,
};
