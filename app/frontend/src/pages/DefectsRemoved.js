import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../components/css/DefectsRemoved.css";

const DefectsRemoved = () => {
  const location = useLocation();
  const { owner, repo } = location.state || {};

  const [bugStats, setBugStats] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
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

  // Function to sort weeks numerically by year first, then week number
  const sortWeeks = (weeks) => {
    return weeks
        .map((week) => {
          const [year, weekNum] = week.split("-W").map(Number);
          return { week, year, weekNum };
        })
        .sort((a, b) => a.year - b.year || a.weekNum - b.weekNum)
        .map((obj) => obj.week);
  };

  // Sort weeks before extracting start/end weeks
  const sortedOpenedWeeks =
      bugStats?.weeklyOpenedBugs ? sortWeeks(Object.keys(bugStats.weeklyOpenedBugs)) : [];
  const sortedClosedWeeks =
      bugStats?.weeklyClosedBugs ? sortWeeks(Object.keys(bugStats.weeklyClosedBugs)) : [];

  const startWeek = sortedOpenedWeeks.length > 0 ? sortedOpenedWeeks[0] : "N/A";
  const endWeek = sortedClosedWeeks.length > 0 ? sortedClosedWeeks[sortedClosedWeeks.length - 1] : "N/A";

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

