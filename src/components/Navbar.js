// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>🎓 Feedback Dashboard</h1>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/submit">Submit Feedback</Link>
      </div>
    </nav>
  );
};

export default Navbar;