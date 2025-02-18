import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../components/css/DefectsRemoved.css";

const DefectsRemoved = () => {
  const location = useLocation();
  const { owner, repo } = location.state || {};

  const [bugStats, setBugStats] = useState(null);
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    if (!owner || !repo) return;

    fetch(`http://localhost:8080/api/github/defects-stats?owner=${owner}&repo=${repo}`)
      .then((response) => response.json())
      .then((data) => setBugStats(data))
      .catch((error) => console.error("Error fetching bug statistics:", error));
  }, [owner, repo]);
  const getStartAndEndDates = () => {
    if (!bugStats) return { startDate: "N/A", endDate: "N/A" };
  
    const allWeeks = Object.keys(bugStats.weeklyOpenedBugs || {});
    if (allWeeks.length === 0) return { startDate: "N/A", endDate: "N/A" };
  
    const sortedWeeks = allWeeks.sort();
    

    const formatWeek = (week) => week.replace("W", "Week-");
  
    return {
      startDate: formatWeek(sortedWeeks[0]),   
      endDate: formatWeek(sortedWeeks[sortedWeeks.length - 1]),
    };
  };

  const { startDate, endDate } = getStartAndEndDates();

  return (
    <div className="defects-container">
      <h2>Defects Removed Metrics</h2>

      {bugStats ? (
        <div>
          <table className="defects-table">
            <thead>
              <tr>
                <th>Total Opened Bugs</th>
                <th>Total Closed Bugs</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{bugStats.totalOpenedBugs}</td>
                <td>{bugStats.totalClosedBugs}</td>
                <td>{startDate}</td>
                <td>{endDate}</td>
              </tr>
            </tbody>
          </table>



        </div>
      ) : (
        <p>Loading bug statistics...</p>
      )}
    </div>
  );
};

export default DefectsRemoved;
