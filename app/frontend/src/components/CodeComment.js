import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import CoverageDashboard from "./CoverageDashboard";
import "../components/css/CodeComment.css";

export default function CodeComment() {
  const location = useLocation();
  const { githubUrl } = location.state || {};
  const [coverage, setCoverage] = useState(null);
  const [selectedGraph, setSelectedGraph] = useState(""); // Selected chart type

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

    analyzeCoverage();
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

          {/* 📌 Dropdown for selecting chart */}
          <div className="chart-dropdown-container">
            <select onChange={(e) => setSelectedGraph(e.target.value)} className="chart-select">
              <option value="">Select Graph Type </option>
              <option value="coverageGraph">Coverage Graph</option>
              <option value="placeholder1">Placeholder Chart 1</option>
              <option value="placeholder2">Placeholder Chart 2</option>
            </select>
          </div>

          {/* 📌 Graph Rendering Section (OUTSIDE the dropdown) */}
          {selectedGraph && (
            <div className="graph-container">
              {selectedGraph === "coverageGraph" && <CoverageDashboard selectedRepo={githubUrl} />}
              {selectedGraph === "placeholder1" && <p>Placeholder for another chart.</p>}
              {selectedGraph === "placeholder2" && <p>Placeholder for yet another chart.</p>}
            </div>
          )}
        </>
      ) : (
        <p className="mt-4 text-lg">Analyzing coverage...</p>
      )}
    </div>
  );
}
