import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import './css/Spinner.css';

const FogIndexCalculator = () => {
  const location = useLocation();
  const [githubUrl, setGithubUrl] = useState(location.state?.githubUrl || "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    if (location.state?.githubUrl) {
      setGithubUrl(location.state.githubUrl);
      calculateFogIndex(location.state.githubUrl);
    }
  }, [location.state]);

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
      setError(null);
    } catch (error) {
      setError(error.message || "Failed to fetch the Fog Index");
      setResult(null);
    } finally {
      setLoading(false);
    }
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
        <button onClick={() => calculateFogIndex(githubUrl)}>Calculate</button>

        {loading && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="spinner" />
              <span>&nbsp; &nbsp; Calculating...</span>
            </div>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {result && (
            <div>
              <h3>Calculation Result:</h3>
              <table style={{ borderCollapse: 'collapse' }}>
                <tbody>
                {Object.entries(result).map(([key, value]) => (
                    <tr key={key} style={{ borderBottom: '1px solid black' }}>
                      <td style={{ padding: '8px', border: '1px solid black' }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid black' }}>{value}</td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
  );
};

export default FogIndexCalculator;
