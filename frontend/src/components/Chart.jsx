import React, { memo } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

const CHART_MARGIN = { top: 20, right: 30, left: 0, bottom: 0 }

const SERIES = [
  { key: "stock", name: "Stock", stroke: "#6366f1" },
  { key: "demand", name: "Demand", stroke: "#22c55e" },
]

const EmptyState = ({ message = "No data available for chart." }) => (
  <p className="p-4 text-gray-500">{message}</p>
)

function Chart({ data = [], title = "Stock vs Demand Trend", height = 300, className = "" }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <EmptyState />
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow mb-6 w-full ${className}`} aria-label={title}>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={CHART_MARGIN}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.stroke}
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default memo(Chart)
export { Chart }
