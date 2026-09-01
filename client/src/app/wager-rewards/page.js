'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function PodiumSlot({ entry, place, medal }) {
  return (
    <div className={`podium-item ${place}`}>
      <div className="podium-rank-badge">RANK {place === 'first' ? 1 : place === 'second' ? 2 : 3}</div>
      <div className="podium-avatar" style={place === 'first' ? { fontSize: '50px' } : {}}>
        {entry?.avatar ? <img src={entry.avatar} alt={entry.username} className="wr-podium-img" /> : medal}
      </div>
      <div className="podium-name" style={place === 'first' ? { fontSize: '1.4rem' } : {}}>{entry?.username || '---'}</div>
      <div className="small-label">POINTS</div>
      <div className="podium-value" style={place === 'first' ? { fontSize: '2rem' } : {}}>
        {(entry?.points || 0).toLocaleString()}
      </div>
    </div>
  );
}

export default function WagerRewardsPage() {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);

  const [boards, setBoards] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [standings, setStandings] = useState([]);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('prism_auth_v2');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setCoins(parsed.coins || 0);
      } catch (e) {}
    }

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
      window.location.href = window.location.pathname;
    }
  }, []);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await fetch(`${API}/leaderboards`);
        const data = await res.json();
        if (data.success && data.data.length) {
          setBoards(data.data);
          setActiveId(data.data[0]._id);
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  const fetchStandings = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API}/leaderboards/${id}/standings`);
      const data = await res.json();
      setBoard(data.board || null);
      setStandings(data.standings || []);
      if (!data.success) setMessage(data.message || 'Leaderboard data is temporarily unavailable.');
    } catch (e) {
      setMessage('Could not load leaderboard.');
      setStandings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeId) fetchStandings(activeId);
  }, [activeId, fetchStandings]);

  useEffect(() => {
    if (!activeId) return;
    const t = setInterval(() => fetchStandings(activeId), 60000);
    return () => clearInterval(t);
  }, [activeId, fetchStandings]);

  const handleLogout = () => {
    localStorage.removeItem('prism_auth_v2');
    sessionStorage.setItem('just_logged_out', 'true');
    setUser(null);
    setCoins(0);
    window.location.replace(window.location.pathname);
  };

  const startLogin = () => {
    sessionStorage.removeItem('just_logged_out');
    window.location.href = `${API}/auth/kick?return_to=${encodeURIComponent(window.location.pathname)}`;
  };

  const top3 = standings.slice(0, 3);
  const rest = standings.slice(3);
  const periodStart = board?.periodStartedAt ? new Date(board.periodStartedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <main className="min-h-screen bg-dark">
      <Navbar user={user} onLogout={handleLogout} onLoginClick={startLogin} coins={coins} />

      <section className="section-padding pt-32">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="section-title">WAGER <span className="highlight-blue">REWARDS</span></h1>
            <p className="page-subtitle">Wager on our partner casinos to climb the board and win monthly prizes.</p>
          </motion.div>

          {boards.length === 0 && !loading ? (
            <div className="rewards-content-wrapper">
              <div className="wager-rewards-coming">
                <div className="coming-soon-card-premium">
                  <div className="glass-effect"></div>
                  <div className="coming-soon-icon">🏆</div>
                  <h3>WAGER REWARDS</h3>
                  <p>Our wager leaderboard is being set up. Check back soon for live standings and monthly prize pools.</p>
                  <div className="coming-soon-badge-premium">
                    <span className="pulse-dot"></span>
                    LAUNCHING SOON
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {boards.length > 1 && (
                <div className="leaderboard-filters wr-filters">
                  {boards.map((b) => (
                    <button
                      key={b._id}
                      className={`filter-btn ${activeId === b._id ? 'active' : ''}`}
                      onClick={() => setActiveId(b._id)}
                    >
                      {b.platform || b.name}
                    </button>
                  ))}
                </div>
              )}

              {board && (
                <div className="wr-meta">
                  {board.prizeText && <div className="wr-prize">{board.prizeText}</div>}
                  <div className="wr-reset-note">
                    🔄 Resets monthly{periodStart ? ` · current period started ${periodStart}` : ''}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-20 w-full opacity-50">LOADING STANDINGS...</div>
              ) : message ? (
                <div className="text-center py-20 w-full opacity-60">{message}</div>
              ) : standings.length === 0 ? (
                <div className="text-center py-20 w-full opacity-50">NO STANDINGS YET FOR THIS PERIOD.</div>
              ) : (
                <>
                  <div className="podium-container">
                    <PodiumSlot entry={top3[1]} place="second" medal="🥈" />
                    <PodiumSlot entry={top3[0]} place="first" medal="🏆" />
                    <PodiumSlot entry={top3[2]} place="third" medal="🥉" />
                  </div>

                  <div className="leaderboard-list">
                    <AnimatePresence>
                      {rest.map((p, index) => (
                        <motion.div
                          key={p.username + index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="leaderboard-row wr-row"
                        >
                          <div className="row-rank">{index + 4}</div>
                          <div className="row-user">
                            <div className="row-avatar">
                              {p.avatar ? <img src={p.avatar} alt={p.username} className="wr-row-img" /> : '👤'}
                            </div>
                            <div className="row-name-group">
                              <div className="row-name">{p.username}</div>
                            </div>
                          </div>
                          <div className="row-wager">
                            <span className="small-label">POINTS</span>
                            <div>{(p.points || 0).toLocaleString()}</div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <footer>
        <div className="container">
          <p>&copy; 2024 PRISMATIQUE. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </main>
  );
}
