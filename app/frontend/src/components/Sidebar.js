import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTachometerAlt, FaCog } from 'react-icons/fa';
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
            <span className="icon-text">Dashboard</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
