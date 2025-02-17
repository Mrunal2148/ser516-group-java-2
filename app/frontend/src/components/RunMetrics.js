import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";
import "./css/RunMetrics.css";

const RunMetrics = () => {
  const [links, setLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/links.json") // Ensure this path is correct
      .then((response) => response.json())
      .then((data) => setLinks(data))
      .catch((error) => console.error("Error fetching links:", error));
  }, []);

  const handleRun = () => {
    const fullLink = `${selectedLink}/archive/refs/heads/main.zip`;
    if (!selectedMetric) {
      alert("Please select a metric");
      return;
    }
    switch (selectedMetric) {
      case "fog-index":
        navigate("/fogindex", { state: { githubUrl: fullLink } });
        break;
      default:
        alert("Invalid metric");
        break;
    }
  };

  return (
    <div>
      <Dropdown onMetricSelect={setSelectedMetric}/>
      <label>Select Repository: </label>
      <select defaultValue="" onChange={(e) => setSelectedLink(e.target.value)}>
        <option value="" disabled>--Select--</option>
        {links.slice(1).map((link, index) => (
          <option key={index} value={link}>{link}</option>
        ))}
      </select>
      &nbsp; &nbsp;
      <button className="run-button" onClick={handleRun}>Run</button>
    </div>
  );
};

export default RunMetrics;
