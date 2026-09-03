'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function RafflesPage() {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState({});
  const [busy, setBusy] = useState(null);

  const fetchRaffles = async () => {
    try {
      const res = await fetch(`${API}/sn/raffles?status=all`);
      const data = await res.json();
      if (data.success) setRaffles(data.data);
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

    fetchRaffles();
  }, []);

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

  const buyTickets = async (raffle) => {
    if (!user) { toast.error('Log in first to enter!', { position: 'top-center' }); return; }
    const n = qty[raffle.id] || 1;
    setBusy(raffle.id);
    try {
      const res = await fetch(`${API}/sn/raffles/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, prizeId: raffle.slug || raffle.id, ticketCount: n })
      });
      const data = await res.json();
      if (data.success) { toast.success(`Bought ${n} ticket${n > 1 ? 's' : ''}!`); fetchRaffles(); }
      else toast.warning(data.message || 'Could not buy tickets');
    } catch (e) {
      toast.error('Purchase failed. Try again.');
    } finally {
      setBusy(null);
    }
  };

  const setQ = (id, v) => setQty(q => ({ ...q, [id]: Math.max(1, (q[id] || 1) + v) }));

  return (
    <main className="min-h-screen bg-dark">
      <Navbar user={user} onLogout={handleLogout} onLoginClick={startLogin} coins={coins} />

      <section className="section-padding pt-32">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="section-title">RAFFLES & <span className="highlight-blue">GIVEAWAYS</span></h1>
            <p className="page-subtitle">Spend your points on tickets. Winners are drawn on StreamNeeds.</p>
          </motion.div>

          <div className="raffle-grid cards-grid-spacious">
            {loading ? (
              <div className="text-center py-20 w-full opacity-50">LOADING RAFFLES...</div>
            ) : raffles.length > 0 ? (
              raffles.map((raffle) => {
                const active = raffle.status === 'active';
                const drawn = raffle.status === 'drawn';
                const n = qty[raffle.id] || 1;
                return (
                  <motion.div key={raffle.id} whileHover={{ y: -5 }} className={`raffle-card ${active ? 'active-raffle' : ''}`}>
                    <div className={`raffle-badge ${active ? 'pulse-badge' : drawn ? '' : 'upcoming'}`}>
                      {active ? 'LIVE NOW' : (raffle.status || '').toUpperCase()}
                    </div>
                    {raffle.image && <img src={raffle.image} alt={raffle.title} className="raffle-img" />}
                    <div className="raffle-prize">{raffle.title}</div>
                    {raffle.description && <p>{raffle.description}</p>}

                    <div className="raffle-progress">
                      <div className="progress-labels">
                        <span>🎟️ {raffle.ticketPrice} pts / ticket</span>
                        <span>{raffle.totalTickets} sold · {raffle.totalEntries} entrants</span>
                      </div>
                    </div>

                    {drawn && raffle.winner ? (
                      <div className="raffle-winner">🏆 Winner: <strong>{raffle.winner.username}</strong> (ticket #{raffle.winner.winningTicketNumber})</div>
                    ) : active ? (
                      <div className="raffle-buy">
                        <div className="qty-stepper">
                          <button type="button" onClick={() => setQ(raffle.id, -1)}>−</button>
                          <span>{n}</span>
                          <button type="button" onClick={() => setQ(raffle.id, 1)}>+</button>
                        </div>
                        <button className="raffle-btn" disabled={busy === raffle.id} onClick={() => buyTickets(raffle)}>
                          {busy === raffle.id ? 'BUYING…' : `BUY (${raffle.ticketPrice * n} pts)`}
                        </button>
                      </div>
                    ) : (
                      <button className="raffle-btn outline" disabled>NOT OPEN</button>
                    )}

                    {raffle.drawDate && <div className="raffle-draw-date">Draws {new Date(raffle.drawDate).toLocaleString()}</div>}
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-20 w-full opacity-50">NO RAFFLES RIGHT NOW. CREATE ONE IN STREAMNEEDS.</div>
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
