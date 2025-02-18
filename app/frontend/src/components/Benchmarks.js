import React, { useState, useEffect } from "react";
import SelectDropdown from "./Dropdown";
import Tooltip from "@mui/material/Tooltip";
import "./css/RunMetrics.css";

const Benchmarks = () => {
  const [links, setLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const [benchmarkValue, setBenchmarkValue] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);


  useEffect(() => {
    fetch("http://127.0.0.1:5000/links.json")
      .then((response) => response.json())
      .then((data) => setLinks(data))
      .catch((error) => console.error("Error fetching links:", error));
  }, []);


  const handleSaveBenchmark = () => {
    const benchmarkData = {
        repoUrl: selectedLink,
        metric: selectedMetric,
        history: [
        {
            value: parseFloat(benchmarkValue),
            time: new Date().toISOString(),
        },
        ],
    };


    fetch("http://127.0.0.1:5000/save-benchmark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(benchmarkData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        alert("Benchmark saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving benchmark:", error);
      });
  };


  const handleBenchmarkValueChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setBenchmarkValue(value);
      setShowTooltip(false);
    } else {
      setShowTooltip(true);
    }
  };


  return (
    <div>
        <h1>Your Own Benchmarks!</h1>
        <div className="run-metrics-container">
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
        <br/>

        <div className="benchmark-input">
            <label>Benchmark Value: &nbsp; </label>
            <Tooltip title="Only numbers are allowed" open={showTooltip} arrow>
            <input
                type="text"
                value={benchmarkValue}
                onChange={handleBenchmarkValueChange}
            />
            </Tooltip>
        </div>
        <br/>

        <button
            className="run-button"
            onClick={handleSaveBenchmark}
            disabled={!selectedLink || !selectedMetric || !benchmarkValue}
        >
            Save Benchmark
        </button>
        </div>
    </div>

  );
};

export default Benchmarks;
