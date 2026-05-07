'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DiceGame({ user, onCoinsUpdate }) {
  const [target, setTarget] = useState(50);
  const [direction, setDirection] = useState('over');
  const [bet, setBet] = useState(10);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);

  const chance = direction === 'over' ? (100 - target) : target;
  const multiplier = chance > 0 ? (98 / chance).toFixed(2) : '0.00';

  const roll = async () => {
    if (!user) return;
    setRolling(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/games/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, game: 'dice', betAmount: bet, params: { target, direction } })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        onCoinsUpdate(data.coins);
      } else {
        setResult({ error: data.message });
      }
    } catch (e) {
      setResult({ error: 'Server error' });
    }
    setRolling(false);
  };

  return (
    <div className="game-panel">
      <div className="game-result-display">
        {result ? (
          result.error ? <div className="game-error">{result.error}</div> : (
            <div className={`dice-result ${result.result}`}>
              <div className="dice-roll-number">{result.details.roll}</div>
              <div className="result-label">{result.result === 'win' ? `+${result.payout} coins 🎉` : `Lost ${bet} coins 💔`}</div>
            </div>
          )
        ) : (
          <div className="dice-idle">
            <div className="dice-icon">🎲</div>
            <p>Set your bet and roll!</p>
          </div>
        )}
      </div>

      <div className="game-controls">
        <div className="direction-toggle">
          <button className={direction === 'under' ? 'dir-btn active' : 'dir-btn'} onClick={() => setDirection('under')}>UNDER</button>
          <div className="target-display">{target}</div>
          <button className={direction === 'over' ? 'dir-btn active' : 'dir-btn'} onClick={() => setDirection('over')}>OVER</button>
        </div>

        <input type="range" min="2" max="98" value={target} onChange={e => setTarget(Number(e.target.value))} className="dice-slider" />

        <div className="game-stats-row">
          <div className="game-stat"><span>Win Chance</span><strong>{chance}%</strong></div>
          <div className="game-stat"><span>Multiplier</span><strong>{multiplier}x</strong></div>
          <div className="game-stat"><span>Payout</span><strong>{Math.floor(bet * multiplier)} 🪙</strong></div>
        </div>

        <div className="bet-row">
          <div className="bet-input-group">
            <span>🪙</span>
            <input type="number" value={bet} min={1} onChange={e => setBet(Math.max(1, Number(e.target.value)))} />
          </div>
          <button className="half-btn" onClick={() => setBet(Math.max(1, Math.floor(bet / 2)))}>½</button>
          <button className="double-btn" onClick={() => setBet(bet * 2)}>2x</button>
        </div>

        <button className="game-play-btn" onClick={roll} disabled={rolling}>
          {rolling ? <span className="spinning">🎲</span> : '🎲 ROLL DICE'}
        </button>
      </div>
    </div>
  );
}
