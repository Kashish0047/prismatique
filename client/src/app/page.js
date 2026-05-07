'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import RewardsSection from '@/components/RewardsSection';
import FAQ from '@/components/FAQ';
import GamesSection from '@/components/GamesSection';
import Leaderboard from '@/components/Leaderboard';
import CoinWallet from '@/components/CoinWallet';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const STORAGE_KEY = 'prism_auth_v2'; // Single source of truth for storage key

export default function Home() {
  console.log('🏠 Home component mounted');
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [kickId, setKickId] = useState('');
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authStep, setAuthStep] = useState(1); // 1: Username, 2: Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [streamInfo, setStreamInfo] = useState({
    isLive: false,
    followers: 0,
    category: 'Offline',
    loading: true
  });
  const [activities, setActivities] = useState([]);

  // Persist user session from localStorage
  useEffect(() => {
<<<<<<< HEAD
    const savedUser = localStorage.getItem('prism_auth_v2');
    console.log('🔍 Loading from localStorage:', savedUser);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('✅ Parsed user from localStorage:', parsedUser);
        setUser(parsedUser);
        setCoins(parsedUser.coins || 0);
      } catch (e) {
        console.error('❌ Error parsing localStorage:', e);
=======
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setCoins(parsedUser.coins || 0);
      } catch (e) {
        // Corrupted storage — clear it
        localStorage.removeItem(STORAGE_KEY);
>>>>>>> origin/feature/nextjs-migration
      }
    }
  }, []);

  // Log user state changes
  useEffect(() => {
    console.log('👤 User state changed:', user);
  }, [user]);

  // Fetch Info
  useEffect(() => {
    fetchStreamInfo();
    fetchActivities();

<<<<<<< HEAD
=======
    // Check for OAuth callback params
    const params = new URLSearchParams(window.location.search);

    if (params.get('login_success') === 'true') {
      const userData = {
        username: params.get('username'),
        avatar: decodeURIComponent(params.get('avatar') || ''),
        coins: parseInt(params.get('coins') || '100', 10)
      };

      // Save to localStorage using the consistent key
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      setCoins(userData.coins);
      setShowLoginModal(false);

      // Clean up URL params without triggering a reload loop
      router.replace('/');

    } else if (params.get('error')) {
      setError(`Login failed: ${params.get('error')}`);
      setShowLoginModal(true);
      router.replace('/');
    }

>>>>>>> origin/feature/nextjs-migration
    const streamInterval = setInterval(fetchStreamInfo, 300000); // 5 mins
    const activityInterval = setInterval(fetchActivities, 30000); // 30 secs
    return () => {
      clearInterval(streamInterval);
      clearInterval(activityInterval);
    };
  }, []);

  // Check for OAuth completion
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const justLoggedOut = sessionStorage.getItem('just_logged_out');
    console.log('🔍 OAuth check - params:', params.toString(), 'justLoggedOut:', justLoggedOut);

    if (params.get('login_success') === 'true' && !justLoggedOut) {
      const userData = {
        username: params.get('username'),
        avatar: decodeURIComponent(params.get('avatar') || ''),
        coins: parseInt(params.get('coins') || '100', 10)
      };
      console.log('✅ OAuth success, saving user:', userData);
      localStorage.setItem('prism_auth_v2', JSON.stringify(userData));
      sessionStorage.removeItem('just_logged_out');
      
      // Clear URL parameters instantly
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Force a full reload to clear params and ensure clean state
      window.location.href = '/';
    } else if (params.get('error')) {
      setError(`Login failed: ${params.get('error')}`);
      setShowLoginModal(true);
      router.replace('/');
    }
  }, []);

  const fetchActivities = async () => {
    try {
<<<<<<< HEAD
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/activity`);
=======
      const response = await fetch(`${API}/activity`);
>>>>>>> origin/feature/nextjs-migration
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setActivities(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    }
  };

  const fetchStreamInfo = async () => {
    try {
      const response = await fetch(`${API}/kick/stream-info/prismatique`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setStreamInfo({
          isLive: result.isLive,
          followers: result.followers,
          category: result.category,
          loading: false
        });
      }
    } catch (err) {
      console.error("Failed to fetch stream info:", err);
      setStreamInfo(prev => ({ ...prev, loading: false }));
    }
  };

  const startLogin = () => {
    window.location.href = `${API}/auth/kick`;
  };

  const confirmLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/auth/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: kickId })
      });

      const result = await response.json();

      if (result.success) {
        const userData = {
          username: result.user.username,
          avatar: result.user.avatar,
          coins: result.user.coins || 100
        };
        setUser(userData);
        setCoins(userData.coins);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
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

  // Single unified logout handler — called from Navbar
  const handleLogout = () => {
    console.log('🚀 NUCLEAR LOGOUT');
    localStorage.clear();
    sessionStorage.clear();
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    sessionStorage.setItem('just_logged_out', 'true');
    setUser(null);
    setCoins(0);
    setShowLoginModal(false);
    resetAuth();
    // Replace so back-button can't restore the logged-in state
    window.location.replace('/');
  };

  // Update coins in state + storage consistently
  const handleCoinsUpdate = (newCoins) => {
    setCoins(newCoins);
    const updatedUser = { ...user, coins: newCoins };
    setUser(updatedUser);
    // FIX: was saving to 'prism_user' — now uses consistent STORAGE_KEY
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
>>>>>>> origin/feature/nextjs-migration
  };

  return (
    <main>
      <Navbar 
        key={user ? `logged-in-${user.username}` : 'logged-out'}
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => setShowLoginModal(true)}
        coins={coins}
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
            PRISMATIQUE <span className="highlight-blue">ELITE</span>
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

      <section id="stream" className="stream-section section-padding">
        <div className="container">
          <div className="stream-layout">
            <div className="stream-main">
              <div className="stream-container">
                {streamInfo.isLive && <div className="live-badge-pulsing">LIVE</div>}
                <iframe 
                  src="https://player.kick.com/prismatique" 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            <div className="stream-sidebar">
              <div className="streamer-card">
                <div className="streamer-header">
                  <img src="/pris.png" alt="Prismatique" className="streamer-avatar" />
                  <div className="streamer-info">
                    <h3>PRISMATIQUE</h3>
                    <span className={`status-badge ${streamInfo.isLive ? 'online' : 'offline'}`}>
                      {streamInfo.isLive ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
                <div className="stream-actions">
                  <a href="https://kick.com/prismatique" target="_blank" rel="noopener noreferrer" className="stream-btn primary">
                    <i className="fab fa-kickstarter"></i> WATCH ON KICK
                  </a>
                </div>
                <div className="stream-stats">
                  <div className="stat-item">
                    <span className="stat-value">{streamInfo.loading ? '...' : (streamInfo.followers || 0).toLocaleString()}</span>
                    <span className="stat-label">Followers</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{streamInfo.loading ? '...' : streamInfo.category.toUpperCase()}</span>
                    <span className="stat-label">Category</span>
                  </div>
                </div>
              </div>
              <div className="activity-card">
                <h4>LATEST ACTIVITY</h4>
                <div className="activity-list">
                  {activities.length > 0 ? activities.map((activity) => (
                    <div className="activity-item" key={activity.id}>
                      <div className="activity-icon">
                        {activity.action.includes('login') ? '👤' : 
                         activity.action.includes('win') ? '🏆' : 
                         activity.action.includes('wager') ? '💰' : '🎁'}
                      </div>
                      <div className="activity-text">
                        <p><span className="activity-user">{activity.user}</span> {activity.action}</p>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="activity-item">
                      <p className="loading-text">Loading activity...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="raffles" className="raffles-section">
        <div className="container" id="giveaways">
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

      <RewardsSection />

      {/* Premium Games Preview Section */}
      <section id="games-preview" className="games-preview-section">
        <div className="container">
          <div className="section-header-centered">
<<<<<<< HEAD
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="section-title"
            >
              PRISMATIQUE <span className="highlight-blue">ORIGINALS</span>
            </motion.h2>
            <p className="section-subtitle">Experience the next generation of provably fair gaming.</p>
            <div className="preview-wallet-wrapper">
              <CoinWallet user={user} onCoinsUpdate={(newCoins) => {
                setCoins(newCoins);
                const updatedUser = { ...user, coins: newCoins };
                setUser(updatedUser);
                localStorage.setItem('prism_auth_v2', JSON.stringify(updatedUser));
              }} />
=======
            <h2 className="section-title">POPULAR <span className="highlight-blue">GAMES</span></h2>
            <p>Try our originals and win big with fake coins!</p>
            <div style={{ marginTop: '20px' }}>
              <CoinWallet user={user} onCoinsUpdate={handleCoinsUpdate} />
>>>>>>> origin/feature/nextjs-migration
            </div>
          </div>
          
          <div className="preview-grid">
            <motion.div 
              whileHover={{ y: -10 }}
              className="preview-card dice" 
              onClick={() => window.location.href = '/games/dice'}
            >
              <div className="preview-card-inner">
                <div className="preview-emoji">🎲</div>
                <h3>DICE</h3>
                <p>Predict over or under</p>
                <div className="preview-play-now">PLAY NOW</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="preview-card mines" 
              onClick={() => window.location.href = '/games/mines'}
            >
              <div className="preview-card-inner">
                <div className="preview-emoji">💣</div>
                <h3>MINES</h3>
                <p>Avoid hidden mines</p>
                <div className="preview-play-now">PLAY NOW</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="preview-card limbo" 
              onClick={() => window.location.href = '/games/limbo'}
            >
              <div className="preview-card-inner">
                <div className="preview-emoji">🚀</div>
                <h3>LIMBO</h3>
                <p>Infinite multipliers</p>
                <div className="preview-play-now">PLAY NOW</div>
              </div>
            </motion.div>
          </div>

          <div className="view-all-container">
            <Link href="/games" className="view-all-games-btn">
              <span>EXPLORE ALL GAMES</span>
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      <Leaderboard />

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
            onClick={() => { setShowLoginModal(false); resetAuth(); }}
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
                <div className="login-form">
                  <p className="modal-info-text">
                    You will be redirected to Kick to safely authorize your account.
                  </p>
                  <button onClick={startLogin} className="login-submit-btn" disabled={loading}>
                    {loading ? 'REDIRECTING...' : 'LOGIN WITH KICK'}
                  </button>
                </div>
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
