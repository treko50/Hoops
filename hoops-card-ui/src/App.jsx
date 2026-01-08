import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CollectionProvider } from './context/CollectionContext';
import Layout from './components/layout/Layout';

// Page imports (will be created)
import LandingPage from './pages/LandingPage';
import BrowsePage from './pages/BrowsePage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import TeamPage from './pages/TeamPage';
import ComparisonPage from './pages/ComparisonPage';
import CollectionPage from './pages/CollectionPage';
import PackOpeningPage from './pages/PackOpeningPage';

/**
 * Main App Component
 * Sets up routing and global context providers
 */
function App() {
  return (
    <CollectionProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Browse/Gallery Page */}
            <Route path="/browse" element={<BrowsePage />} />

            {/* Player Detail Page */}
            <Route path="/player/:playerId" element={<PlayerDetailPage />} />

            {/* Team Page */}
            <Route path="/team/:teamAbbr" element={<TeamPage />} />

            {/* Comparison Page */}
            <Route path="/compare" element={<ComparisonPage />} />

            {/* Collection/Favorites Page */}
            <Route path="/collection" element={<CollectionPage />} />

            {/* Pack Opening Page */}
            <Route path="/pack-opening" element={<PackOpeningPage />} />
          </Routes>
        </Layout>
      </Router>
    </CollectionProvider>
  );
}

export default App;
