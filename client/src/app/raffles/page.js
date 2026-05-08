'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function RafflesPage() {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('prism_auth_v2');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setCoins(parsed.coins || 0);
      } catch (e) {}
    }
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
            <h1 className="section-title">DAILY <span className="highlight-blue">RAFFLES & GIVEAWAYS</span></h1>
            <p className="page-subtitle">Participate in exclusive daily events and win massive crypto prizes.</p>
          </motion.div>

          <div className="raffle-grid">
            <motion.div whileHover={{ y: -5 }} className="raffle-card active-raffle">
              <div className="raffle-badge pulse-badge">LIVE NOW</div>
              <div className="raffle-prize">$500 KICK COMMUNITY DROP</div>
              <p>Entry requires 500 Coins wagered today.</p>
              <div className="raffle-progress">
                <div className="progress-bar"><div className="progress-fill" style={{width: '75%'}}></div></div>
                <div className="progress-labels"><span>750/1000 ENTRIES</span><span>ENDS IN 4H</span></div>
              </div>
              <button className="raffle-btn disabled">ENTER RAFFLE (LOCKED)</button>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="raffle-card">
              <div className="raffle-badge upcoming">UPCOMING</div>
              <div className="raffle-prize">WEEKLY $2000 MEGA DRAW</div>
              <p>Top 50 on the wager leaderboard automatically entered.</p>
              <div className="raffle-progress">
                <div className="progress-labels" style={{justifyContent: 'center'}}><span>STARTS IN 2 DAYS</span></div>
              </div>
              <button className="raffle-btn outline">VIEW REQUIREMENTS</button>
            </motion.div>
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
