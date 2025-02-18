import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DefectMetricsChart from "../components/DefectMetricsChart";
import "../components/css/DefectsRemoved.css"; 

const DefectsRemoved = () => {
  const location = useLocation();
  const { owner, repo } = location.state || {};

  const [bugStats, setBugStats] = useState(null);
  const [showGraph, setShowGraph] = useState(false); // Toggle state for graph

  useEffect(() => {
    if (!owner || !repo) return;

    fetch(`http://localhost:8080/api/github/defects-stats?owner=${owner}&repo=${repo}`)
      .then((response) => response.json())
      .then((data) => setBugStats(data))
      .catch((error) => console.error("Error fetching bug statistics:", error));
  }, [owner, repo]);

  return (
    <div className="defects-container">
      <h2>Defects Removed Metrics</h2>
      {bugStats ? (
        <>
          <table className="defects-table">
            <thead>
              <tr>
                <th>Total Opened Bugs</th>
                <th>Total Closed Bugs</th>
                <th>Start Week</th>
                <th>End Week</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{bugStats.totalOpenedBugs}</td>
                <td>{bugStats.totalClosedBugs}</td>
                <td>
                  {bugStats.weeklyOpenedBugs
                    ? `2024-Week-${Object.keys(bugStats.weeklyOpenedBugs)[0].split("-W")[1]}`
                    : "N/A"}
                </td>
                <td>
                  {bugStats.weeklyClosedBugs
                    ? `2024-Week-${Object.keys(bugStats.weeklyClosedBugs).slice(-1)[0].split("-W")[1]}`
                    : "N/A"}
                </td>
              </tr>
            </tbody>
          </table>

          <button className="show-graph-button" onClick={() => setShowGraph(!showGraph)}>
            {showGraph ? "Hide Graph" : "Show Graph"}
          </button>

          {showGraph && (
            <div className="graph-container">
              <DefectMetricsChart data={bugStats} />
            </div>
          )}
        </>
      ) : (
        <p>Loading bug statistics...</p>
      )}
    </div>
  );
};

export default DefectsRemoved;
