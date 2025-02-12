import React from "react";
import { Routes, Route } from "react-router-dom";
import AddProject from "./AddProject";
import Home from "./Home";
import RunMetrics from "./RunMetrics";
import FogIndexCalculator from "./FogIndexCalculator";

const MainContent = () => {
  return (
    <div className="main-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/AddProject" element={<AddProject />} />
        <Route path="/fogindex" element={<FogIndexCalculator />} />
      </Routes>
    </div>
  );
};

export default MainContent;
