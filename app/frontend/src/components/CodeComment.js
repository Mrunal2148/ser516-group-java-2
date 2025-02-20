import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import CoverageDashboard from "./CoverageDashboard";

import Benchmarks from "./Benchmarks"; 

import CoverageTrendChart from "./CoverageTrendChart"; 

import "../components/css/CodeComment.css";

export default function CodeComment() {
  const location = useLocation();
  const { githubUrl, metric } = location.state || {}; 
  const [coverage, setCoverage] = useState(null);
  const [selectedGraph, setSelectedGraph] = useState("");
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false); 


  useEffect(() => {
    if (!githubUrl) return;

    const analyzeCoverage = async () => {
      try {
        const response = await axios.post("http://localhost:5005/analyze", { repo_url: githubUrl });
        setCoverage(response.data.coverage);
      } catch (error) {
        console.error("Error analyzing repository:", error);
      }
    };

    const fetchCoverageHistory = async () => {
      try {
        const historyResponse = await axios.get("http://localhost:5005/get_coverage_data"); 
        const filteredData = historyResponse.data.filter((entry) => entry.repo_url === githubUrl);
        setCoverageHistory(filteredData);
      } catch (error) {
        console.error("Error fetching coverage history:", error);
      }
    };

    analyzeCoverage();
    fetchCoverageHistory();
  }, [githubUrl]);

  return (
    <div className="code-comment-container">
      <h2 className="code-comment-title">Code Comment Coverage</h2>
      <p className="code-comment-repo"><b>Repository:</b> {githubUrl}</p>



      {coverage !== null ? (
        <>
          <table className="code-comment-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Comment Coverage</td>
                <td>{coverage.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>


          <div className="chart-dropdown-container">
            <div className="dropdown-section">
              <select onChange={(e) => setSelectedGraph(e.target.value)} className="chart-select">
                <option value="">Select Graph Type</option>
                <option value="coverageGraph">Coverage Graph</option>
                <option value="placeholder1">Placeholder Chart 1</option>
                <option value="placeholder2">Placeholder Chart 2</option>
              </select>
            </div>
          </div>

          <div className="benchmark-section">
            <button 
              className="add-benchmark-button" 
              onClick={() => setShowBenchmarkModal(true)}
            >
              Add Benchmark
            </button>
          </div>


          {selectedGraph && (
            <div className="graph-container">
              {selectedGraph === "coverageGraph" && <CoverageDashboard selectedRepo={githubUrl} />}
              {selectedGraph === "coverageTrend" && <CoverageTrendChart data={coverageHistory} />}
              {selectedGraph === "placeholder" && <p>Placeholder for another chart.</p>}
            </div>
          )}

          {showBenchmarkModal && (
            <div className="benchmark-modal">
              <div className="benchmark-modal-content">
                <button className="close-modal" onClick={() => setShowBenchmarkModal(false)}>X</button>
                <Benchmarks githubUrl={githubUrl} selectedMetric={metric || "code-comment-coverage"} /> 
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="mt-4 text-lg">Analyzing coverage...</p>
      )}
    </div>
  );
}