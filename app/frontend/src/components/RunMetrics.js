import React from "react";
import Dropdown from "./Dropdown";
import { useState, useEffect } from "react";

const RunMetrics = () => {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/links.json") // Ensure this path is correct
      .then((response) => response.json())
      .then((data) => setLinks(data))
      .catch((error) => console.error("Error fetching links:", error));
  }, []);

  return (
    <div>
      <Dropdown />
      <label>Select Repository: </label>
      <select defaultValue="">
        <option value="" disabled>--Select--</option>
        {links.slice(1).map((link, index) => (
          <option key={index} value={link}>{link}</option>
        ))}
      </select>
    </div>
  );
};

export default RunMetrics;
