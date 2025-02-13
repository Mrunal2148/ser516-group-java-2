import React, { useState } from 'react';
import './css/Dropdown.css';

const Dropdown = ({ onMetricSelect }) => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    onMetricSelect(value); // Call the callback function with the selected value
  };

  return (
    <div className="dropdown">
      <label htmlFor="metrics-dropdown">Select Metric: &nbsp;</label>
      <select id="metrics-dropdown" value={selectedOption} onChange={handleChange}>
        <option value="">--Select--</option>
        <option value="fog-index">Fog Index</option>
        <option value="code-comment-coverage">Code Comment Coverage</option>
        <option value="defects-removed">Defects Removed</option>
      </select>
    </div>
  );
};

export default Dropdown;
