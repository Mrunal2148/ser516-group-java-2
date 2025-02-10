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
      <ul>
        {links.map((link, index) => (
          <li key={index}>{link}</li>
        ))}
      </ul>
    </div>
  );
};

export default RunMetrics;
