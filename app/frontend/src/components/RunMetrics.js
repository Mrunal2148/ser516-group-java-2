import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SelectDropdown from "./Dropdown";
import "./css/RunMetrics.css";

const RunMetrics = () => {
  const [links, setLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/links.json")
      .then((response) => response.json())
      .then((data) => setLinks(data))
      .catch((error) => console.error("Error fetching links:", error));
  }, []);

  const handleRun = () => {
    if (!selectedLink || !selectedMetric) return;

    const fullLink = `${selectedLink}/archive/refs/heads/main.zip`;

    switch (selectedMetric) {
      case "fog-index":
        navigate("/fogindex", { state: { githubUrl: fullLink } });
        break;
      case "code-comment-coverage":
        navigate("/codecommentcoverage", { state: { githubUrl: fullLink } });
        break;
      case "defects-removed":
        navigate("/defectsremoved", { state: { githubUrl: fullLink } });
        break;
      default:
        alert("Invalid metric");
        break;
    }
  };

  return (
    <div className="run-metrics-container">
      {/* Select Repository */}
      <SelectDropdown
        label="Select Repository"
        options={links.slice(1).map((link) => ({ label: link, value: link }))}
        selectedValue={selectedLink}
        onSelect={setSelectedLink}
      />

  
      <SelectDropdown
        label="Select Metric"
        options={[
          { label: "Fog Index", value: "fog-index" },
          { label: "Code Comment Coverage", value: "code-comment-coverage" },
          { label: "Defects Removed", value: "defects-removed" },
        ]}
        selectedValue={selectedMetric}
        onSelect={setSelectedMetric}
      />

      {/* Run Button - Enabled only when both fields are selected */}
      <button 
        className="run-button" 
        onClick={handleRun} 
        disabled={!selectedLink || !selectedMetric}
      >
        Run
      </button>
    </div>
  );
};

export default RunMetrics;
