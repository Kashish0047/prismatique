'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const GRID_SIZE = 25;

export default function MinesGame({ user, onCoinsUpdate }) {
  const [mineCount, setMineCount] = useState(5);
  const [bet, setBet] = useState(10);
  const [gameActive, setGameActive] = useState(false);
  const [revealed, setRevealed] = useState([]); // array of {index, safe}
  const [result, setResult] = useState(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);

  const startGame = () => {
    setGameActive(true);
    setRevealed([]);
    setResult(null);
    setCurrentMultiplier(1);
  };

  const reveal = async (index) => {
    if (!gameActive || revealed.find(r => r.index === index) || loading) return;
    setLoading(true);
    const revealedSafe = revealed.filter(r => r.safe).length;
    try {
      const res = await fetch(`${API}/games/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, game: 'mines', betAmount: bet, params: { mineCount, revealedSafe } })
      });
      const data = await res.json();
      if (!data.success) { setResult({ error: data.message }); setGameActive(false); setLoading(false); return; }
      const hitMine = data.details.hitMine;
      setRevealed(prev => [...prev, { index, safe: !hitMine }]);
      if (hitMine) {
        setResult(data);
        setGameActive(false);
        onCoinsUpdate(data.coins);
      } else {
        setCurrentMultiplier(data.details.multiplier);
        onCoinsUpdate(data.coins);
      }
    } catch (e) { setResult({ error: 'Server error' }); setGameActive(false); }
    setLoading(false);
  };

  const cashout = async () => {
    if (!gameActive || revealed.filter(r => r.safe).length === 0) return;
    setGameActive(false);
    const safePayout = Math.floor(bet * currentMultiplier);
    setResult({ result: 'win', payout: safePayout, coins: null });
  };

  return (
    <div className="gp-wrap">
      {/* Game Display */}
      <div className="mines-display">
        {!gameActive && !result && (
          <div className="mines-idle">
             <div className="mines-idle-icon">💣</div>
             <p>Select mines and start playing!</p>
          </div>
        )}

        {result && (
          <div className={`mines-result-overlay ${result.result === 'win' ? 'win' : 'loss'}`}>
            <div className="res-icon">{result.result === 'win' ? '💎' : '💥'}</div>
            <div className="res-text">{result.result === 'win' ? `+${result.payout} COINS` : `BOOM! -${bet} COINS`}</div>
            <button className="gp-adj" onClick={() => setResult(null)}>PLAY AGAIN</button>
          </div>
        )}

        {(gameActive || (result && !result.error)) && (
          <div className="mines-grid">
            {Array.from({ length: GRID_SIZE }).map((_, i) => {
              const cell = revealed.find(r => r.index === i);
              return (
                <button 
                  key={i} 
                  className={`mine-cell ${cell ? (cell.safe ? 'safe' : 'mine') : ''}`} 
                  onClick={() => reveal(i)}
                  disabled={!gameActive || !!cell || loading}
                >
                  {cell ? (cell.safe ? '💎' : '💥') : ''}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="gp-controls">
        {!gameActive ? (
          <>
            <div className="mines-config">
              <label className="gp-label">NUMBER OF MINES</label>
              <div className="mines-input-row">
                 <input type="range" min={1} max={24} value={mineCount} onChange={e => setMineCount(Number(e.target.value))} className="gp-slider" style={{'--pct': `${(mineCount/24)*100}%`}} />
                 <div className="mines-count-badge">{mineCount}</div>
              </div>
            </div>

            <div className="gp-bet-row">
              <span className="gp-coin-icon">🪙</span>
              <input className="gp-bet-input" type="number" value={bet} min={1} onChange={e => setBet(Math.max(1, +e.target.value))} />
              <button className="gp-adj" onClick={() => setBet(Math.max(1, Math.floor(bet / 2)))}>½</button>
              <button className="gp-adj gp-adj-2x" style={{'--adj-c':'#f59e0b'}} onClick={() => setBet(bet * 2)}>2×</button>
            </div>

            <button className="gp-play-btn gp-play-mines" onClick={startGame}>💣 START GAME</button>
          </>
        ) : (
          <>
            <div className="gp-stats">
              <div className="gp-stat"><span>MINES</span><strong>{mineCount}</strong></div>
              <div className="gp-stat"><span>MULTIPLIER</span><strong>{currentMultiplier.toFixed(2)}×</strong></div>
              <div className="gp-stat"><span>PROFIT</span><strong>{Math.floor(bet * currentMultiplier) - bet} 🪙</strong></div>
            </div>
            
            <button className="gp-play-btn gp-cashout" onClick={cashout} disabled={revealed.filter(r => r.safe).length === 0}>
               💰 CASHOUT {Math.floor(bet * currentMultiplier)}
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        ${sharedStyles}
        .mines-display {
          min-height: 350px;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
        }
        .mines-idle { text-align: center; }
        .mines-idle-icon { font-size: 4rem; margin-bottom: 12px; }
        .mines-idle p { color: rgba(255,255,255,0.3); font-weight: 600; }

        .mines-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          width: 100%;
          max-width: 320px;
        }
        .mine-cell {
          aspect-ratio: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mine-cell:hover:not(:disabled) {
          background: rgba(245,158,11,0.1);
          border-color: #f59e0b;
          transform: scale(1.05);
        }
        .mine-cell.safe { background: rgba(83,252,24,0.15); border-color: #53fc18; }
        .mine-cell.mine { background: rgba(239,68,68,0.2); border-color: #ef4444; animation: shake 0.3s; }

        .mines-result-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          backdrop-filter: blur(8px);
          background: rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          animation: fadeIn 0.3s;
        }
        .res-icon { font-size: 4rem; }
        .res-text { font-size: 1.5rem; font-weight: 900; color: #fff; letter-spacing: 1px; }

        .mines-config { display: flex; flex-direction: column; gap: 8px; }
        .mines-input-row { display: flex; align-items: center; gap: 16px; }
        .mines-count-badge {
          background: #f59e0b;
          color: #000;
          font-weight: 900;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .gp-play-mines { background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; }
        .gp-cashout { background: linear-gradient(135deg, #53fc18, #10b981); color: #000; }
        .gp-play-mines:hover:not(:disabled) { box-shadow: 0 0 32px rgba(245,158,11,0.4); }
        .gp-cashout:hover:not(:disabled) { box-shadow: 0 0 32px rgba(83,252,24,0.4); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
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
  .gp-play-btn { width: 100%; padding: 18px; border: none; border-radius: 16px; font-size: 1.05rem; font-weight: 900; letter-spacing: 2px; cursor: pointer; transition: all 0.25s; font-family: inherit; }
  .gp-play-btn:hover:not(:disabled) { transform: translateY(-2px); }
  .gp-play-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .gp-slider { width: 100%; height: 6px; cursor: pointer; border-radius: 3px; accent-color: #f59e0b; }
`;
