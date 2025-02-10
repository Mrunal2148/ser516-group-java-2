import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTachometerAlt, FaCog, FaCalculator } from 'react-icons/fa';
import './css/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li className="sidebar-item">
          <NavLink to="/">
            <FaHome />
            <span className="icon-text">Home</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/dashboard">
            <FaTachometerAlt />
            <span className="icon-text">Add Projects</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/runmetric">
            <FaCalculator />
            <span className="icon-text">Run Metrics</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/codecomment">
            <FaCalculator />
            <span className="icon-text">Code Comment</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
