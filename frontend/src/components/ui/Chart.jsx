import React from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend)

export default function Chart({ labels = [], datasets = [], options = {}, type = 'bar' }) {
  const data = {
    labels,
    datasets,
  }

  const ChartComponent = type === 'line' ? Line : type === 'doughnut' ? Doughnut : Bar

  return (
    <div className="bg-white rounded p-4">
      <ChartComponent data={data} options={options} />
    </div>
  )
}
