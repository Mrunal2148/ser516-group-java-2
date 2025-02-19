import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import CoverageDashboard from "./CoverageDashboard";

export default function CodeComment() {
    const location = useLocation();
    const { githubUrl } = location.state || {};
    const [coverage, setCoverage] = useState(null);
    const [showGraph, setShowGraph] = useState(false);

    useEffect(() => {
        if (!githubUrl) return;

        const analyzeCoverage = async () => {
            try {
                const response = await axios.post("http://localhost:5005/analyze", { repo_url: githubUrl });
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
                <>
                    <p className="mt-4 text-lg">Comment Coverage: <b>{coverage.toFixed(2)}%</b></p>
                    <button 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setShowGraph(!showGraph)}
                    >
                        {showGraph ? "Hide Coverage Graph" : "Load Coverage Graph"}
                    </button>
                </>
            ) : (
                <p className="mt-4 text-lg">Analyzing coverage...</p>
            )}
            {showGraph && <CoverageDashboard selectedRepo={githubUrl} />}
        </div>
    );
}
