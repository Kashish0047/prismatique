'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function BonusesPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('prism_auth_v2');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setCoins(parsed.coins || 0);
      } catch (e) {}
    }

    // Check for OAuth completion
    const params = new URLSearchParams(window.location.search);
    const justLoggedOut = sessionStorage.getItem('just_logged_out');

    if (params.get('login_success') === 'true' && !justLoggedOut) {
      const userData = {
        username: params.get('username'),
        avatar: decodeURIComponent(params.get('avatar') || ''),
        coins: parseInt(params.get('coins') || '100', 10)
      };
      setUser(userData);
      setCoins(userData.coins);
      localStorage.setItem('prism_auth_v2', JSON.stringify(userData));
      sessionStorage.removeItem('just_logged_out');
      window.location.replace('/bonuses');
      setTimeout(() => window.location.reload(), 100);
    } else if (params.get('error')) {
      setError(`Login failed: ${params.get('error')}`);
      setShowLoginModal(true);
      window.location.replace('/bonuses');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('prism_auth_v2');
    localStorage.removeItem('prism_user');
    sessionStorage.setItem('just_logged_out', 'true');
    setUser(null);
    setCoins(0);
    window.location.href = window.location.origin;
  };

  const startLogin = () => {
    window.location.href = `${API}/auth/kick`;
  };

  return (
    <main className="bonuses-page-container">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => setShowLoginModal(true)}
        coins={coins}
      />

      <section className="bonuses-hero">
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-title"
          >
            EXCLUSIVE <span className="highlight-blue">CASINO BONUSES</span>
          </motion.h1>
          <p className="page-subtitle">Hand-picked premium deals for the Prismatique community.</p>
        </div>
      </section>

      <section className="bonus-section section-padding">
        <div className="container">
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
              <h3>LOGIN WITH KICK</h3>
              <p>Enter your Kick username to track your rewards and rank.</p>
              
              {error && <div className="modal-error">{error}</div>}
              
              <div className="login-form">
                <p className="modal-info-text">
                  You will be redirected to Kick to safely authorize your account.
                </p>
                <button onClick={startLogin} className="login-submit-btn" disabled={loading}>
                  {loading ? 'REDIRECTING...' : 'LOGIN WITH KICK'}
                </button>
              </div>
              
              <button 
                className="modal-close-link" 
                onClick={() => { setShowLoginModal(false); setError(''); }} 
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
