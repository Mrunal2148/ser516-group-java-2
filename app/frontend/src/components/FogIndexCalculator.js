import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import './css/Spinner.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FogIndexCalculator = () => {
  const location = useLocation();
  const [githubUrl, setGithubUrl] = useState(location.state?.githubUrl || "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [history, setHistory] = useState([]);
  const [benchmarkHistory, setBenchmarkHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showChart, setShowChart] = useState(false);

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
      const truncatedUrl = url.replace("/archive/refs/heads/main.zip", "");
      const response = await fetch(`http://127.0.0.1:8080/api/fog-index/history?repoUrl=${encodeURIComponent(truncatedUrl)}`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const fetchBenchmarkHistory = async (url, metric) => {
    try {
      const response = await fetch("http://127.0.0.1:5005/benchmarks.json");
      const data = await response.json();
      console.log("Fetched benchmark data:", data);
      const benchmark = data.find(b => b.repoUrl === url && b.metric === metric);
      if (benchmark) {
        console.log("Benchmark history:", benchmark.history);
        setBenchmarkHistory(benchmark.history);
      } else {
        console.log("No matching benchmark found");
      }
    } catch (error) {
      console.error("Error fetching benchmark history:", error);
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

    const historyData = history.map(item => ({
      time: new Date(item.generatedTime).toISOString(),
      value: item.fogIndex
    }));

    const benchmarkData = benchmarkHistory.map(item => ({
      time: new Date(item.time).toISOString(),
      value: item.value
    }));

    const labels = [...new Set([...historyData.map(item => item.time), ...benchmarkData.map(item => item.time)])].sort();

    const data = {
      labels: labels.map(label => new Date(label).toLocaleString()),
      datasets: [
        {
          label: "Fog Index",
          data: labels.map(label => {
            const item = historyData.find(d => d.time === label);
            return item ? item.value : null;
          }),
          fill: false,
          borderColor: "blue",
          spanGaps: true,
        },
        {
          label: "Benchmark Fog Index",
          data: labels.map(label => {
            const item = benchmarkData.find(d => d.time === label);
            return item ? item.value : null;
          }),
          fill: false,
          borderColor: "orange",
          spanGaps: true,
        },
      ],
    };

    return <Line data={data} />;
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
            fetchBenchmarkHistory(githubUrl.replace("/archive/refs/heads/main.zip", ""), "fog-index");
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
