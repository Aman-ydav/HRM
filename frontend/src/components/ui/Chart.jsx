import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function Chart({ labels = [], datasets = [], options = {} }) {
  const data = {
    labels,
    datasets,
  }

  return (
    <div className="bg-white rounded p-4">
      <Bar data={data} options={options} />
    </div>
  )
}
