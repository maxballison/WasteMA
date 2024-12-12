// src/PopulationChart.js

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography, Box } from '@mui/material';

function PopulationChart({ data }) {

  // Prepare chart data
  const chartData = [
    { name: 'White', value: parseFloat(parseFloat(data.nhwhi_p)?.toFixed(2)) || 0 },
    { name: 'Black', value: parseFloat(parseFloat(data.nhaa_p)?.toFixed(2)) || 0 },
    { name: 'Asian', value: parseFloat(parseFloat(data.nhas_p)?.toFixed(2)) || 0 },
    { name: 'Hispanic/Latino', value: parseFloat(parseFloat(data.lat_p)?.toFixed(2)) || 0 },
    { name: 'Other', value: parseFloat(parseFloat(data.nhoth_p)?.toFixed(2)) || 0 },
    { name: 'Multiracial', value: parseFloat(parseFloat(data.nhmlt_p)?.toFixed(2)) || 0 },
  ];
  function formatToMoney(number, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: currency 
    }).format(number);
  }

  const COLORS = [
    '#0085FF',
    '#FF7500',
    '#E42AFE',
    '#8F633D',
    '#406180',
    '#2C8F7E',
  ];
  console.log(data)

  return (
    <Box sx={{ marginBottom: 4 }}>
      <Typography variant="h5" gutterBottom>
        Demographics and Waste Management Summary for <strong>{data.Municipality}</strong> 
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
            animationDuration={700}
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
      </ResponsiveContainer>
      <Typography>Average Individual Yearly Income: <strong>{formatToMoney(parseInt(data['DOR Income Per Capita']))}</strong></Typography>
    </Box>
  );
}

export default PopulationChart;