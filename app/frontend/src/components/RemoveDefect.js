import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DefectRemoval = () => {
    const location = useLocation();
    const [githubUrl, setGithubUrl] = useState(location.state?.githubUrl || "");
    const [bugStats, setBugStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Extract owner and repo safely from GitHub URL
    const extractOwnerRepo = (url) => {
        const parts = url.split("/");
        if (parts.length >= 5) {
            return { owner: parts[3], repo: parts[4] };
        }
        return { owner: "", repo: "" }; // Prevents errors in case of bad URLs
    };

    // Fetch bug statistics from backend
    const fetchBugStats = async (url) => {
        setLoading(true);
        setError(null);
        setBugStats(null);

        const { owner, repo } = extractOwnerRepo(url);

        if (!owner || !repo) {
            setError("Invalid GitHub repository URL. Please enter a valid URL.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/defects/${owner}/${repo}`);

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            setBugStats(data);
        } catch (err) {
            setError(err.message || "Failed to fetch bug statistics.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch data when the component mounts (if URL is provided)
    useEffect(() => {
        if (githubUrl) {
            fetchBugStats(githubUrl);
        }
    }, [githubUrl]);

    // Manual fetch on input submit
    const handleSubmit = (e) => {
        e.preventDefault();
        fetchBugStats(githubUrl);
    };

    return (
        <div>
            <h2>Defect Removal Metrics</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="Enter GitHub Repository URL (e.g. https://github.com/facebook/react)"
                    style={{ width: "60%" }}
                />
                <button type="submit" style={{ marginLeft: "10px" }}>
                    Fetch Data
                </button>
            </form>

            {loading && <p>Loading bug statistics...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {bugStats && (
                <div>
                    <h3>Total Bugs Opened: {bugStats.totalOpenedBugs}</h3>
                    <h3>Total Bugs Closed: {bugStats.totalClosedBugs}</h3>

                    <h3>Weekly Opened Bugs</h3>
                    <ul>
                        {Object.entries(bugStats.weeklyOpenedBugs).map(([week, count]) => (
                            <li key={week}>{week}: {count}</li>
                        ))}
                    </ul>

                    <h3>Weekly Closed Bugs</h3>
                    <ul>
                        {Object.entries(bugStats.weeklyClosedBugs).map(([week, count]) => (
                            <li key={week}>{week}: {count}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DefectRemoval;
