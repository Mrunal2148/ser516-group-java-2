import React, { useEffect, useState } from "react";
import axios from "axios";
import RepoDropdown from "./RepoDropdown";
import CoverageChart from "./CoverageChart";

const CoverageDashboard = () => {
    const [repositories, setRepositories] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [chartData, setChartData] = useState([]);

    // Fetch stored repository data from Flask
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:5001/get_coverage_data");
                setRepositories(response.data);
                if (response.data.length > 0) {
                    setSelectedRepo(response.data[0].repo_url);
                }
            } catch (error) {
                console.error("Error fetching repository data:", error);
            }
        };

        fetchData();
    }, []);

    // Update chart data when a repo is selected
    useEffect(() => {
        if (selectedRepo) {
            const repoData = repositories.find(repo => repo.repo_url === selectedRepo);
            if (repoData) {
                setChartData([
                    { name: "Total Lines", value: repoData.total_lines },
                    { name: "Comment Lines", value: repoData.comment_lines },
                    { name: "Coverage %", value: repoData.coverage },
                ]);
            }
        }
    }, [selectedRepo, repositories]);

    return (
        <div style={{ width: "100%", padding: "20px" }}>
            <h2>Code Comment Coverage Dashboard</h2>

            <RepoDropdown 
                repositories={repositories} 
                selectedRepo={selectedRepo} 
                setSelectedRepo={setSelectedRepo} 
            />

            {chartData.length > 0 ? (
                <CoverageChart chartData={chartData} />
            ) : (
                <p>No data available.</p>
            )}
        </div>
    );
};

export default CoverageDashboard;
