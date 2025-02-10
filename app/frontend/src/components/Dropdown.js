import React, { useState } from 'react';
import './css/Dropdown.css';

const Dropdown = () => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="dropdown">
      <label htmlFor="metrics-dropdown">Select Metric: &nbsp;</label>
      <select id="metrics-dropdown" value={selectedOption} onChange={handleChange} className="dropdown">
        <option value="">--Select--</option>
        <option value="fog-index">Fog Index</option>
        <option value="code-comment-coverage">Code Comment Coverage</option>
        <option value="defects-removed">Defects Removed</option>
      </select>
    </div>
  );
};

export default Dropdown;
