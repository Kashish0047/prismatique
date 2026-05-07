'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LimboGame({ user, onCoinsUpdate }) {
  const [targetMultiplier, setTargetMultiplier] = useState(2.0);
  const [bet, setBet] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const [animValue, setAnimValue] = useState(null);

  const play = async () => {
    if (!user) return;
    setPlaying(true);
    setResult(null);
    setAnimValue(null);
    try {
      const res = await fetch(`${API}/games/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, game: 'limbo', betAmount: bet, params: { targetMultiplier } })
      });
      const data = await res.json();
      if (data.success) {
        // Animate
        let count = 1.0;
        const target = data.details.randomMultiplier;
        const step = Math.max(0.1, target / 20);
        const interval = setInterval(() => {
          count = parseFloat((count + step).toFixed(2));
          if (count >= target) { count = target; clearInterval(interval); }
          setAnimValue(count);
        }, 50);
        setTimeout(() => {
          setResult(data);
          onCoinsUpdate(data.coins);
        }, 1200);
      } else {
        setResult({ error: data.message });
      }
    } catch (e) {
      setResult({ error: 'Server error' });
    }
    setPlaying(false);
  };

  const winChance = Math.max(1, Math.min(99, parseFloat((97 / targetMultiplier).toFixed(1))));

  return (
    <div className="game-panel">
      <div className="limbo-display">
        <div className={`limbo-number ${result ? (result.result === 'win' ? 'win' : result.result === 'loss' ? 'loss' : '') : ''}`}>
          {animValue !== null ? `${animValue}x` : result ? `${result.details.randomMultiplier}x` : '—'}
        </div>
        {result && !result.error && (
          <div className="result-label">{result.result === 'win' ? `+${result.payout} coins 🎉` : `Lost ${bet} coins 💔`}</div>
        )}
        {result?.error && <div className="game-error">{result.error}</div>}
      </div>

      <div className="game-controls">
        <div className="limbo-target-row">
          <label>Target Multiplier</label>
          <div className="limbo-target-input">
            <button onClick={() => setTargetMultiplier(t => Math.max(1.01, parseFloat((t - 0.5).toFixed(2))))}>-</button>
            <input type="number" value={targetMultiplier} min={1.01} step={0.5}
              onChange={e => setTargetMultiplier(Math.max(1.01, parseFloat(e.target.value)))} />
            <button onClick={() => setTargetMultiplier(t => parseFloat((t + 0.5).toFixed(2)))}>+</button>
          </div>
        </div>

        <div className="game-stats-row">
          <div className="game-stat"><span>Win Chance</span><strong>{winChance}%</strong></div>
          <div className="game-stat"><span>Multiplier</span><strong>{targetMultiplier}x</strong></div>
          <div className="game-stat"><span>Payout</span><strong>{Math.floor(bet * targetMultiplier)} 🪙</strong></div>
        </div>

        <div className="bet-row">
          <div className="bet-input-group"><span>🪙</span>
            <input type="number" value={bet} min={1} onChange={e => setBet(Math.max(1, Number(e.target.value)))} />
          </div>
          <button className="half-btn" onClick={() => setBet(Math.max(1, Math.floor(bet / 2)))}>½</button>
          <button className="double-btn" onClick={() => setBet(bet * 2)}>2x</button>
        </div>

        <button className="game-play-btn" onClick={play} disabled={playing}>
          {playing ? '⏳ LAUNCHING...' : '🚀 LAUNCH LIMBO'}
        </button>
      </div>
    </div>
  );
}
