// src/PopulationChart.js

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function PopulationChart({ data }) {
  // Prepare chart data
  const chartData = [
    { name: 'White', value: parseFloat(data.nhwhi_p) || 0 },
    { name: 'Black', value: parseFloat(data.nhaa_p) || 0 },
    { name: 'Asian', value: parseFloat(data.nhas_p) || 0 },
    { name: 'Hispanic/Latino', value: parseFloat(data.lat_p) || 0 },
    { name: 'Other', value: parseFloat(data.nhoth_p) || 0 },
    { name: 'Multiracial', value: parseFloat(data.nhmlt_p) || 0 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4567'];

  return (
    <div>
      <h2>Population Breakdown by Race</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={chartData}
          dataKey='value'
          nameKey='name'
          cx='50%'
          cy='50%'
          outerRadius={100}
          label
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}

export default PopulationChart;