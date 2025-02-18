import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FogIndexChart from "./FogIndexChart";
import "./css/FogIndexCalculator.css";

const FogIndexCalculator = () => {
  const location = useLocation();
  const { githubUrl } = location.state || {};

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGraph, setShowGraph] = useState(false); // Toggle graph

  useEffect(() => {
    if (githubUrl) {
      calculateFogIndex(githubUrl);
    }
  }, [githubUrl]);

  const formatGitHubZipUrl = (repoUrl) => {
    if (!repoUrl) return "";
    if (repoUrl.endsWith(".zip")) return repoUrl;
    return repoUrl.replace(/\.git$/, "").replace(/\/$/, "") + "/archive/main.zip";
  };

  const calculateFogIndex = async (url) => {
    try {
      setLoading(true);
      setError(null);
      const zipUrl = formatGitHubZipUrl(url); // Convert to ZIP URL

      const response = await fetch(
          `http://127.0.0.1:8080/api/fog-index/calculate?githubZipUrl=${encodeURIComponent(zipUrl)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError(error.message || "Failed to fetch the Fog Index");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fog-index-container">
      <h2>Fog Index Calculator</h2>

      {loading && <p>Calculating Fog Index...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <>
          {/* Table showing ALL values */}
          <table className="fog-index-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result).map(([key, value]) => (
                <tr key={key}>
                  <td>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="show-graph-button" onClick={() => setShowGraph(!showGraph)}>
            {showGraph ? "Hide Graph" : "Show Graph"}
          </button>

          {showGraph && (
            <div className="graph-container">
              <FogIndexChart data={result} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FogIndexCalculator;
