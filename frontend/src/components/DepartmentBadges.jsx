import React from 'react'
import { Card, Badge } from './ui'
import { BADGE_DETAILS, DEPARTMENTS } from '../constants/enums'

function DepartmentBadges() {
  const departmentGroups = {}

  // Group badges by department
  Object.entries(BADGE_DETAILS).forEach(([key, badge]) => {
    const dept = badge.department || 'All'
    if (!departmentGroups[dept]) {
      departmentGroups[dept] = []
    }
    departmentGroups[dept].push({ key, ...badge })
  })

  const getDepartmentColor = (deptName) => {
    const dept = Object.values(DEPARTMENTS).find(d => d.label === deptName)
    return dept?.color || 'slate'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Department Badges & Recognition</h2>
        <p className="text-slate-600 mb-6">Professional badges for employee recognition across departments</p>
      </div>

      {Object.entries(departmentGroups).map(([dept, badges]) => (
        <div key={dept} className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">
            {dept === 'All' ? '🌟 All Departments' : `${getDepartmentColor(dept) ? '📍' : ''} ${dept}`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <Card key={badge.key} className="hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{badge.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">{badge.name}</h4>
                    <p className="text-sm text-slate-600 mb-2">{badge.description}</p>
                    {badge.department !== 'All' && (
                      <Badge variant={getDepartmentColor(badge.department)}>
                        {badge.department}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Card className="bg-slate-50 border-2 border-orange-200">
        <h3 className="text-lg font-bold text-slate-900 mb-3">How Badges Work</h3>
        <ul className="space-y-2 text-slate-700">
          <li>✅ Badges are awarded for exceptional performance and achievements</li>
          <li>✅ Multiple badges can be awarded to the same employee</li>
          <li>✅ Badges appear in employee profiles and leaderboards</li>
          <li>✅ Department-specific badges recognize specialized excellence</li>
          <li>✅ All-department badges recognize universal qualities</li>
        </ul>
      </Card>
    </div>
  )
}

export default DepartmentBadges
