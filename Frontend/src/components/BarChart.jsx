import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.priceRange),
    datasets: [{
      label: 'Number of Items',
      data: data.map(item => item.count),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2
    }]
  };


  return (
    <div className="w-full">
      <h2 className="font-bold text-center">Price Range Distribution</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default BarChart;
