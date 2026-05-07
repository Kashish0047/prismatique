'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CoinWallet from '@/components/CoinWallet';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const GAMES = [
  { id: 'dice', name: 'DICE', emoji: '🎲', desc: 'Predict and win with custom odds', color: '#00f2ff', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400' },
  { id: 'limbo', name: 'LIMBO', emoji: '🚀', desc: 'Watch the multiplier skyrocket', color: '#a855f7', image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=400' },
  { id: 'mines', name: 'MINES', emoji: '💣', desc: 'High stakes grid-based survival', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=400' },
  { id: 'dragon_tower', name: 'DRAGON TOWER', emoji: '🐉', desc: 'Climb the tower for massive payouts', color: '#ef4444', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400' },
  { id: 'chicken', name: 'CHICKEN', emoji: '🌟', desc: 'Find the Rockstar chicken', color: '#53fc18', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=400' },
];

export default function GamesPage() {
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
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = '/games';
    } else if (params.get('error')) {
      setError(`Login failed: ${params.get('error')}`);
      setShowLoginModal(true);
      window.location.replace('/games');
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    sessionStorage.setItem('just_logged_out', 'true');
    setUser(null);
    setCoins(0);
    window.location.replace(window.location.origin);
  };

  const startLogin = () => {
    window.location.href = `${API}/auth/kick`;
  };

  return (
    <main className="min-h-screen bg-dark">
      <Navbar 
        key={user ? `logged-in-${user.username}` : 'logged-out'}
        user={user} 
        coins={coins} 
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
      />

      <section className="games-hub-hero">
        <div className="container">
          <div className="hub-content">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gradient"
            >
              PRISMATIQUE <span className="highlight-blue">ORIGINALS</span>
            </motion.h1>
            <p>Experience the thrill of our custom-built, provably fair casino games.</p>
            <div className="hub-wallet-container">
              <CoinWallet user={user} onCoinsUpdate={(newCoins) => setCoins(newCoins)} />
            </div>
          </div>

          <div className="hub-grid">
            {GAMES.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/games/${game.id}`} className="hub-card" style={{ '--game-color': game.color }}>
                  <div className="hub-card-img" style={{ backgroundImage: `url(${game.image})` }}>
                    <div className="hub-card-overlay">
                      <div className="hub-emoji-container">
                        <span className="hub-emoji">{game.emoji}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hub-card-info">
                    <div className="hub-card-header">
                      <h3>{game.name}</h3>
                      <div className="fair-badge">PROVABLY FAIR</div>
                    </div>
                    <p>{game.desc}</p>
                    <div className="hub-play-btn">
                      <span>PLAY NOW</span>
                      <i className="fas fa-play"></i>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              className="modal-content glass-panel"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-kick-icon">
                <div className="icon-glow">
                  <i className="fab fa-kickstarter" style={{ color: '#53fc18', fontSize: '50px' }}></i>
                </div>
              </div>
              <h3 className="text-gradient">LOGIN WITH KICK</h3>
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

      <style jsx>{`
        .games-hub-hero { 
          padding: 160px 0 100px; 
          background: radial-gradient(circle at 50% 0%, rgba(0, 242, 255, 0.05) 0%, transparent 50%);
        }
        .hub-content { text-align: center; margin-bottom: 80px; }
        .hub-content h1 { font-size: 4.5rem; font-weight: 900; letter-spacing: -3px; margin-bottom: 20px; line-height: 1.1; }
        .hub-content p { color: var(--text-secondary); font-size: 1.2rem; max-width: 600px; margin: 0 auto 40px; }
        
        .hub-wallet-container {
          display: inline-flex;
          padding: 10px;
          background: rgba(255,255,255,0.03);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
        }

        .hub-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); 
          gap: 30px; 
        }

        .hub-card {
          background: #11141b;
          border-radius: 30px;
          overflow: hidden;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          display: block;
          height: 100%;
          position: relative;
        }

        .hub-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--game-color) 0%, transparent 100%);
          opacity: 0;
          transition: 0.5s;
          z-index: 0;
        }

        .hub-card:hover {
          transform: translateY(-15px) scale(1.02);
          border-color: var(--game-color);
          box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 30px color-mix(in srgb, var(--game-color) 20%, transparent);
        }

        .hub-card:hover::before { opacity: 0.05; }

        .hub-card-img {
          height: 220px;
          background-size: cover;
          background-position: center;
          position: relative;
          transition: 0.5s;
        }

        .hub-card:hover .hub-card-img { height: 200px; }

        .hub-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, rgba(8, 10, 15, 0.9));
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hub-emoji-container {
          background: rgba(0,0,0,0.5);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255,255,255,0.1);
          transition: 0.5s;
        }

        .hub-emoji { font-size: 3.5rem; transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .hub-card:hover .hub-emoji { transform: scale(1.2) rotate(12deg); }
        .hub-card:hover .hub-emoji-container { border-color: var(--game-color); box-shadow: 0 0 20px var(--game-color); }

        .hub-card-info { padding: 30px; position: relative; z-index: 1; }
        
        .hub-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .hub-card-info h3 { font-size: 1.6rem; font-weight: 900; color: #fff; margin: 0; }
        
        .fair-badge {
          font-size: 0.6rem;
          font-weight: 900;
          padding: 4px 10px;
          background: rgba(83, 252, 24, 0.1);
          color: #53fc18;
          border-radius: 6px;
          border: 1px solid rgba(83, 252, 24, 0.2);
          letter-spacing: 1px;
        }

        .hub-card-info p { color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 30px; line-height: 1.6; }

        .hub-play-btn {
          background: var(--game-color);
          color: #000;
          text-align: center;
          padding: 15px;
          border-radius: 16px;
          font-weight: 900;
          font-size: 1rem;
          transition: 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .hub-card:hover .hub-play-btn {
          transform: scale(1.05);
          box-shadow: 0 15px 30px color-mix(in srgb, var(--game-color) 40%, transparent);
        }

        .icon-glow {
          position: relative;
          display: inline-block;
        }
        .icon-glow::after {
          content: '';
          position: absolute;
          inset: -20px;
          background: #53fc18;
          filter: blur(40px);
          opacity: 0.2;
          z-index: -1;
        }

        @media (max-width: 768px) {
          .hub-content h1 { font-size: 2.8rem; }
          .games-hub-hero { padding-top: 120px; }
        }
      `}</style>
    </main>
  );
}
