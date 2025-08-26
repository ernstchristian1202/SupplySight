import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function Chart({ data }) {
  if (!data.length) return <p className="p-4 text-gray-500">No data available for chart.</p>;
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Stock vs Demand Trend</h2>
      <LineChart width={1200} height={300} data={data} className='w-full!'>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="stock" stroke="#8884d8" name="Stock" />
        <Line type="monotone" dataKey="demand" stroke="#82ca9d" name="Demand" />
      </LineChart>
    </div>
  );
}

export default Chart;