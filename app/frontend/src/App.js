import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import MainContent from "./components/MainContent";
import "./App.css"; 

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="content">
          <Sidebar />
          <MainContent />
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
