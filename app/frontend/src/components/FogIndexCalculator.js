import React, { useState } from "react";

const FogIndexCalculator = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const calculateFogIndex = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8080/api/fog-index/calculate?githubZipUrl=${encodeURIComponent(githubUrl)}`,
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
      <button onClick={calculateFogIndex}>Calculate</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <div>
          <h3>Calculation Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FogIndexCalculator;
