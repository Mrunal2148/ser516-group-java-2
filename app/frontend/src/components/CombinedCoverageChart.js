import React from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const CombinedCoverageChart = ({ data, githubUrl, benchmarks }) => {


  if (!data || data.length === 0 || !benchmarks || benchmarks.length === 0) {

    return <p>No coverage or benchmark data available.</p>;
  }

  const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const repoBenchmarks = benchmarks.find((b) => b.repoUrl === githubUrl && b.metric === "code-comment-coverage");

  if (!repoBenchmarks || !Array.isArray(repoBenchmarks.history) || repoBenchmarks.history.length === 0) {

    return <p>No benchmark data available for this repository.</p>;
  }



  const benchmarkDataset = sortedData.map((entry, index, arr) => {
    let closestBenchmark = null;
    let minTimeDiff = Infinity;

    const coverageTime = new Date(entry.timestamp).getTime();

    repoBenchmarks.history.forEach((benchmark) => {
      if (!benchmark.time) return;

      const benchmarkTime = new Date(benchmark.time).getTime();
      const timeDiff = Math.abs(coverageTime - benchmarkTime);

      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestBenchmark = benchmark;
      }
    });


    if (!closestBenchmark && index > 0) {
      closestBenchmark = arr[index - 1].benchmark || null;
    }

    const benchmarkValue = closestBenchmark ? closestBenchmark.value : null;
    arr[index].benchmark = benchmarkValue; // Store for next iteration



    return benchmarkValue;
  });


  const chartData = {
    labels: sortedData.map((entry) => new Date(entry.timestamp).toLocaleString()),
    datasets: [
      {
        label: "Benchmark Coverage",
        data: benchmarkDataset,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
        borderDash: [5, 5],
        yAxisID: "y1",
        spanGaps: true,
      },
      {
        label: "Code Comment Coverage Over Time",
        data: sortedData.map((entry) => entry.coverage),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        fill: false,
        tension: 0.3,
        yAxisID: "y1",
      },
      {
        label: "Coverage as Bar Chart",
        data: sortedData.map((entry) => entry.coverage),
        backgroundColor: "rgba(82, 202, 157, 0.7)",
        yAxisID: "y2",
        type: "bar",
      },
    ],
  };


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14 },
          padding: 15,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Timestamp (UTC)",
          font: { size: 14, weight: "bold" },
        },
        ticks: {
          maxTicksLimit: 6,
          autoSkip: true,
        },
      },
      y1: {
        title: {
          display: true,
          text: "Coverage (%) & Benchmark Value", // ✅ Added Benchmark Reference
          font: { size: 14, weight: "bold" },
        },
        beginAtZero: true,
        position: "left",
      },
      y2: {
        title: {
          display: true,
          text: "Coverage (%) (Bar)",
          font: { size: 14, weight: "bold" },
        },
        beginAtZero: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
      <div style={{ height: "450px", width: "100%", padding: "20px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
          📊 Benchmark vs. Actual Coverage (Over Time)
        </h3>
        <p style={{ textAlign: "center", fontSize: "14px", color: "#555" }}>
          Note: All timestamps are in UTC.
        </p>
        <Line data={chartData} options={options} />
      </div>
  );

};

export default CombinedCoverageChart;
