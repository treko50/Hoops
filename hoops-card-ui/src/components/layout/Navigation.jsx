import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX, FiHeart } from 'react-icons/fi';
import { useCollection } from '../../context/CollectionContext';
import './Navigation.css';

/**
 * Navigation Component
 * Glass navigation header with logo, nav links, and favorites badge
 */
export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getFavoriteCount } = useCollection();
  const favoriteCount = getFavoriteCount();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          <span className="logo-icon">🏀</span>
          <span className="logo-text">Hoops Cards</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links">
          <NavLink
            to="/browse"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Browse
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Compare
          </NavLink>
          <NavLink
            to="/pack-opening"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Packs
          </NavLink>
          <NavLink
            to="/collection"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FiHeart className="nav-link-icon" />
            Collection
            {favoriteCount > 0 && (
              <span className="favorites-badge">{favoriteCount}</span>
            )}
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <NavLink
              to="/browse"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Browse
            </NavLink>
            <NavLink
              to="/compare"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Compare
            </NavLink>
            <NavLink
              to="/pack-opening"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Packs
            </NavLink>
            <NavLink
              to="/collection"
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FiHeart className="nav-link-icon" />
              Collection
              {favoriteCount > 0 && (
                <span className="favorites-badge">{favoriteCount}</span>
              )}
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
