import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.category),
    datasets: [{
      data: data.map(item => item.count),
      backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A6'],
      borderWidth: 1
    }]
  };

  return (
    <div className="w-92">
      <h2 className="font-bold text-center">Category Distribution</h2>
      <Pie data={chartData} />
    </div>
  );
};

export default PieChart;
