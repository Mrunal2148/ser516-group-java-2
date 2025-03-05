import React, { useEffect, useState } from "react";
import axios from "axios";
import CoverageChart from "./CoverageChart";
import CoverageTrendChart from "./CoverageTrendChart";
import CombinedCoverageChart from "./CombinedCoverageChart";

const CoverageDashboard = ({ selectedRepo, benchmarks }) => {
    const [chartData, setChartData] = useState([]);
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        if (!selectedRepo) return;

        axios.get("http://localhost:5006/get_coverage_data")
            .then(response => {
                const repoData = response.data.find(repo => repo.repo_url === selectedRepo);
                const history = response.data.filter(repo => repo.repo_url === selectedRepo);

                if (repoData) {
                    setChartData([
                        { name: "Total Lines", value: repoData.total_lines },
                        { name: "Comment Lines", value: repoData.comment_lines },
                        { name: "Coverage %", value: repoData.coverage },
                    ]);
                } else {
                    setChartData([]);
                }

                setHistoryData(history);
            })
            .catch(error => console.error("Error fetching coverage data:", error));
    }, [selectedRepo]);

    return (
        <div style={{ width: "100%", padding: "20px" }}>
            <h2>Code Comment Coverage Dashboard</h2>

            {chartData.length > 0 ? (
                <>
                    <CoverageChart chartData={chartData} />
                    <CoverageTrendChart data={historyData} />
                    <CombinedCoverageChart data={historyData} githubUrl={selectedRepo} benchmarks={benchmarks} />
                </>
            ) : (
                <p>No coverage data available for this repository.</p>
            )}
        </div>
    );
};

export default CoverageDashboard;
