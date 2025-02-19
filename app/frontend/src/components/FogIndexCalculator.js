import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './css/Spinner.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FogIndexCalculator = () => {
  const location = useLocation();
  const { githubUrl } = location.state || {};

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showChart, setShowChart] = useState(false);

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

  const renderChart = () => {
    if (history.length === 0) return null;

    const data = {
      labels: history.map(item => new Date(item.generatedTime).toLocaleString()),
      datasets: [
        {
          label: "Fog Index",
          data: history.map(item => item.fogIndex),
          fill: false,
          borderColor: "blue",
        },
      ],
    };

    return <Line data={data} />;
  };

  return (
    <div className="fog-index-container">
      <h2>Fog Index Calculator</h2>

      {loading && <p>Calculating Fog Index...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div>
          <h3>Calculation Result:</h3>
          {renderTable()}
        </div>
      )}
      <div>
        <br/>
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
      <div>
        <br/>
        <button onClick={() => {
          setShowChart(!showChart);
          if (!showChart) {
            fetchHistory(githubUrl);
          }
        }}>
          {showChart ? "Hide" : "Generate"} Chart
        </button>
        {showChart && (
          <div>
            <h3>Fog Index Over Time</h3>
            {renderChart()}
          </div>
        )}
      </div>
    </div>
  );
};

export default FogIndexCalculator;
