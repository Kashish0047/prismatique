'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CHICKEN_NAMES = ['Clucky', 'Drumstick', 'Feathers', 'Nugget', 'Rockstar'];
const CHICKEN_EMOJIS = ['🐔', '🐓', '🐣', '🍗', '🌟'];

export default function ChickenGame({ user, onCoinsUpdate }) {
  const [bet, setBet] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(null);

  const pick = async (index) => {
    if (playing) return;
    setPlaying(true);
    setResult(null);
    setRevealed(null);
    try {
      const res = await fetch(`${API}/games/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, game: 'chicken', betAmount: bet, params: { pick: index } })
      });
      const data = await res.json();
      if (data.success) {
        setRevealed(data.details.winnerIndex);
        setResult({ ...data, pick: index });
        onCoinsUpdate(data.coins);
      } else {
        setResult({ error: data.message });
      }
    } catch (e) { setResult({ error: 'Server error' }); }
    setPlaying(false);
  };

  const reset = () => { setResult(null); setRevealed(null); };

  return (
    <div className="game-panel">
      <div className="chicken-header">
        <div className="chicken-title">🌟 Find the ROCKSTAR Chicken!</div>
        <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', marginBottom:'20px'}}>Pick the right chicken to win 5x your bet!</p>
      </div>

      <div className="chicken-grid">
        {CHICKEN_NAMES.map((name, i) => {
          const isWinner = revealed === i;
          const isMyPick = result && result.pick === i;
          let state = '';
          if (revealed !== null) {
            if (isWinner) state = 'rockstar';
            else if (isMyPick) state = 'loser';
            else state = 'neutral';
          }
          return (
            <button key={i} className={`chicken-card ${state}`} onClick={() => !result && pick(i)} disabled={playing || !!result}>
              <div className="chicken-emoji">{revealed !== null && isWinner ? '🌟' : CHICKEN_EMOJIS[i]}</div>
              <div className="chicken-name">{name}</div>
              {revealed !== null && isWinner && <div className="rockstar-badge">ROCKSTAR!</div>}
            </button>
          );
        })}
      </div>

      {result && (
        <div className={`chicken-result ${result.result === 'win' ? 'win' : 'loss'}`}>
          {result.error ? <div className="game-error">{result.error}</div> : (
            <>
              <strong>{result.result === 'win' ? `🎸 You found the Rockstar! +${result.payout} coins!` : `❌ Wrong chicken! Lost ${bet} coins.`}</strong>
              <button className="game-play-btn" style={{marginTop:'15px', display:'block', width:'100%'}} onClick={reset}>PLAY AGAIN</button>
            </>
          )}
        </div>
      )}

      {!result && (
        <div className="bet-row" style={{marginTop:'20px'}}>
          <div className="bet-input-group"><span>🪙</span>
            <input type="number" value={bet} min={1} onChange={e => setBet(Math.max(1, Number(e.target.value)))} />
          </div>
          <button className="half-btn" onClick={() => setBet(Math.max(1, Math.floor(bet / 2)))}>½</button>
          <button className="double-btn" onClick={() => setBet(bet * 2)}>2x</button>
        </div>
      )}
    </div>
  );
}
