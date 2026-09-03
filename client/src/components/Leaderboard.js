'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const DISCORD_URL = 'https://discord.gg/DVMcvPhVHA';

function PodiumSlot({ entry, place, medal, metric, reward }) {
  const rankNum = place === 'first' ? 1 : place === 'second' ? 2 : 3;
  return (
    <div className={`podium-item ${place}`}>
      <div className="podium-rank-badge">RANK {rankNum}</div>
      <div className="podium-avatar" style={place === 'first' ? { fontSize: '50px' } : {}}>
        {entry?.avatar ? <img src={entry.avatar} alt={entry.username} className="wr-podium-img" /> : medal}
      </div>
      <div className="podium-name" style={place === 'first' ? { fontSize: '1.4rem' } : {}}>{entry?.username || '---'}</div>
      <div className="small-label">{metric}</div>
      <div className="podium-value" style={place === 'first' ? { fontSize: '2rem' } : {}}>
        {(entry?.points || 0).toLocaleString()}
      </div>
      {reward && <div className="podium-reward">🏆 {reward}</div>}
    </div>
  );
}

export default function Leaderboard({ preview = false }) {
  const [boards, setBoards] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [board, setBoard] = useState(null);
  const [standings, setStandings] = useState([]);
  const [count, setCount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
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
    })();
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
      setCount(data.count || (data.standings ? data.standings.length : 0));
      setUpdatedAt(data.updatedAt || new Date().toISOString());
      if (!data.success) setMessage(data.message || 'Leaderboard data is temporarily unavailable.');
    } catch (e) {
      setMessage('Could not load leaderboard.');
      setStandings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (activeId) fetchStandings(activeId); }, [activeId, fetchStandings]);

  useEffect(() => {
    if (!activeId) return;
    const t = setInterval(() => fetchStandings(activeId), 60000);
    return () => clearInterval(t);
  }, [activeId, fetchStandings]);

  const metric = board?.metricLabel || 'WAGER';
  const tiers = board?.prizeTiers || [];
  const rewardFor = (rank) => {
    const t = tiers.find(t => rank >= t.from && rank <= t.to);
    return t ? t.reward : '';
  };
  const hasRewards = tiers.length > 0;
  const top3 = standings.slice(0, 3);
  const rest = preview ? standings.slice(3, 5) : standings.slice(3);
  const updatedTime = updatedAt ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null;

  const tierLabel = (t) => t.from === t.to ? `#${t.from}` : `#${t.from}–#${t.to}`;

  const endMs = board?.endsAt ? new Date(board.endsAt).getTime() : 0;
  const remaining = endMs ? endMs - now : 0;
  const ended = endMs && remaining <= 0;
  const cd = (() => {
    if (!endMs || remaining <= 0) return null;
    const s = Math.floor(remaining / 1000);
    return {
      d: String(Math.floor(s / 86400)).padStart(2, '0'),
      h: String(Math.floor((s % 86400) / 3600)).padStart(2, '0'),
      m: String(Math.floor((s % 3600) / 60)).padStart(2, '0'),
      s: String(s % 60).padStart(2, '0'),
    };
  })();

  if (!loading && boards.length === 0) {
    return (
      <div className="rewards-content-wrapper">
        <div className="wager-rewards-coming">
          <div className="coming-soon-card-premium">
            <div className="glass-effect"></div>
            <div className="coming-soon-icon">🏆</div>
            <h3>LEADERBOARD</h3>
            <p>No active race right now. Check back soon for live standings and prize pools.</p>
            <div className="coming-soon-badge-premium">
              <span className="pulse-dot"></span>
              LAUNCHING SOON
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="leaderboard" className="leaderboard-section">
      <div className="container">
        {!preview && (
          <div className="lb-updated">
            {updatedTime && <span>Updated: {updatedTime}</span>}
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="lb-discord-btn">Join Discord</a>
          </div>
        )}

        {boards.length > 0 && (
          <>
            <div className="lb-select-label">✦ SELECT RACE ✦</div>
            <div className="lb-race-switch">
              {boards.map((b) => {
                const on = activeId === b._id;
                return (
                  <button
                    key={b._id}
                    className={`lb-race-btn ${on ? 'active' : ''}`}
                    onClick={() => setActiveId(b._id)}
                    style={on ? { '--race-accent': b.accentColor || '#00f2ff' } : {}}
                  >
                    <span className="lb-race-name">{b.platform || b.name}</span>
                    <span className="lb-race-sub">{on ? <><span className="lb-live-dot"></span> LIVE</> : 'SWITCH'}</span>
                  </button>
                );
              })}
            </div>
            {board && (
              <div className="lb-showing">
                Showing: <strong>{board.platform || board.name}</strong> · {count} player{count === 1 ? '' : 's'}
              </div>
            )}
          </>
        )}

        {!preview && (cd || ended) && (
          <div className="lb-countdown">
            {ended ? (
              <span className="lb-cd-ended">🏁 THIS RACE HAS ENDED</span>
            ) : (
              <>
                <span className="lb-cd-label">⏳ ENDS IN</span>
                <span className="lb-cd-seg">{cd.d}<i>D</i></span>
                <span className="lb-cd-seg">{cd.h}<i>H</i></span>
                <span className="lb-cd-seg">{cd.m}<i>M</i></span>
                <span className="lb-cd-seg">{cd.s}<i>S</i></span>
              </>
            )}
          </div>
        )}

        {!preview && hasRewards && (
          <div className="lb-prizes">
            {tiers.map((t, i) => (
              <div key={i} className="lb-prize-tier">
                <span className="lb-prize-rank">{tierLabel(t)}</span>
                <span className="lb-prize-reward">{t.reward}</span>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 w-full opacity-50">LOADING STANDINGS...</div>
        ) : message ? (
          <div className="text-center py-20 w-full opacity-60">{message}</div>
        ) : standings.length === 0 ? (
          <div className="text-center py-20 w-full opacity-50">NO STANDINGS YET FOR THIS RACE.</div>
        ) : (
          <>
            <div className="podium-container">
              <PodiumSlot entry={top3[1]} place="second" medal="🥈" metric={metric} reward={rewardFor(2)} />
              <PodiumSlot entry={top3[0]} place="first" medal="🏆" metric={metric} reward={rewardFor(1)} />
              <PodiumSlot entry={top3[2]} place="third" medal="🥉" metric={metric} reward={rewardFor(3)} />
            </div>

            <div className="leaderboard-list">
              <div className={`lb-row-head ${hasRewards ? 'has-reward' : ''}`}>
                <span>#</span>
                <span>PLAYER</span>
                <span className="lb-col-right">{metric}</span>
                {hasRewards && <span className="lb-col-right">REWARD</span>}
              </div>
              <AnimatePresence>
                {rest.map((p, index) => {
                  const rank = index + 4;
                  const reward = rewardFor(rank);
                  return (
                    <motion.div
                      key={p.username + index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`leaderboard-row wr-row ${hasRewards ? 'has-reward' : ''}`}
                    >
                      <div className="row-rank">{rank}</div>
                      <div className="row-user">
                        <div className="row-avatar">
                          {p.avatar ? <img src={p.avatar} alt={p.username} className="wr-row-img" /> : '👤'}
                        </div>
                        <div className="row-name">{p.username}</div>
                      </div>
                      <div className="row-wager">
                        <span className="small-label">{metric}</span>
                        <div>{(p.points || 0).toLocaleString()}</div>
                      </div>
                      {hasRewards && (
                        <div className="row-reward">
                          <span className="small-label">REWARD</span>
                          <div>{reward || '—'}</div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
