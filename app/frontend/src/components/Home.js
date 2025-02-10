import React from "react";
import Dropdown from "./Dropdown";

const Home = () => {
  return (
      <div>
        <h1>Welcome to the Project Metrics Calculator</h1>
        <p>Select an option from the sidebar to get started!</p>
        <Dropdown />
      </div>
  );
};

export default Home;
