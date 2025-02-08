import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


const App = () => { 
  return (
  <Router> 
    <div className="app"> 
      <Header /> 
      <div className="content"> 
        <div className="sidebar"> 
          <Sidebar /> 
          </div> 
          <div className="main-content"> 
            <Routes>
            <Route path="/" element={<MainContent />} /> 
              </Routes> 
            </div> 
        </div> 
        <Footer /> 
      </div> 
  </Router>); };

export default App;
