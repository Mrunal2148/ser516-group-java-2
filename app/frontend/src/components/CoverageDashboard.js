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

        const fetchCoverageData = async () => {
            try {
                const response = await axios.get("http://localhost:5005/get_coverage_data");
                const normalizeUrl = (url) => url.trim().replace(/\/$/, "").toLowerCase();
                const normalizedSelectedRepo = normalizeUrl(selectedRepo);
                const repoData = response.data.find(repo => 
                    normalizeUrl(repo.repo_url) === normalizedSelectedRepo
                );
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
            } catch (error) {
                console.error("Error fetching coverage data:", error);
            }
        };

        fetchCoverageData();
    }, [selectedRepo]);

    return (
        <div style={{ width: "100%", padding: "20px" }}>
            <h2>Code Comment Coverage Dashboard</h2>

            {chartData.length > 0 ? (
                <>
                    {/* ✅ 1st Graph: Coverage Overview (Bar Chart) */}
                    <CoverageChart chartData={chartData} />

                    {/* ✅ 2nd Graph: Coverage Trend (Line Chart) */}
                    <CoverageTrendChart data={historyData} />

                    {/* ✅ 3rd Graph: Coverage vs. Benchmark (Dual-Line Chart) */}
                    <CombinedCoverageChart data={historyData} githubUrl={selectedRepo} benchmarks={benchmarks} />
                </>
            ) : (
                <p>No coverage data available for this repository.</p>
            )}
        </div>
    );
};

export default CoverageDashboard;
