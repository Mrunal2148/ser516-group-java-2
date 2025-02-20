import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../components/css/DefectsRemoved.css";
import DefectMetricsChart from "../components/DefectMetricsChart";
import DefectTrendChart from "../components/DefectTrendChart";

const DefectsRemoved = () => {
  const location = useLocation();
  const { owner, repo } = location.state || {};

  const [bugStats, setBugStats] = useState(null);
  const [error, setError] = useState(null);
  const [selectedGraph, setSelectedGraph] = useState("");

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


  // DUMMY DATA CALL.
  //   useEffect(() => {
  //       // Dummy Data for Testing
  //       const dummyData = {
  //           weeklyClosedBugs: {
  //               "2024-W01": 5,
  //               "2024-W02": 8,
  //               "2024-W03": 2,
  //               "2024-W04": 4,
  //               "2024-W05": 6
  //           },
  //           weeklyOpenedBugs: {
  //               "2024-W01": 6,
  //               "2024-W02": 4,
  //               "2024-W03": 8,
  //               "2024-W04": 5,
  //               "2024-W05": 3
  //           },
  //           totalOpenedBugs: 26,
  //           totalClosedBugs: 25
  //       };
  //
  //       // Simulate API Call
  //       setTimeout(() => {
  //           setBugStats(dummyData);
  //           setError(null);
  //       }, 500);  // Simulate delay
  //   }, []);


  const sortWeeks = (weeks) => {
    return weeks
        .map((week) => {
          const [year, weekNum] = week.split("-W").map(Number);
          return { week, year, weekNum };
        })
        .sort((a, b) => a.year - b.year || a.weekNum - b.weekNum)
        .map((obj) => obj.week);
  };

  const sortedOpenedWeeks =
      bugStats?.weeklyOpenedBugs ? sortWeeks(Object.keys(bugStats.weeklyOpenedBugs)) : [];
  const sortedClosedWeeks =
      bugStats?.weeklyClosedBugs ? sortWeeks(Object.keys(bugStats.weeklyClosedBugs)) : [];

  const startWeek = sortedOpenedWeeks.length > 0 ? sortedOpenedWeeks[0] : "N/A";
  const endWeek = sortedClosedWeeks.length > 0 ? sortedClosedWeeks[sortedClosedWeeks.length - 1] : "N/A";

  return (
      <div className="defects-container">
        <h2 className="code-comment-title">Defects Removed Metrics</h2>

        <p className="code-comment-repo"><b>Repository:</b> <a href={`https://github.com/${owner}/${repo}`} target="_blank" rel="noopener noreferrer">{owner}/{repo}</a></p>

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

              <div className="chart-dropdown-container">
                <select onChange={(e) => setSelectedGraph(e.target.value)} className="chart-select">
                  <option value="">Select Graph Type</option>
                  <option value="defectMetrics">Defect Metrics Chart</option>
                  <option value="defectTrend">Defect Trend Over Time</option>
                  <option value="placeholder1">Placeholder Chart 1</option>
                  <option value="placeholder2">Placeholder Chart 2</option>
                </select>
              </div>

              {selectedGraph === "defectMetrics" && (
                  <div className="graph-container">
                    <DefectMetricsChart data={bugStats} />
                  </div>
              )}
              {selectedGraph === "defectTrend" && (
                  <div className="graph-container">
                    <DefectTrendChart data={bugStats} />
                  </div>
              )}
              {selectedGraph === "placeholder1" && <p>Placeholder for another chart.</p>}
              {selectedGraph === "placeholder2" && <p> Placeholder for yet another chart.</p>}
            </>
        ) : (
            <p>Loading bug statistics...</p>
        )}
      </div>
  );
};

export default DefectsRemoved;

