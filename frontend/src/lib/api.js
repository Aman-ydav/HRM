import axios from 'axios'

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = String(error.config?.url || '')
      const hasSessionToken = !!localStorage.getItem('token')
      const isAuthEndpoint = requestUrl.startsWith('/auth/')

      // Only force logout for protected calls when a session token exists.
      if (hasSessionToken && !isAuthEndpoint) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

export default apiClient

// Service exports
export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getProfile: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, data) => apiClient.post(`/auth/reset-password/${token}`, data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
}

export const employeeService = {
  getProfile: () => apiClient.get('/employees/profile'),
  updateProfile: (data) => apiClient.put('/employees/profile', data),
  updateEmployeeById: (employeeId, data) => apiClient.put(`/employees/${employeeId}`, data),
  getDirectory: () => apiClient.get('/employees/directory'),
  getAllEmployees: (page = 1, limit = 10, search = '') => 
    apiClient.get('/employees/all', { params: { page, limit, search } }),
  getDashboard: () => apiClient.get('/employees/dashboard'),
  getRewards: () => apiClient.get('/employees/rewards'),
  getAttendanceSummary: () => apiClient.get('/employees/attendance-summary'),
  getPerformanceSummary: () => apiClient.get('/employees/performance-summary'),
}

export const attendanceService = {
  checkIn: () => apiClient.post('/attendance/check-in'),
  checkOut: () => apiClient.post('/attendance/check-out'),
  markAttendance: (data) => apiClient.post('/attendance/mark', data),
  getHistory: (employeeId, page = 1, limit = 20) =>
    apiClient.get(`/attendance/history/${employeeId}`, { params: { page, limit } }),
  getMonthlyReport: (employeeId, month, year) =>
    apiClient.get(`/attendance/report/${employeeId}/${month}/${year}`),
  getAnalytics: (employeeId, months = 12) =>
    apiClient.get(`/attendance/analytics/${employeeId}`, { params: { months } }),
}

export const performanceService = {
  addReview: (data) => apiClient.post('/performance/add', data),
  updateReview: (id, data) => apiClient.put(`/performance/${id}`, data),
  getHistory: (employeeId, page = 1, limit = 10) =>
    apiClient.get(`/performance/history/${employeeId}`, { params: { page, limit } }),
  getAnalytics: (employeeId) => apiClient.get(`/performance/analytics/${employeeId}`),
  getTopPerformers: (limit = 10) => 
    apiClient.get('/performance/top-performers', { params: { limit } }),
  getDepartmentAnalytics: (department) =>
    apiClient.get(`/performance/department/${department}`),
}

export const rewardService = {
  assignReward: (data) => apiClient.post('/rewards/assign', data),
  approveReward: (id, status, reason) =>
    apiClient.put(`/rewards/approve/${id}`, { approvalStatus: status, reason }),
  getAllRewards: (page = 1, limit = 20, status = '', month = '', rewardType = '', search = '') =>
    apiClient.get('/rewards/all', { params: { page, limit, status, month, rewardType, search } }),
  getRewards: (employeeId, status = '', month = '') =>
    apiClient.get(`/rewards/employee/${employeeId}`, { params: { status, month } }),
  getLeaderboard: (limit = 20) =>
    apiClient.get('/rewards/leaderboard', { params: { limit } }),
  getBonusHistory: (employeeId) =>
    apiClient.get(`/rewards/bonus-history/${employeeId}`),
  getByType: (type) => apiClient.get('/rewards/by-type', { params: { type } }),
  getByDepartment: (month = '') => apiClient.get('/rewards/by-department', { params: { month } }),
  getBadgeAnalytics: (month = '') => apiClient.get('/rewards/badges', { params: { month } }),
}

export const feedbackService = {
  submit: (data) => apiClient.post('/feedback/submit', data),
  getReceived: (employeeId, page = 1, limit = 10) =>
    apiClient.get(`/feedback/received/${employeeId}`, { params: { page, limit } }),
  getGiven: (employeeId, page = 1, limit = 10) =>
    apiClient.get(`/feedback/given/${employeeId}`, { params: { page, limit } }),
  delete: (id) => apiClient.delete(`/feedback/${id}`),
  update: (id, data) => apiClient.put(`/feedback/${id}`, data),
  getAnalytics: (employeeId) => apiClient.get(`/feedback/analytics/${employeeId}`),
}

export const dashboardService = {
  getAdminDashboard: () => apiClient.get('/dashboard/admin'),
  getMonthlyTrends: () => apiClient.get('/dashboard/trends'),
  getDepartmentAnalytics: () => apiClient.get('/dashboard/departments'),
  getAttendanceAnalytics: () => apiClient.get('/dashboard/attendance'),
  getRewardAnalytics: () => apiClient.get('/dashboard/rewards'),
}

export const aiService = {
  getRecommendations: (employeeId) => 
    apiClient.get(`/ai/recommendations/${employeeId}`),
  getBurnoutAnalysis: () => apiClient.get('/ai/burnout-analysis'),
  getRewardFairnessAnalysis: () => apiClient.get('/ai/fairness-analysis'),
  chat: (message, employeeId = null) => apiClient.post('/ai/chat', { message, employeeId }),
}

export const reportService = {
  getEmployeeReport: (employeeId) =>
    apiClient.get(`/v2/reports/employee/${employeeId}`),
  getDepartmentReport: (department) =>
    apiClient.get(`/v2/reports/department/${department}`),
}
