import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import './Layout.css';

/**
 * Layout Component
 * Main layout wrapper with navigation and footer
 */
export const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navigation />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
