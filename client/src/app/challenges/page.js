'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ChallengesPage() {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    try {
      const res = await fetch(`${API}/challenges`);
      const data = await res.json();
      if (data.success) setChallenges(data.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

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

    fetchChallenges();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('prism_auth_v2');
    sessionStorage.setItem('just_logged_out', 'true');
    setUser(null);
    setCoins(0);
    window.location.replace(window.location.pathname);
  };

  const handleEntry = async (id) => {
    if (!user) {
      toast.error('Log in first to join!', { position: 'top-center' });
      return;
    }
    try {
      const res = await fetch(`${API}/challenges/${id}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchChallenges();
      } else {
        toast.warning(data.message);
      }
    } catch (err) {
      toast.error('Failed to join. Please try again.');
    }
  };

  const startLogin = () => {
    sessionStorage.removeItem('just_logged_out');
    window.location.href = `${API}/auth/kick?return_to=${encodeURIComponent(window.location.pathname)}`;
  };

  return (
    <main className="min-h-screen bg-dark">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onLoginClick={startLogin}
        coins={coins}
      />

      <section className="section-padding pt-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="section-title">COMMUNITY <span className="highlight-blue">CHALLENGES</span></h1>
            <p className="page-subtitle">Complete challenges and objectives to earn exclusive rewards.</p>
          </motion.div>

          <div className="raffle-grid cards-grid-spacious">
            {loading ? (
              <div className="text-center py-20 w-full opacity-50">LOADING CHALLENGES...</div>
            ) : challenges.length > 0 ? (
              challenges.map((challenge) => {
                const enterable = challenge.type === 'enterable';
                const isActive = challenge.status === 'active';
                return (
                  <motion.div key={challenge._id} whileHover={{ y: -5 }} className={`raffle-card ${isActive ? 'active-raffle' : ''}`}>
                    <div className={`raffle-badge ${isActive ? 'pulse-badge' : challenge.status === 'upcoming' ? 'upcoming' : ''}`}>
                      {isActive ? 'LIVE NOW' : challenge.status.toUpperCase()}
                    </div>
                    <div className="raffle-prize">{challenge.prize} {challenge.title}</div>
                    <p>{challenge.description || challenge.requirement || 'No specific requirements.'}</p>

                    {challenge.requirement && challenge.description && (
                      <p className="challenge-req"><strong>Requirement:</strong> {challenge.requirement}</p>
                    )}

                    {enterable && (
                      <div className="raffle-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.min((challenge.entries / challenge.maxEntries) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="progress-labels">
                          <span>{challenge.entries}/{challenge.maxEntries} JOINED</span>
                          <span>{isActive ? 'ENDS SOON' : 'UPCOMING'}</span>
                        </div>
                      </div>
                    )}

                    {enterable ? (
                      <button
                        className={`raffle-btn ${isActive ? '' : 'outline'}`}
                        onClick={() => handleEntry(challenge._id)}
                      >
                        {isActive ? 'JOIN CHALLENGE' : 'VIEW DETAILS'}
                      </button>
                    ) : (
                      <div className="challenge-type-pill">🎯 OBJECTIVE</div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-20 w-full opacity-50">NO CHALLENGES AVAILABLE AT THE MOMENT.</div>
            )}
          </div>
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
