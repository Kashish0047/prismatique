'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CoinWallet from '@/components/CoinWallet';
import DiceGame from '@/components/games/DiceGame';
import LimboGame from '@/components/games/LimboGame';
import MinesGame from '@/components/games/MinesGame';
import DragonTowerGame from '@/components/games/DragonTowerGame';
import ChickenGame from '@/components/games/ChickenGame';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const GAMES_META = {
  dice: { name: 'DICE', emoji: '🎲', component: DiceGame, color: '#00f2ff' },
  limbo: { name: 'LIMBO', emoji: '🚀', component: LimboGame, color: '#a855f7' },
  mines: { name: 'MINES', emoji: '💣', component: MinesGame, color: '#f59e0b' },
  dragon_tower: { name: 'DRAGON TOWER', emoji: '🐉', component: DragonTowerGame, color: '#ef4444' },
  chicken: { name: 'CHICKEN', emoji: '🌟', component: ChickenGame, color: '#53fc18' },
};

export default function SingleGamePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const game = GAMES_META[id];
  
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
      window.location.href = `/games/${id}`;
    } else if (params.get('error')) {
      setError(`Login failed: ${params.get('error')}`);
      setShowLoginModal(true);
      window.location.replace(`/games/${id}`);
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

  const handleCoinsUpdate = (newCoins) => {
    setCoins(newCoins);
    const updatedUser = { ...user, coins: newCoins };
    setUser(updatedUser);
    localStorage.setItem('prism_auth_v2', JSON.stringify(updatedUser));
  };

  if (!game) return <div className="p-20 text-center">Game not found</div>;

  const GameComponent = game.component;

  return (
    <main className="min-h-screen bg-dark">
      <Navbar 
        key={user ? `logged-in-${user.username}` : 'logged-out'}
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => setShowLoginModal(true)}
        coins={coins}
      /><section className="game-player-section">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="player-layout"
          >
            <div className="player-sidebar glass-panel">
              <Link href="/games" className="back-link">
                <i className="fas fa-arrow-left"></i>
                <span>GAMES HUB</span>
              </Link>
              
              <div className="game-info-box">
                <motion.div 
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  className="game-badge" 
                  style={{ backgroundColor: game.color }}
                >
                  {game.name}
                </motion.div>
                <h1 className="text-gradient">{game.emoji} {game.name}</h1>
                <p>Experience the most immersive {game.name.toLowerCase()} game on Prismatique. Provably fair and lightning fast.</p>
              </div>
              
              <div className="player-wallet-box">
                <span className="label">YOUR BALANCE</span>
                <CoinWallet user={user} onCoinsUpdate={handleCoinsUpdate} />
              </div>

              <div className="game-features-list">
                <div className="feature-item">
                  <i className="fas fa-shield-halved"></i>
                  <span>Provably Fair</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-bolt"></i>
                  <span>Instant Payouts</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-headset"></i>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            <div className="player-main">
              <div className="game-container-inner">
                <div className="game-wrapper">
                  {user ? (
                    <GameComponent user={user} onCoinsUpdate={handleCoinsUpdate} />
                  ) : (
                    <div className="login-prompt-box">
                      <div className="lock-icon-large">🔒</div>
                      <h2>Login to Play</h2>
                      <p>You need to be logged in with your Kick account to play {game.name}.</p>
                      <button 
                        className="login-submit-btn" 
                        onClick={() => setShowLoginModal(true)}
                      >
                        LOGIN WITH KICK
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="game-footer-stats">
                <div className="stat">
                  <span className="s-label">MIN BET</span>
                  <span className="s-value">1 🪙</span>
                </div>
                <div className="stat">
                  <span className="s-label">MAX WIN</span>
                  <span className="s-value">10,000 🪙</span>
                </div>
                <div className="stat">
                  <span className="s-label">HOUSE EDGE</span>
                  <span className="s-value">1%</span>
                </div>
              </div>
            </div>
          </motion.div>
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
        .game-player-section { 
          padding: 140px 0 80px; 
          min-height: 100vh;
          background: radial-gradient(circle at 100% 0%, rgba(0, 242, 255, 0.05) 0%, transparent 40%);
        }
        
        .player-layout { 
          display: grid; 
          grid-template-columns: 380px 1fr; 
          gap: 30px; 
          align-items: start; 
        }
        
        .player-sidebar {
          padding: 40px;
          position: sticky;
          top: 120px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .back-link { 
          display: inline-flex; 
          align-items: center;
          gap: 12px;
          color: var(--text-secondary); 
          text-decoration: none; 
          font-weight: 800; 
          transition: 0.3s;
          font-size: 0.8rem;
          letter-spacing: 1px;
        }
        .back-link:hover { color: var(--accent); transform: translateX(-5px); }

        .game-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 10px;
          font-weight: 900;
          font-size: 0.75rem;
          color: #000;
          margin-bottom: 20px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .player-sidebar h1 { font-size: 2.8rem; font-weight: 900; margin-bottom: 15px; line-height: 1.1; }
        .player-sidebar p { color: var(--text-secondary); font-size: 1rem; line-height: 1.6; }

        .player-wallet-box {
          background: rgba(0,0,0,0.2);
          padding: 25px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .player-wallet-box .label { font-size: 0.7rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 1.5px; display: block; margin-bottom: 10px; }

        .game-features-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 0.9rem;
        }
        .feature-item i { color: #53fc18; width: 20px; }

        .player-main {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .game-container-inner {
          background: #0d1117;
          border-radius: 30px;
          padding: 40px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 40px 100px rgba(0,0,0,0.4);
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .game-wrapper { width: 100%; }

        .login-prompt-box { text-align: center; max-width: 400px; margin: 0 auto; }
        .lock-icon-large { font-size: 4rem; margin-bottom: 25px; }
        .login-prompt-box h2 { font-size: 2rem; font-weight: 900; margin-bottom: 15px; }
        .login-prompt-box p { color: var(--text-secondary); margin-bottom: 30px; }

        .game-footer-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .stat {
          background: rgba(255,255,255,0.03);
          padding: 20px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
          text-align: center;
        }
        .s-label { display: block; font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 1px; margin-bottom: 5px; }
        .s-value { font-size: 1.2rem; font-weight: 900; color: #fff; }

        .icon-glow { position: relative; display: inline-block; }
        .icon-glow::after { content: ''; position: absolute; inset: -20px; background: #53fc18; filter: blur(40px); opacity: 0.2; z-index: -1; }

        @media (max-width: 1100px) {
          .player-layout { grid-template-columns: 1fr; }
          .player-sidebar { position: static; }
        }
      `}</style>

    </main>
  );
}
