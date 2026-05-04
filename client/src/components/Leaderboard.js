'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Podium from './Podium';

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('monthly');

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/leaderboard`);
      const result = await res.json();
      if (result.success) {
        setPlayers(result.data);
        startCountdown(result.endsAt);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLoading(false);
    }
  };

  const startCountdown = (endTime) => {
    const targetTime = new Date(endTime).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetTime - now;
      if (distance < 0) return;
      setTimeLeft({
        days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        minutes: String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        seconds: String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0')
      });
    };
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  };

  const top3 = players.slice(0, 3);
  const remaining = players.slice(3);

  return (
    <section id="leaderboard" className="leaderboard-section">
      <div className="container">
        <header className="leaderboard-header">
          <h2 className="section-title">LEADERBOARD <span className="highlight-blue">RANKINGS</span></h2>
          <div className="leaderboard-filters">
            <button className={`filter-btn ${filter === 'weekly' ? 'active' : ''}`} onClick={() => setFilter('weekly')}>WEEKLY</button>
            <button className={`filter-btn ${filter === 'monthly' ? 'active' : ''}`} onClick={() => setFilter('monthly')}>MONTHLY</button>
            <button className={`filter-btn ${filter === 'alltime' ? 'active' : ''}`} onClick={() => setFilter('alltime')}>ALL TIME</button>
          </div>
        </header>

        <Podium top3={top3} />

        <div className="countdown-mini">
          <span className="small-label">LEADERBOARD ENDS IN</span>
          <span className="timer-mini">{timeLeft.days}D : {timeLeft.hours}H : {timeLeft.minutes}M : {timeLeft.seconds}S</span>
        </div>

        <div className="leaderboard-list">
          <AnimatePresence>
            {remaining.map((player, index) => (
              <motion.div 
                key={player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="leaderboard-row"
              >
                <div className="row-rank">{index + 4}</div>
                <div className="row-user">
                  <div className="row-avatar">👤</div>
                  <div className="row-name-group">
                    <div className="row-name">{player.username}</div>
                    <div className="row-badges">{player.badges?.map((b, i) => <span key={i}>{b}</span>)}</div>
                  </div>
                </div>
                <div className="row-xp">
                  <span className="small-label">LEVEL {player.level}</span>
                  <div className="xp-bar-container">
                    <div className="xp-bar-fill" style={{ width: `${(player.xp % 100)}%` }}></div>
                  </div>
                </div>
                <div className="row-wager">
                  <span className="small-label">WAGERED</span>
                  <div>${player.wageredUsd.toLocaleString()}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
