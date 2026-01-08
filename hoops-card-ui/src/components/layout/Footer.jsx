import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';
import './Footer.css';

/**
 * Footer Component
 * Glass footer with links and copyright
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Links */}
        <div className="footer-links">
          <div className="footer-section">
            <h3 className="footer-heading">Explore</h3>
            <Link to="/browse" className="footer-link">Browse Cards</Link>
            <Link to="/compare" className="footer-link">Compare Players</Link>
            <Link to="/pack-opening" className="footer-link">Open Packs</Link>
            <Link to="/collection" className="footer-link">My Collection</Link>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">About</h3>
            <a href="#" className="footer-link">About Hoops Cards</a>
            <a href="#" className="footer-link">How It Works</a>
            <a href="#" className="footer-link">FAQ</a>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Connect</h3>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="GitHub">
                <FiGithub />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="#" className="social-link" aria-label="Email">
                <FiMail />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Hoops Cards. All rights reserved.
          </p>
          <p className="disclaimer">
            NBA player stats and data are for educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
