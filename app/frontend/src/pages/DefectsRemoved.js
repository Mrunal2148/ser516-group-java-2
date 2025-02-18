import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DefectMetricsChart from "../components/DefectMetricsChart";
import "../components/css/DefectsRemoved.css"; 

const DefectsRemoved = () => {
  const location = useLocation();
  const { owner, repo } = location.state || {};

  const [bugStats, setBugStats] = useState(null);
  const [showGraph, setShowGraph] = useState(false); // Toggle state for graph
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!owner || !repo) {
      setError("No repository selected. Please select a valid repository.");
      return;
    }

    fetch(`http://localhost:8080/api/github/defects-stats?owner=${owner}&repo=${repo}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!data || Object.keys(data).length === 0) {
          setError("No defect data available for this repository.");
          return;
        }

        setBugStats(data);
        setError(null);
      })
      .catch((error) => setError(error.message));
  }, [owner, repo]);

  // Extract start and end weeks safely
  const startWeek =
    bugStats?.weeklyOpenedBugs && Object.keys(bugStats.weeklyOpenedBugs).length > 0
      ? `2024-Week-${Object.keys(bugStats.weeklyOpenedBugs)[0].split("-W")[1]}`
      : "N/A";

  const endWeek =
    bugStats?.weeklyClosedBugs && Object.keys(bugStats.weeklyClosedBugs).length > 0
      ? `2024-Week-${Object.keys(bugStats.weeklyClosedBugs).slice(-1)[0].split("-W")[1]}`
      : "N/A";

  return (
    <div className="defects-container">
      <h2>Defects Removed Metrics</h2>
      {error ? (
        <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
      ) : bugStats ? (
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
                <td>{bugStats.totalOpenedBugs || 0}</td>
                <td>{bugStats.totalClosedBugs || 0}</td>
                <td>{startWeek}</td>
                <td>{endWeek}</td>
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
