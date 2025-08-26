import classNames from "classnames";

function KpiCard({ title, value }) {
  const isPercentString = typeof value === "string" && value.endsWith("%");
  const valueNumber = isPercentString ? parseFloat(value.slice(0, -1)) : value;

  const valueClass = classNames({
    "text-red-900": isPercentString && valueNumber <= 50,
    "text-yellow-500": isPercentString && valueNumber > 50 && valueNumber < 90,
    "text-green-500": isPercentString && valueNumber >= 90,
    "text-gray-900": !isPercentString,
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

export default KpiCard;
