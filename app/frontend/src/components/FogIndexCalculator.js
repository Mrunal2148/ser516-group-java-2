import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FogIndexChart from "./FogIndexChart";
import "./css/FogIndexCalculator.css";
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
  const [showGraph, setShowGraph] = useState(false);


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
      console.log("Fetching history for:", truncatedUrl);
 
      const response = await fetch(`http://127.0.0.1:8080/api/fog-index/history?repoUrl=${encodeURIComponent(truncatedUrl)}`);
     
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status} ${response.statusText}`);
      }
 
      const data = await response.json();
      console.log("Fetched history data:", data);
 
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


  const renderHistory = () => {
    if (!history || history.length === 0) return <p>No history available.</p>;

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
    if (history.length === 0) return <p>No history data available for chart.</p>;

    const historyData = history.map(item => ({
      time: new Date(item.generatedTime).toISOString(),
      value: item.fogIndex
    }));

    const benchmarkData = benchmarkHistory.map(item => ({
      time: new Date(item.time).toISOString(),
      value: item.value
    }));

    const labels = [...new Set([...historyData.map(item => item.time), ...benchmarkData.map(item => item.time)])].sort();
    if (labels.length === 0) return <p>No data available for chart.</p>;

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
      <div>
        <br/>
        <button onClick={() => {
          if (!showHistory) {
            fetchHistory(githubUrl);
            fetchBenchmarkHistory(githubUrl.replace("/archive/refs/heads/main.zip", ""), "fog-index");
          }
          setShowHistory(!showHistory);
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
          if (!showChart) {
            fetchHistory(githubUrl);
            fetchBenchmarkHistory(githubUrl.replace("/archive/refs/heads/main.zip", ""), "fog-index");
          }
          setShowChart(!showChart);
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
