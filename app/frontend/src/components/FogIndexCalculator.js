import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FogIndexChart from "../components/FogIndexChart";
import "./css/FogIndexCalculator.css";

const FogIndexCalculator = () => {
  const location = useLocation();
  const { githubUrl } = location.state || {};

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState("");

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
      const zipUrl = formatGitHubZipUrl(url);

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
      <h2 lassName="code-comment-title">Fog Index Calculator</h2>

      {githubUrl && (
        <p className="fog-index-repo">
          <b>Repository:</b> <a href={githubUrl} target="_blank" rel="noopener noreferrer">{githubUrl}</a>
        </p>
      )}

      {loading && <p>Calculating Fog Index...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <>
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
                  <td>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Styled Dropdown Button */}
          <div className="chart-dropdown-container">
            <select onChange={(e) => setSelectedGraph(e.target.value)} className="chart-select">
              <option value="">Select Graph Type</option>
              <option value="fogIndex">Fog Index Chart</option>
              <option value="placeholder1">Placeholder Chart 1</option>
              <option value="placeholder2">Placeholder Chart 2</option>
            </select>
          </div>

          {/* Render Selected Chart */}
          {selectedGraph === "fogIndex" && <FogIndexChart data={result} />}
          {selectedGraph === "placeholder1" && <p> Placeholder for another chart.</p>}
          {selectedGraph === "placeholder2" && <p> Placeholder for yet another chart.</p>}
        </>
      )}
    </div>
  );
};

export default FogIndexCalculator;
