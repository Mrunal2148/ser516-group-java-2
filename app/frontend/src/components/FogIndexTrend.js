import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const TrendChart = ({ historyData }) => {
  const labels = [...new Set([...historyData.map(item => item.time)])].sort();


  const data = {
    labels: labels.map(label => new Date(label).toLocaleString()),
    datasets: [
      {
        label: "Fog Index",
        data: labels.map(label => {
          const item = historyData.find(d => d.time === label);
          return item ? item.value : null;
        }),
        fill: false,
        borderColor: "blue",
        spanGaps: true,
      },
    ],
  };


  return <Line data={data} />;
};


export default TrendChart;
