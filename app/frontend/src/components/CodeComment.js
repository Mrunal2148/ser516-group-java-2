import { useState } from "react";
import axios from "axios";

export default function CodeCoverage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [coverage, setCoverage] = useState(null);

  const handleAnalyze = async () => {
    if (!repoUrl) return alert("Please enter a GitHub repository URL");

    try {
      const response = await axios.post("http://localhost:5001/analyze", { repo_url: repoUrl });
      setCoverage(response.data.coverage);
    } catch (error) {
      console.error("Error analyzing repository:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">GitHub Code Comment Coverage</h2>
      <input 
        type="text" 
        placeholder="Enter GitHub repo URL..." 
        value={repoUrl} 
        onChange={(e) => setRepoUrl(e.target.value)}
        className="border p-2 w-full mb-2"
      />
      <button onClick={handleAnalyze} className="bg-blue-500 text-white px-4 py-2 rounded">
        Analyze
      </button>
      {coverage !== null && (
        <p className="mt-4 text-lg">Comment Coverage: <b>{coverage.toFixed(2)}%</b></p>
      )}
    </div>
  );
}
