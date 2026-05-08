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
    <div className="gp-wrap">
      <div className="chicken-display">
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
              <button 
                key={i} 
                className={`chicken-card-new ${state}`} 
                onClick={() => !result && pick(i)} 
                disabled={playing || !!result}
              >
                <div className="chicken-card-inner">
                  <div className="chi-emoji">{revealed !== null && isWinner ? '🌟' : CHICKEN_EMOJIS[i]}</div>
                  <div className="chi-name">{name}</div>
                  {revealed !== null && isWinner && <div className="chi-badge">5X</div>}
                </div>
              </button>
            );
          })}
        </div>

        {result && (
          <div className={`chicken-result-overlay ${result.result === 'win' ? 'win' : 'loss'}`}>
             <div className="res-icon">{result.result === 'win' ? '🎸' : '🍗'}</div>
             <div className="res-text">{result.result === 'win' ? `ROCKSTAR! +${result.payout} COINS` : `FAILED! -${bet} COINS`}</div>
             <button className="gp-adj" onClick={reset}>PLAY AGAIN</button>
          </div>
        )}
      </div>

      <div className="gp-controls">
        {!result ? (
          <>
            <div className="gp-label">PLACE YOUR BET TO START</div>
            <div className="gp-bet-row">
              <span className="gp-coin-icon">🪙</span>
              <input className="gp-bet-input" type="number" value={bet} min={1} onChange={e => setBet(Math.max(1, +e.target.value))} />
              <button className="gp-adj" onClick={() => setBet(Math.max(1, Math.floor(bet / 2)))}>½</button>
              <button className="gp-adj gp-adj-2x" style={{'--adj-c':'#53fc18'}} onClick={() => setBet(bet * 2)}>2×</button>
            </div>
            <div className="chi-hint">Select a chicken above to play</div>
          </>
        ) : (
          <div className="gp-stats">
            <div className="gp-stat"><span>BET</span><strong>{bet} 🪙</strong></div>
            <div className="gp-stat"><span>OUTCOME</span><strong>{result.result === 'win' ? 'WINNER' : 'LOSER'}</strong></div>
            <div className="gp-stat"><span>PAYOUT</span><strong>{result.result === 'win' ? result.payout : 0} 🪙</strong></div>
          </div>
        )}
      </div>

      <style jsx>{`
        ${sharedStyles}
        .chicken-display {
          min-height: 300px;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 40px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .chicken-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
          max-width: 600px;
        }

        .chicken-card-new {
          background: #11141b;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 2px;
          cursor: pointer;
          transition: all 0.3s;
          flex: 1 1 120px;
          max-width: 140px;
        }
        .chicken-card-new:hover:not(:disabled) {
          border-color: #53fc18;
          transform: translateY(-8px);
          box-shadow: 0 10px 20px rgba(83,252,24,0.1);
        }
        .chicken-card-new.rockstar { border-color: #f59e0b; background: rgba(245,158,11,0.1); box-shadow: 0 0 30px rgba(245,158,11,0.2); }
        .chicken-card-new.loser { opacity: 0.4; filter: grayscale(1); }
        .chicken-card-new.neutral { opacity: 0.3; }

        .chicken-card-inner {
          background: #11141b;
          border-radius: 18px;
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          height: 100%;
          position: relative;
        }
        .chi-emoji { font-size: 3rem; transition: transform 0.3s; }
        .chicken-card-new:hover .chi-emoji { transform: scale(1.1); }
        .chi-name { font-size: 0.8rem; font-weight: 800; color: rgba(255,255,255,0.4); letter-spacing: 1px; }
        .chi-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #f59e0b;
          color: #000;
          font-weight: 900;
          font-size: 0.7rem;
          padding: 4px 8px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(245,158,11,0.3);
        }

        .chicken-result-overlay {
          position: absolute;
          inset: 0;
          backdrop-filter: blur(8px);
          background: rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          z-index: 10;
        }
        .res-icon { font-size: 4rem; }
        .res-text { font-size: 1.5rem; font-weight: 900; color: #fff; letter-spacing: 1px; }

        .chi-hint { font-size: 0.75rem; color: rgba(255,255,255,0.25); text-align: center; font-weight: 700; }
      `}</style>
    </div>
  );
}

const sharedStyles = `
  .gp-wrap { display: flex; flex-direction: column; }
  .gp-controls { display: flex; flex-direction: column; gap: 20px; padding: 28px 24px; }
  .gp-label { font-size: 0.65rem; font-weight: 900; letter-spacing: 2px; color: rgba(255,255,255,0.3); }
  .gp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .gp-stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 14px 10px; text-align: center; display: flex; flex-direction: column; gap: 6px; }
  .gp-stat span { font-size: 0.6rem; font-weight: 800; color: rgba(255,255,255,0.3); letter-spacing: 1.5px; }
  .gp-stat strong { font-size: 1.1rem; font-weight: 900; color: #fff; }
  .gp-bet-row { display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 6px 14px; }
  .gp-coin-icon { font-size: 1.3rem; }
  .gp-bet-input { flex: 1; background: transparent; border: none; color: #fff; font-size: 1.2rem; font-weight: 900; outline: none; font-family: inherit; }
  .gp-adj { padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); font-weight: 900; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
  .gp-adj:hover { background: rgba(255,255,255,0.1); color: #fff; }
`;
