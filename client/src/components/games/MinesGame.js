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

  const startGame = () => {
    setGameActive(true);
    setRevealed([]);
    setResult(null);
    setCurrentMultiplier(1);
  };

  const reveal = async (index) => {
    if (!gameActive || revealed.find(r => r.index === index)) return;
    const revealedSafe = revealed.filter(r => r.safe).length;
    try {
      const res = await fetch(`${API}/games/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, game: 'mines', betAmount: bet, params: { mineCount, revealedSafe } })
      });
      const data = await res.json();
      if (!data.success) { setResult({ error: data.message }); setGameActive(false); return; }
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
  };

  const cashout = async () => {
    if (!gameActive || revealed.filter(r => r.safe).length === 0) return;
    setGameActive(false);
    const safePayout = Math.floor(bet * currentMultiplier);
    setResult({ result: 'win', payout: safePayout, coins: null });
  };

  return (
    <div className="game-panel">
      {!gameActive && !result && (
        <div className="game-controls">
          <div className="mines-setup">
            <label>Mines: <strong>{mineCount}</strong></label>
            <input type="range" min={1} max={20} value={mineCount} onChange={e => setMineCount(Number(e.target.value))} />
          </div>
          <div className="bet-row">
            <div className="bet-input-group"><span>🪙</span>
              <input type="number" value={bet} min={1} onChange={e => setBet(Math.max(1, Number(e.target.value)))} />
            </div>
            <button className="half-btn" onClick={() => setBet(Math.max(1, Math.floor(bet / 2)))}>½</button>
            <button className="double-btn" onClick={() => setBet(bet * 2)}>2x</button>
          </div>
          <button className="game-play-btn" onClick={startGame}>💣 START MINES</button>
        </div>
      )}

      {result && (
        <div className={`mines-result ${result.result === 'win' ? 'win' : 'loss'}`}>
          {result.error ? <div className="game-error">{result.error}</div> : (
            <>
              <div className="result-big">{result.result === 'win' ? '💰' : '💥'}</div>
              <div>{result.result === 'win' ? `+${result.payout} coins!` : `Hit a mine! Lost ${bet} coins.`}</div>
              <button className="game-play-btn" style={{marginTop:'15px'}} onClick={() => { setResult(null); }}>PLAY AGAIN</button>
            </>
          )}
        </div>
      )}

      {gameActive && (
        <>
          <div className="mines-info">
            <span>💣 {mineCount} Mines</span>
            <span>Multiplier: <strong>{currentMultiplier}x</strong></span>
            <button className="cashout-btn" onClick={cashout}>CASHOUT 💰</button>
          </div>
          <div className="mines-grid">
            {Array.from({ length: GRID_SIZE }).map((_, i) => {
              const cell = revealed.find(r => r.index === i);
              return (
                <button key={i} className={`mine-cell ${cell ? (cell.safe ? 'safe' : 'mine') : ''}`} onClick={() => reveal(i)}>
                  {cell ? (cell.safe ? '💎' : '💥') : '?'}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
