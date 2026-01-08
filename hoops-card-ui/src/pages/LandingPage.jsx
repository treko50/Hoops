import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { CardGrid } from '../components/CardGrid';
import { AdvancedCardView } from '../components/AdvancedCardView';
import { useCollection } from '../context/CollectionContext';
import { getTopCards, getRarityStats } from '../services/api';
import './LandingPage.css';

/**
 * LandingPage Component
 * Hero page with featured cards and call-to-action
 */
export const LandingPage = () => {
  const [featuredCards, setFeaturedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, rarities: {} });
  const [selectedCard, setSelectedCard] = useState(null);
  const { favorites, toggleFavorite } = useCollection();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [topCards, rarityStats] = await Promise.all([
          getTopCards(6),
          getRarityStats()
        ]);

        setFeaturedCards(topCards);

        // Calculate total and rarity counts
        const total = Object.values(rarityStats).reduce((sum, count) => sum + count, 0);
        setStats({ total, rarities: rarityStats });

        setLoading(false);
      } catch (error) {
        console.error('Error loading landing page data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">
            Ultimate NBA Card Collection
          </h1>
          <p className="hero-subtitle">
            Build your dream team with FIFA Ultimate Team style basketball cards
          </p>
          <div className="hero-buttons">
            <Link to="/browse">
              <GlassButton variant="primary" size="lg">
                Browse Cards
              </GlassButton>
            </Link>
            <Link to="/pack-opening">
              <GlassButton variant="secondary" size="lg">
                Open Packs
              </GlassButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Cards Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Top Rated Players</h2>
          <Link to="/browse">
            <GlassButton variant="ghost" size="sm">
              View All
            </GlassButton>
          </Link>
        </div>

        <CardGrid
          cards={featuredCards}
          onCardClick={handleCardClick}
          onToggleFavorite={toggleFavorite}
          favorites={favorites}
          loading={loading}
        />
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          <GlassCard variant="light" className="feature-card">
            <div className="feature-icon">🎴</div>
            <h3 className="feature-title">Collect Cards</h3>
            <p className="feature-description">
              Browse and collect player cards with detailed stats and ratings
            </p>
          </GlassCard>
          <GlassCard variant="light" className="feature-card">
            <div className="feature-icon">⚖️</div>
            <h3 className="feature-title">Compare Players</h3>
            <p className="feature-description">
              Side-by-side comparison of player stats and attributes
            </p>
          </GlassCard>
          <GlassCard variant="light" className="feature-card">
            <div className="feature-icon">📦</div>
            <h3 className="feature-title">Open Packs</h3>
            <p className="feature-description">
              Exciting pack opening experience with animated card reveals
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Advanced Card Modal */}
      <AdvancedCardView
        cardData={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
};

export default LandingPage;
