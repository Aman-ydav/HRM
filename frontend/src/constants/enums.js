/**
 * Reward Types Enum
 * Professional reward categories with descriptions
 */
export const REWARD_TYPES = {
  POINTS: {
    value: 'points',
    label: 'Reward Points',
    description: 'Accumulate points for achievements',
    color: 'orange',
    icon: '⭐',
  },
  BONUS: {
    value: 'bonus',
    label: 'Cash Bonus',
    description: 'Monetary rewards for performance',
    color: 'green',
    icon: '💰',
  },
  BADGE: {
    value: 'badge',
    label: 'Achievement Badge',
    description: 'Recognition badges for special achievements',
    color: 'purple',
    icon: '🏅',
  },
  EMPLOYEE_OF_MONTH: {
    value: 'employee_of_month',
    label: 'Employee of Month',
    description: 'Monthly recognition for top performers',
    color: 'blue',
    icon: '👑',
  },
  CERTIFICATE: {
    value: 'certificate',
    label: 'Certificate',
    description: 'Professional development certificate',
    color: 'indigo',
    icon: '📜',
  },
  PROMOTION: {
    value: 'promotion',
    label: 'Promotion',
    description: 'Career advancement opportunity',
    color: 'rose',
    icon: '🚀',
  },
  FLEXIBLE_TIME: {
    value: 'flexible_time',
    label: 'Flexible Schedule',
    description: 'Extra flexibility in work hours',
    color: 'cyan',
    icon: '⏰',
  },
  LEARNING_BUDGET: {
    value: 'learning_budget',
    label: 'Learning Budget',
    description: 'Budget for professional development courses',
    color: 'amber',
    icon: '📚',
  },
}

export const DEPARTMENTS = {
  ENGINEERING: {
    value: 'Engineering',
    label: 'Engineering',
    color: 'blue',
    icon: '⚙️',
  },
  SALES: {
    value: 'Sales',
    label: 'Sales',
    color: 'green',
    icon: '📊',
  },
  MARKETING: {
    value: 'Marketing',
    label: 'Marketing',
    color: 'pink',
    icon: '📢',
  },
  OPERATIONS: {
    value: 'Operations',
    label: 'Operations',
    color: 'orange',
    icon: '🏭',
  },
  HUMAN_RESOURCES: {
    value: 'Human Resources',
    label: 'HR',
    color: 'purple',
    icon: '👥',
  },
  FINANCE: {
    value: 'Finance',
    label: 'Finance',
    color: 'amber',
    icon: '💼',
  },
}

export const FEEDBACK_CATEGORIES = {
  WORK_QUALITY: {
    value: 'work_quality',
    label: 'Work Quality',
  },
  COLLABORATION: {
    value: 'collaboration',
    label: 'Collaboration',
  },
  COMMUNICATION: {
    value: 'communication',
    label: 'Communication',
  },
  ATTENDANCE: {
    value: 'attendance',
    label: 'Attendance',
  },
  LEADERSHIP: {
    value: 'leadership',
    label: 'Leadership',
  },
  OTHER: {
    value: 'other',
    label: 'Other',
  },
}

export const BADGE_DETAILS = {
  EXCELLENCE: {
    name: 'Excellence',
    description: 'Outstanding performance and dedication',
    icon: '⭐',
    department: 'Engineering',
    color: 'yellow',
  },
  TEAMWORK: {
    name: 'Teamwork',
    description: 'Excellent collaboration with team members',
    icon: '🤝',
    department: 'All',
    color: 'blue',
  },
  INNOVATION: {
    name: 'Innovation',
    description: 'Creative solutions and new ideas',
    icon: '💡',
    department: 'Engineering',
    color: 'purple',
  },
  CUSTOMER_FOCUS: {
    name: 'Customer Focus',
    description: 'Exceptional customer service',
    icon: '👤',
    department: 'Sales',
    color: 'green',
  },
  LEADERSHIP: {
    name: 'Leadership',
    description: 'Strong leadership qualities',
    icon: '👑',
    department: 'All',
    color: 'red',
  },
  GROWTH: {
    name: 'Growth',
    description: 'Continuous learning and development',
    icon: '📈',
    department: 'All',
    color: 'green',
  },
  RELIABILITY: {
    name: 'Reliability',
    description: 'Consistent and dependable work',
    icon: '✅',
    department: 'Operations',
    color: 'cyan',
  },
  CREATIVITY: {
    name: 'Creativity',
    description: 'Creative thinking and approaches',
    icon: '🎨',
    department: 'Marketing',
    color: 'pink',
  },
}

export const getRewardTypeLabel = (value) => {
  const reward = Object.values(REWARD_TYPES).find(r => r.value === value)
  return reward?.label || value
}

export const getDepartmentLabel = (value) => {
  const dept = Object.values(DEPARTMENTS).find(d => d.value === value)
  return dept?.label || value
}

export const getRewardTypeColor = (value) => {
  const reward = Object.values(REWARD_TYPES).find(r => r.value === value)
  return reward?.color || 'default'
}

export const getDepartmentColor = (value) => {
  const dept = Object.values(DEPARTMENTS).find(d => d.value === value)
  return dept?.color || 'default'
}
