// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Column 1: Logo & Social */}
        <div className="footer-col">
          <h3>🎓 FeedbackHub</h3>
          <p>Your voice matters.</p>
          <div className="social-icons">
            <a href="#facebook" aria-label="Facebook">f</a>
            <a href="#instagram" aria-label="Instagram">📷</a>
            <a href="#twitter" aria-label="Twitter">X</a>
            <a href="#youtube" aria-label="YouTube">▶️</a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/submit">Submit Feedback</Link></li>
            <li><Link to="#">About Us</Link></li>
            <li><Link to="#">Contact</Link></li>
          </ul>
        </div>

        {/* Column 3: Helpful Info */}
        <div className="footer-col">
          <h4>Helpful Info</h4>
          <ul>
            <li><Link to="#">FAQ</Link></li>
            <li><Link to="#">Privacy Policy</Link></li>
            <li><Link to="#">Terms of Use</Link></li>
            <li><Link to="#">Cookie Settings</Link></li>
          </ul>
        </div>

        {/* Column 4: Useful Links */}
        <div className="footer-col">
          <h4>Useful Links</h4>
          <ul>
            <li><Link to="#">Submit a Complaint</Link></li>
            <li><Link to="#">Make a Suggestion</Link></li>
            <li><Link to="#">Report an Issue</Link></li>
            <li><Link to="#">Support Center</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="legal-links">
          <Link to="#">Terms of use</Link>
          <Link to="#">Privacy Notice</Link>
          <Link to="#">Cookie notice</Link>
          <Link to="#">Cookie preference centre</Link>
          <Link to="#">Sitemap</Link>
        </div>
        <div className="copyright">
          <p>© {new Date().getFullYear()} FeedbackHub. This site is maintained by Department of Information Technology.</p>
        </div>
        <div className="update-info">
          <p>Site last updated [{new Date().toLocaleDateString()}]</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;