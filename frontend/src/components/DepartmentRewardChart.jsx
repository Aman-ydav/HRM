import React, { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { Card } from './ui'
import { DEPARTMENTS } from '../constants/enums'

function DepartmentRewardChart({ rewards = [] }) {
  const chartData = useMemo(() => {
    // Group rewards by department
    const departmentData = {}
    
    Object.values(DEPARTMENTS).forEach(dept => {
      departmentData[dept.value] = {
        total: 0,
        count: 0,
        types: {},
      }
    })

    // Aggregate reward data
    rewards.forEach(reward => {
      const dept = reward.employeeId?.department || 'Unknown'
      if (departmentData[dept]) {
        departmentData[dept].count += 1
        departmentData[dept].total += reward.points || reward.bonus || 0

        const type = reward.rewardType || 'other'
        if (!departmentData[dept].types[type]) {
          departmentData[dept].types[type] = 0
        }
        departmentData[dept].types[type] += 1
      }
    })

    const departments = Object.values(DEPARTMENTS).map(d => d.label)
    const totals = Object.values(DEPARTMENTS).map(d => departmentData[d.value]?.count || 0)
    const colors = [
      'rgb(59, 130, 246)',  // blue
      'rgb(34, 197, 94)',   // green
      'rgb(236, 72, 153)',  // pink
      'rgb(249, 115, 22)',  // orange
      'rgb(147, 51, 234)',  // purple
      'rgb(217, 119, 6)',   // amber
    ]

    return {
      labels: departments,
      datasets: [
        {
          label: 'Rewards Given',
          data: totals,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('rgb', 'rgba').replace(')', ', 0.8)')),
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    }
  }, [rewards])

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#0f172a',
          font: { size: 12, weight: '600' },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#64748b',
          font: { size: 12 },
        },
        grid: {
          color: '#e2e8f0',
        },
      },
      x: {
        ticks: {
          color: '#64748b',
          font: { size: 12 },
        },
        grid: {
          color: '#e2e8f0',
        },
      },
    },
  }

  return (
    <Card>
      <h3 className="text-lg font-bold text-slate-900 mb-4">Rewards by Department</h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  )
}

export default DepartmentRewardChart
