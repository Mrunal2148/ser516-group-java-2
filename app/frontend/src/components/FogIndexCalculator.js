import React, { useState } from "react";

const FogIndexCalculator = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const calculateFogIndex = () => {
    fetch(`http://127.0.0.1:5000/api/fog-index/calculate?githubZipUrl=${encodeURIComponent(githubUrl)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setResult(null);
        } else {
          setResult(data);
          setError(null);
        }
      })
      .catch((error) => {
        setError("Failed to fetch the Fog Index");
        setResult(null);
      });
  };

  return (
    <div>
      <h2>Fog Index Calculator</h2>
      <input
        type="text"
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
