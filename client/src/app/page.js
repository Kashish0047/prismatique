'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Leaderboard from '@/components/Leaderboard';
import FAQ from '@/components/FAQ';

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [kickId, setKickId] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authStep, setAuthStep] = useState(1); // 1: Username, 2: Verification
  const [verificationCode, setVerificationCode] = useState('');

  // Persist user session
  useEffect(() => {
    const savedUser = localStorage.getItem('prism_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const startLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: kickId })
      });

      const result = await response.json();

      if (result.success) {
        setVerificationCode(result.code);
        setAuthStep(2);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmLogin = async (simulate = false) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: kickId,
          simulateMatch: simulate // Testing purpose
        })
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        localStorage.setItem('prism_user', JSON.stringify(result.user));
        setShowLoginModal(false);
        resetAuth();
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAuth = () => {
    setAuthStep(1);
    setKickId('');
    setVerificationCode('');
    setError('');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('prism_user');
  };

  return (
    <main>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => setShowLoginModal(true)} 
      />

      <section id="home" className="hero">
        <video autoPlay muted loop id="hero-video">
          <source src="/BG.mp4" type="video/mp4" />
        </video>
        <div className="hero-content container">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            THE <span className="highlight-blue">BONUSES</span>
          </motion.h1>
          <p className="hero-description">
            Discover elite casinos with unbeatable welcome rewards and guaranteed instant withdrawals.
          </p>
          <div className="hero-stats">
            <div className="stat-pill">
              <i className="fas fa-check-circle"></i> 100% VERIFIED
            </div>
            <div className="stat-pill">
              <i className="fas fa-bolt"></i> FAST PAYOUTS
            </div>
            <div className="stat-pill">
              <i className="fas fa-users"></i> 10K+ PLAYERS
            </div>
          </div>
        </div>
      </section>

      <section id="bonuses" className="bonus-section section-padding">
        <div className="container">
          <h2 className="section-title">EXCLUSIVE <span className="highlight-blue">CASINO BONUSES</span></h2>
          <div className="bonus-grid">
            <BonusCard 
              name="RAINBET" 
              badge="POPULAR" 
              link="https://rainbet.com/?r=pris"
              desc="High-stakes crypto casino with instant withdrawals and elite rewards."
              features={["Instant Payout", "VIP Rewards"]}
              isFeatured={true}
            />
            <BonusCard 
              name="96.COM" 
              badge="TOP RATED" 
              link="https://96game.fun/?channel_id=600061400&ma_token=JS-1JyHcMKeB54jpFC4tkWNd7ZgqdRLk&geo=IN"
              desc="Asian gaming platform with exclusive bonuses and massive game selection."
              features={["1000+ Games", "High RTP"]}
            />
            <BonusCard 
              name="WHALE.IO" 
              badge="PREMIUM" 
              link="https://whalegames.gg/?tf_clickid=WIO019d548d4f8f7e29bfbb245d459ed259&pubid=432&offer_name=150_cpa_30_rs"
              desc="Exclusive gaming platform with high-stakes bonuses and VIP treatment."
              features={["VIP Club", "High Limits"]}
            />
            <BonusCard 
              name="CHANCER" 
              badge="NEW" 
              link="#" 
              desc="The future of social betting. Join the community and win big."
              features={["Social Betting", "Instant Registration"]}
            />
          </div>
        </div>
      </section>

      <section id="raffles" className="raffles-section">
        <div className="container">
          <h2 className="section-title">DAILY <span className="highlight-blue">RAFFLES & GIVEAWAYS</span></h2>
          <div className="raffle-grid">
            <div className="raffle-card">
              <div className="raffle-status status-live">LIVE</div>
              <div className="raffle-icon">💰</div>
              <h3>WEEKLY WAGER RACE</h3>
              <div className="raffle-prize">$1,000 PRIZE POOL</div>
              <p className="raffle-details">Wager on any of our partner casinos to climb the rank and win your share.</p>
              <button className="raffle-btn">VIEW RANKINGS</button>
            </div>
            <div className="raffle-card">
              <div className="raffle-status">STARTING SOON</div>
              <div className="raffle-icon">🎁</div>
              <h3>MONTHLY GIVEAWAY</h3>
              <div className="raffle-prize">$5,000 IN REWARDS</div>
              <p className="raffle-details">Join our Discord and Kick community for a chance to win exclusive rewards.</p>
              <button className="raffle-btn">JOIN DISCORD</button>
            </div>
            <div className="raffle-card">
              <div className="raffle-status status-live">DAILY</div>
              <div className="raffle-icon">⚡</div>
              <h3>INSTANT DROPS</h3>
              <div className="raffle-prize">$50 - $500 DAILY</div>
              <p className="raffle-details">Watch the stream and be active in chat to receive random balance drops.</p>
              <button className="raffle-btn">WATCH STREAM</button>
            </div>
          </div>
        </div>
      </section>

      <Leaderboard />


      <FAQ />

      <footer>
        <div className="container">
          <p>&copy; 2024 PRISMATIQUE. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

      {/* Kick Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay" 
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal-content" 
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-kick-icon">
                <i className="fab fa-kickstarter" style={{ color: '#53fc18', fontSize: '50px' }}></i>
              </div>
              <h3>{authStep === 1 ? 'LOGIN WITH KICK' : 'VERIFY OWNERSHIP'}</h3>
              <p>
                {authStep === 1 
                  ? 'Enter your Kick username to track your rewards and rank.' 
                  : `Please add the code below to your Kick bio to verify you own this account.`}
              </p>
              
              {error && <div className="modal-error">{error}</div>}
              
              {authStep === 1 ? (
                <form onSubmit={startLogin} className="login-form">
                  <div className="input-group">
                    <span className="input-prefix">kick.com/</span>
                    <input 
                      type="text" 
                      placeholder="Username" 
                      value={kickId}
                      onChange={(e) => setKickId(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="login-submit-btn" disabled={loading}>
                    {loading ? 'CHECKING...' : 'CONTINUE'}
                  </button>
                </form>
              ) : (
                <div className="verification-step">
                  <div className="code-display">
                    <code>{verificationCode}</code>
                    <button className="copy-btn" onClick={() => navigator.clipboard.writeText(verificationCode)}>
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                  
                  <div className="verification-actions">
                    <button 
                      className="login-submit-btn" 
                      onClick={() => confirmLogin()}
                      disabled={loading}
                    >
                      {loading ? 'VERIFYING...' : 'I HAVE UPDATED MY BIO'}
                    </button>
                  </div>
                  
                  <button className="back-link" onClick={() => setAuthStep(1)}>BACK</button>
                </div>
              )}
              
              <button 
                className="modal-close-link" 
                onClick={() => { setShowLoginModal(false); resetAuth(); }} 
                disabled={loading}
              >
                CANCEL
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function BonusCard({ name, badge, link, desc, features, isFeatured }) {
  return (
    <div className={`bonus-card ${isFeatured ? 'featured' : ''}`}>
      <div className="bonus-badge">{badge}</div>
      <h3 className="bonus-name">{name}</h3>
      <p className="bonus-desc">{desc}</p>
      <div className="bonus-features">
        {features.map((f, i) => (
          <span key={i} className="feature-tag">{f}</span>
        ))}
      </div>
      <a href={link} target="_blank" rel="noopener noreferrer" className="bonus-button">
        CLAIM NOW <i className="fas fa-arrow-right"></i>
      </a>
    </div>
  );
}
