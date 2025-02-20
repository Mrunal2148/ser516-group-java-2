import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";

const DefectsHistoryPercentageTrend = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/github/defects-history")
            .then((response) => setData(response.data))
            .catch((error) => console.error("Error fetching defect history:", error));
    }, []);

    if (!data || data.length === 0) {
        return <p>No historical defect data available.</p>;
    }

    // Sort by timestamp to ensure chronological order
    const sortedData = [...data].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Prepare labels and data for the chart
    const labels = sortedData.map((entry) =>
        new Date(entry.timestamp).toLocaleDateString()
    );
    const percentageClosed = sortedData.map(
        (entry) => entry.percentage_bugs_closed
    );

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Percentage Bugs Closed Over Time",
                data: percentageClosed,
                borderColor: "#007bff",
                backgroundColor: "rgba(0, 123, 255, 0.5)",
                fill: true,
                tension: 0.3, // Smooth line
                pointRadius: 3,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
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
                    text: "Time",
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Percentage Bugs Closed (%)",
                },
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 10,
                },
            },
        },
    };

    return (
        <div style={{ height: "400px", width: "100%" }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default DefectsHistoryPercentageTrend;
