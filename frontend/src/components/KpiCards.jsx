import React from "react"
import cn from "classnames"

function KpiCard({ title, value }) {
  const isPercent = typeof value === "string" && value.trim().endsWith("%")
  const numericValue = isPercent ? parseFloat(value) : null

  const valueClass = cn("text-3xl font-bold", {
    "text-red-900": isPercent && numericValue <= 50,
    "text-yellow-500": isPercent && numericValue > 50 && numericValue < 90,
    "text-green-500": isPercent && numericValue >= 90,
    "text-gray-900": !isPercent,
  })

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
      <p className={valueClass}>{value}</p>
    </div>
  )
}

export default KpiCard
export { KpiCard }
