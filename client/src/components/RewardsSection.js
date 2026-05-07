'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Leaderboard from './Leaderboard';

export default function RewardsSection() {
  const [activeTab, setActiveTab] = useState('leaderboard');

  return (
    <section id="rewards" className="rewards-section section-padding">
      <div className="container">
        <h2 className="section-title">PREMIUM <span className="highlight-blue">REWARDS</span></h2>
        
        <div className="rewards-tabs">
          <button 
            className={`reward-tab-btn ${activeTab === 'wager' ? 'active' : ''}`}
            onClick={() => setActiveTab('wager')}
          >
            <i className="fas fa-coins"></i> WAGER REWARD
          </button>
          <button 
            className={`reward-tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <i className="fas fa-trophy"></i> LEADERBOARD
          </button>
        </div>

        <div className="rewards-content-wrapper">
          <AnimatePresence mode="wait">
            {activeTab === 'wager' ? (
              <motion.div 
                key="wager"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="wager-rewards-coming"
              >
                <div className="coming-soon-card-premium">
                  <div className="glass-effect"></div>
                  <motion.div 
                    className="coming-soon-icon"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    🚀
                  </motion.div>
                  <h3>WAGER REWARDS</h3>
                  <p>Our automated wager tracking system is under development. Get ready for instant cashback, weekly boosts, and level-up milestones!</p>
                  <div className="coming-soon-badge-premium">
                    <span className="pulse-dot"></span>
                    DEVELOPMENT IN PROGRESS
                  </div>
                  <div className="coming-soon-footer">
                    STAY TUNED FOR THE ELITE LAUNCH
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Leaderboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
