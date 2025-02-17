import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function CodeComment() {
  const location = useLocation();
  const { githubUrl } = location.state || {};
  const [coverage, setCoverage] = useState(null);

  useEffect(() => {
    if (!githubUrl) return;

    const analyzeCoverage = async () => {
      try {
        const response = await axios.post("http://localhost:5001/analyze", { repo_url: githubUrl });
        setCoverage(response.data.coverage);
      } catch (error) {
        console.error("Error analyzing repository:", error);
      }
    };

    analyzeCoverage();
  }, [githubUrl]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Code Comment Coverage</h2>
      <p><b>Repository:</b> {githubUrl}</p>

      {coverage !== null ? (
        <p className="mt-4 text-lg">Comment Coverage: <b>{coverage.toFixed(2)}%</b></p>
      ) : (
        <p className="mt-4 text-lg">Analyzing coverage...</p>
      )}
    </div>
  );
}
