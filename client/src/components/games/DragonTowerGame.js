'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const LEVELS = 5;
const EGGS_PER_LEVEL = 3;

export default function DragonTowerGame({ user, onCoinsUpdate }) {
  const [bet, setBet] = useState(10);
  const [currentLevel, setCurrentLevel] = useState(0); // 0 = not started, 1-5 = active
  const [picks, setPicks] = useState([]); // [{level, pick, hitBad}]
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const startGame = () => {
    setCurrentLevel(1);
    setPicks([]);
    setResult(null);
  };

  const pickEgg = async (eggIndex) => {
    if (loading || currentLevel === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/games/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, game: 'dragon_tower', betAmount: bet, params: { level: currentLevel } })
      });
      const data = await res.json();
      if (!data.success) { setResult({ error: data.message }); setLoading(false); return; }
      const { hitBad, multiplier } = data.details;
      setPicks(prev => [...prev, { level: currentLevel, pick: eggIndex, hitBad }]);
      onCoinsUpdate(data.coins);
      if (hitBad) {
        setResult({ result: 'loss', payout: 0, level: currentLevel });
        setCurrentLevel(0);
      } else if (currentLevel === LEVELS) {
        setResult({ result: 'win', payout: data.payout, multiplier });
        setCurrentLevel(0);
      } else {
        setCurrentLevel(prev => prev + 1);
      }
    } catch (e) { setResult({ error: 'Server error' }); }
    setLoading(false);
  };

  return (
    <div className="game-panel">
      {currentLevel === 0 && !result && (
        <div className="game-controls">
          <div className="dragon-info"><div className="dragon-icon">🐉</div><p>Climb all 5 levels to win big! Each level: pick 1 safe egg out of 3.</p></div>
          <div className="bet-row">
            <div className="bet-input-group"><span>🪙</span>
              <input type="number" value={bet} min={1} onChange={e => setBet(Math.max(1, Number(e.target.value)))} />
            </div>
            <button className="half-btn" onClick={() => setBet(Math.max(1, Math.floor(bet / 2)))}>½</button>
            <button className="double-btn" onClick={() => setBet(bet * 2)}>2x</button>
          </div>
          <div className="game-stats-row">
            {[1,2,3,4,5].map(l => <div key={l} className="game-stat"><span>Level {l}</span><strong>{Math.pow(1.5,l).toFixed(2)}x</strong></div>)}
          </div>
          <button className="game-play-btn" onClick={startGame}>🐉 ENTER THE TOWER</button>
        </div>
      )}

      {result && (
        <div className={`mines-result ${result.result === 'win' ? 'win' : 'loss'}`}>
          {result.error ? <div className="game-error">{result.error}</div> : (
            <>
              <div className="result-big">{result.result === 'win' ? '🏆' : '💀'}</div>
              <div>{result.result === 'win' ? `Conquered the tower! +${result.payout} coins` : `Fell at Level ${result.level}! Lost ${bet} coins.`}</div>
              <button className="game-play-btn" style={{marginTop:'15px'}} onClick={() => { setResult(null); }}>PLAY AGAIN</button>
            </>
          )}
        </div>
      )}

      {currentLevel > 0 && (
        <div className="tower-container">
          <div className="tower-levels">
            {Array.from({ length: LEVELS }, (_, i) => LEVELS - i).map(level => {
              const pick = picks.find(p => p.level === level);
              const isActive = level === currentLevel;
              return (
                <div key={level} className={`tower-level ${isActive ? 'active' : ''} ${pick ? (pick.hitBad ? 'failed' : 'passed') : ''}`}>
                  <span className="level-label">LVL {level} — {Math.pow(1.5,level).toFixed(2)}x</span>
                  <div className="tower-eggs">
                    {Array.from({ length: EGGS_PER_LEVEL }).map((_, ei) => {
                      const isMyPick = pick && pick.pick === ei;
                      return (
                        <button key={ei} className={`egg-btn ${isMyPick ? (pick.hitBad ? 'egg-bad' : 'egg-good') : ''}`}
                          onClick={() => isActive && pickEgg(ei)} disabled={!isActive || loading}>
                          {isMyPick ? (pick.hitBad ? '💀' : '✅') : '🥚'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
