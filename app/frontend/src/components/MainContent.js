import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Home from "./Home"; 
import RunMetrics from "./RunMetrics";
import CodeComment from "./CodeComment";

const MainContent = () => {
  return (
    <div className="main-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/runmetric" element={<RunMetrics />} />
        <Route path="/codecomment" element={<CodeComment />} />
      </Routes>
    </div>
  );
};

export default MainContent;
