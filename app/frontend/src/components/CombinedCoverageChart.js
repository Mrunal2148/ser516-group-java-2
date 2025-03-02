import React from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const CombinedCoverageChart = ({ data, githubUrl, benchmarks }) => {
  if (!data || data.length === 0 || !benchmarks || benchmarks.length === 0) {
    return <p>No coverage or benchmark data available.</p>;
  }

  // Sort historical coverage data by timestamp
  const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Extract the latest benchmark (assuming user-defined)
  const latestBenchmark = benchmarks[benchmarks.length - 1]?.value || 0;

  const chartData = {
    labels: sortedData.map((entry) =>
        new Date(entry.timestamp).toUTCString()
    ),
    datasets: [
      {
        label: "Code Comment Coverage Over Time",
        data: sortedData.map((entry) => entry.coverage),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        fill: false,
        tension: 0.3,
      },
      {
        label: `User-Selected Benchmark (${latestBenchmark}%)`,
        data: Array(sortedData.length).fill(latestBenchmark),
        borderColor: "orange",
        backgroundColor: "rgba(255, 165, 0, 0.3)",
        fill: false,
        borderDash: [5, 5],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Timestamp (UTC)"
        },
        ticks: {
          maxTicksLimit: 6,
        },
      },
      y: {
        title: {
          display: true,
          text: "Coverage (%)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
      <div style={{ height: "450px", width: "100%" }}>
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
          Code Comment Coverage vs. User-Selected Benchmark
        </h3>
        <p style={{ textAlign: "center", fontSize: "14px", color: "#555" }}>
          Note: All timestamps are in UTC.
        </p>
        <Line data={chartData} options={options} />
      </div>
  );
};

export default CombinedCoverageChart;
