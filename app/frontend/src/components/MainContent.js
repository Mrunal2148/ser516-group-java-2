import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Home from "./Home"; 
import RunMetrics from "./RunMetrics";

const MainContent = () => {
  return (
    <div className="main-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/runmetric" element={<RunMetrics />} />
      </Routes>
    </div>
  );
};

export default MainContent;
