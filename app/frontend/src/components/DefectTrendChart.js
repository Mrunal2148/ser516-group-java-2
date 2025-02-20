import React from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const DefectTrendChart = ({ data }) => {
    if (!data || Object.keys(data).length === 0) {
        return <p>No defect data available for trend analysis.</p>;
    }

    // Sort weeks numerically
    const sortWeeks = (weeks) => {
        return weeks
            .map((week) => {
                const [year, weekNum] = week.split("-W").map(Number);
                return { week, year, weekNum };
            })
            .sort((a, b) => a.year - b.year || a.weekNum - b.weekNum)
            .map((obj) => obj.week);
    };

    // Sort weeks for labels
    const sortedWeeks = sortWeeks(Object.keys(data.weeklyClosedBugs));

    const chartData = {
        labels: sortedWeeks,
        datasets: [
            {
                label: "Bugs Closed Over Time",
                data: sortedWeeks.map((week) => data.weeklyClosedBugs[week] || 0),
                borderColor: "#28a745",
                backgroundColor: "rgba(40, 167, 69, 0.5)",
                fill: true,
                tension: 0.3,
            },
            {
                label: "Bugs Opened Over Time",
                data: sortedWeeks.map((week) => data.weeklyOpenedBugs[week] || 0),
                borderColor: "#dc3545",
                backgroundColor: "rgba(220, 53, 69, 0.5)",
                fill: true,
                tension: 0.3,
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
                    text: "Weeks",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Number of Bugs",
                },
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ height: "400px", width: "100%" }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default DefectTrendChart;
