import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import axios from "axios";

const DefectsHistoryPercentageTrend = ({ githubUrl }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        if (!githubUrl) return; // Ensure the repo URL is available before fetching

        axios
            .get("http://localhost:8080/api/github/defects-history")
            .then((response) => {
                // Extract repo name from URL
                const repoName = githubUrl.split("/").pop();

                // Filter data to match repo name
                const filteredData = response.data.filter(entry => entry.repo_url.toLowerCase() === repoName.toLowerCase());
                setData(filteredData);
            })
            .catch((error) => console.error("Error fetching defect history:", error));
    }, [githubUrl]);

    if (!githubUrl) {
        return <p style={{ color: "red", fontWeight: "bold" }}>No repository selected.</p>;
    }

    if (!data || data.length === 0) {
        return <p>No historical defect data available for <b>{githubUrl}</b>.</p>;
    }

    // Sort data chronologically
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Prepare labels (timestamps) and dataset (percentage closed)
    const labels = sortedData.map(entry =>
        new Date(entry.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    );
    const percentageClosed = sortedData.map(entry => entry.percentage_bugs_closed);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Defects Closed (%)",
                data: percentageClosed,
                borderColor: "#007bff",
                backgroundColor: "rgba(0, 123, 255, 0.2)",
                fill: true,
                tension: 0.4, // Smoother curve
                borderWidth: 3, // Thicker line
                pointRadius: 5,
                pointBackgroundColor: "#007bff",
                pointBorderWidth: 2,
                pointHoverRadius: 7,
            },
        ],
    };
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    color: "#333",
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                },
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleFont: { size: 14, weight: "bold" },
                bodyFont: { size: 13 },
                bodySpacing: 6,
                padding: 10,
                displayColors: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Timestamp",
                    font: { size: 14, weight: "bold" },
                },
                ticks: {
                    color: "#555",
                    font: { size: 12 },
                    maxRotation: 30,
                    minRotation: 30,
                    autoSkip: true,
                    maxTicksLimit: 8, 
                },
                grid: {
                    display: true,
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Percentage Bugs Closed (%)",
                    font: { size: 14, weight: "bold" },
                },
                ticks: {
                    color: "#555",
                    font: { size: 12 },
                    stepSize: 10,  // ✅ Forces 10, 20, 30, ..., 100 intervals
                    beginAtZero: true,
                    min: 0,  // ✅ Forces Y-axis to start at 0
                    max: 100,  // ✅ Forces Y-axis to always go up to 100
                    callback: function(value) {
                        return value + "%"; // ✅ Adds % symbol to Y-axis labels
                    }
                },
                grid: {
                    color: "rgba(200, 200, 200, 0.3)",
                },
            },
        },
    };
    
    

    return (
        <div className="defects-trend-container">

            <div className="graph-container">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default DefectsHistoryPercentageTrend;
