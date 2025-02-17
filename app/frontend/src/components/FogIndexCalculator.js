import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import './css/Spinner.css';

const FogIndexCalculator = () => {
  const location = useLocation();
  const [githubUrl, setGithubUrl] = useState(location.state?.githubUrl || "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (location.state?.githubUrl) {
      setGithubUrl(location.state.githubUrl);
      calculateFogIndex(location.state.githubUrl);
    }
  }, [location.state]);

  const calculateFogIndex = async (url) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://127.0.0.1:8080/api/fog-index/calculate?githubZipUrl=${encodeURIComponent(url)}`,
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
      setError(null);
    } catch (error) {
      setError(error.message || "Failed to fetch the Fog Index");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (url) => {
    try {
      const response = await fetch(`http://127.0.0.1:8080/api/fog-index/history?repoUrl=${encodeURIComponent(url)}`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const formatKey = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const renderTable = () => {
    if (!result) return null;

    const entries = Object.entries(result);
    const entriesToRender = entries.slice(0, -1); // Don't show 'message' key

    return (
      <table style={{ borderCollapse: 'collapse'}}>
        <tbody>
          {entriesToRender.map(([key, value], index) => (
            <tr key={key} style={{ borderBottom: '1px solid black' }}>
              <td style={{ padding: '8px', border: '1px solid black', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                {formatKey(key)}
              </td>
              <td style={{ padding: '8px', border: '1px solid black', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderHistory = () => {
    if (history.length === 0) return null;

    return (
      <table style={{ borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Fog Index</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, index) => (
            <tr key={index} style={{ borderBottom: '1px solid black' }}>
              <td style={{ padding: '8px', border: '1px solid black' }}>{new Date(entry.generatedTime).toLocaleString()}</td>
              <td style={{ padding: '8px', border: '1px solid black' }}>{entry.fogIndex}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <h2>Fog Index Calculator</h2>
      <input
        type="text"
        id="githubUrl"
        name="githubUrl"
        value={githubUrl}
        onChange={(e) => setGithubUrl(e.target.value)}
        placeholder="Enter GitHub repository URL"
      />
      {loading && 
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="spinner"/>
        <span>&nbsp; &nbsp; Calculating...</span>
      </div>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <div>
          <h3>Calculation Result:</h3>
          {renderTable()}
        </div>
      )}
      <div>
        <button onClick={() => {
          setShowHistory(!showHistory);
          if (!showHistory) {
            fetchHistory(githubUrl);
          }
        }}>
          {showHistory ? "Hide" : "See"} History
        </button>
        {showHistory && (
          <div>
            <h3>History</h3>
            {renderHistory()}
          </div>
        )}
      </div>
    </div>
  );
};

export default FogIndexCalculator;
