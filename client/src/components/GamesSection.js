'use client';
import { useState, useEffect, useCallback } from 'react';
import DiceGame from './games/DiceGame';
import LimboGame from './games/LimboGame';
import MinesGame from './games/MinesGame';
import DragonTowerGame from './games/DragonTowerGame';
import ChickenGame from './games/ChickenGame';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const GAMES = [
  { id: 'dice', name: 'DICE', emoji: '🎲', desc: 'Roll over or under target numbers', color: '#00f2ff', tag: 'CLASSIC', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=600' },
  { id: 'limbo', name: 'LIMBO', emoji: '🚀', desc: 'Watch the multiplier skyrocket', color: '#a855f7', tag: 'HIGH RISK', image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=600' },
  { id: 'mines', name: 'MINES', emoji: '💣', desc: 'Navigate the grid, avoid the mines', color: '#f59e0b', tag: 'STRATEGY', image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=600' },
  { id: 'dragon_tower', name: 'DRAGON TOWER', emoji: '🐉', desc: 'Climb for massive rewards', color: '#ef4444', tag: 'ADVENTURE', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600' },
  { id: 'chicken', name: 'CHICKEN', emoji: '🌟', desc: 'Find the rockstar chicken', color: '#53fc18', tag: 'LUCKY', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=600' },
];

export default function GamesSection({ user, onCoinsUpdate: parentCoinsUpdate }) {
  const [activeGame, setActiveGame] = useState(null);
  const [coins, setCoins] = useState(user?.coins || 0);
  const [canClaim, setCanClaim] = useState(false);
  const [nextClaimAt, setNextClaimAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState('');

  const fetchBalance = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/coins/balance/${user.username}`);
      const data = await res.json();
      if (data.success) {
        setCoins(data.coins);
        setCanClaim(data.canClaim);
        setNextClaimAt(data.nextClaimAt);
      }
    } catch (e) {}
  }, [user]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  useEffect(() => {
    if (!nextClaimAt || canClaim) { setTimeLeft(''); return; }
    const interval = setInterval(() => {
      const diff = nextClaimAt - Date.now();
      if (diff <= 0) { setCanClaim(true); setTimeLeft(''); clearInterval(interval); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextClaimAt, canClaim]);

  const handleClaim = async () => {
    if (!user || !canClaim || claiming) return;
    setClaiming(true);
    setClaimMsg('');
    try {
      const res = await fetch(`${API}/coins/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
      });
      const data = await res.json();
      if (data.success) {
        setCoins(data.coins);
        setCanClaim(false);
        setNextClaimAt(data.nextClaimAt);
        setClaimMsg('+20 coins claimed! 🎉');
        if (parentCoinsUpdate) parentCoinsUpdate(data.coins);
        setTimeout(() => setClaimMsg(''), 3000);
      } else {
        setClaimMsg(data.message);
      }
    } catch (e) { setClaimMsg('Error claiming'); }
    setClaiming(false);
  };

  const handleCoinsUpdate = (newCoins) => {
    setCoins(newCoins);
    if (parentCoinsUpdate) parentCoinsUpdate(newCoins);
  };

  const GameComponent = {
    dice: DiceGame, limbo: LimboGame, mines: MinesGame,
    dragon_tower: DragonTowerGame, chicken: ChickenGame
  }[activeGame];

  return (
    <section id="games" className="gs-root">
      <div className="container">
        <header className="gs-header">
          <h2 className="gs-title">PRISMATIQUE <span className="highlight-blue">ORIGINALS</span></h2>
          
          <div className="gs-wallet-strip">
            <div className="gs-balance">
              <span className="gs-coin">🪙</span>
              <span className="gs-num">{coins.toLocaleString()}</span>
              <span className="gs-unit">COINS</span>
            </div>
            <div className="gs-claim-box">
              {claimMsg && <span className="gs-claim-msg">{claimMsg}</span>}
              {user ? (
                canClaim ? (
                  <button className="gs-claim-btn ready" onClick={handleClaim} disabled={claiming}>
                    {claiming ? 'CLAIMING...' : '🎁 CLAIM REWARD'}
                  </button>
                ) : (
                  <div className="gs-claim-wait">
                    <span>NEXT CLAIM IN</span>
                    <strong>{timeLeft || '--:--'}</strong>
                  </div>
                )
              ) : (
                <span className="gs-login-hint">LOGIN TO CLAIM COINS</span>
              )}
            </div>
          </div>
        </header>

        {!activeGame ? (
          <div className="gs-cards-grid">
            {GAMES.map(game => (
              <button key={game.id} className="gs-card" onClick={() => setActiveGame(game.id)} style={{ '--gc': game.color }}>
                <div className="gs-card-img" style={{ backgroundImage: `url(${game.image})` }} />
                <div className="gs-card-overlay" />
                <div className="gs-card-tag">{game.tag}</div>
                <div className="gs-card-content">
                  <span className="gs-card-emoji">{game.emoji}</span>
                  <h3>{game.name}</h3>
                  <p>{game.desc}</p>
                  <div className="gs-card-btn">PLAY NOW</div>
                </div>
              </button>
            ))}
          </div>
        ) : (() => {
          const gameData = GAMES.find(g => g.id === activeGame);
          return (
            <div className="gs-active-cabinet" style={{ '--gc': gameData.color }}>
              <div className="gs-cabinet-header">
                <button className="gs-back" onClick={() => setActiveGame(null)}>
                  <span className="gs-icon">←</span>
                  <span>GAMES</span>
                </button>
                <div className="gs-cabinet-title">
                  <span className="gs-c-tag">{gameData.tag}</span>
                  <strong>{gameData.name}</strong>
                </div>
                <div className="gs-cabinet-balance">
                   <span className="gs-coin">🪙</span>
                   <span>{coins.toLocaleString()}</span>
                </div>
              </div>

              <div className="gs-cabinet-body">
                {user ? (
                  <GameComponent user={user} onCoinsUpdate={handleCoinsUpdate} />
                ) : (
                  <div className="gs-lock-screen">
                    <div className="gs-lock-icon">🔒</div>
                    <h3>LOGIN TO PLAY</h3>
                    <p>Connect your Kick account to play games and claim coins.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      <style jsx>{`
        .gs-root { padding: 100px 0; background: #080a0f; }
        .gs-header { text-align: center; margin-bottom: 60px; }
        .gs-title { font-size: 3.5rem; font-weight: 900; letter-spacing: -2px; margin-bottom: 30px; }
        
        .gs-wallet-strip {
          display: inline-flex;
          align-items: center;
          gap: 40px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 12px 32px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .gs-balance { display: flex; align-items: center; gap: 10px; }
        .gs-coin { font-size: 1.4rem; }
        .gs-num { font-size: 1.5rem; font-weight: 900; color: #fff; }
        .gs-unit { font-size: 0.7rem; font-weight: 800; color: rgba(255,255,255,0.3); letter-spacing: 1px; }
        
        .gs-claim-box { display: flex; align-items: center; gap: 15px; }
        .gs-claim-msg { color: #53fc18; font-weight: 800; font-size: 0.85rem; }
        .gs-claim-btn { background: #53fc18; color: #000; border: none; padding: 10px 24px; border-radius: 12px; font-weight: 900; font-size: 0.85rem; cursor: pointer; transition: 0.3s; }
        .gs-claim-btn:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(83,252,24,0.4); }
        .gs-claim-wait { text-align: left; }
        .gs-claim-wait span { display: block; font-size: 0.6rem; font-weight: 800; color: rgba(255,255,255,0.3); }
        .gs-claim-wait strong { font-size: 0.9rem; color: #fff; }
        .gs-login-hint { font-size: 0.75rem; font-weight: 800; color: rgba(255,255,255,0.25); }

        .gs-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .gs-card {
          position: relative;
          height: 380px;
          border-radius: 28px;
          overflow: hidden;
          background: #11141b;
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 28px;
          text-align: left;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .gs-card-img { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.35; transition: 0.6s; }
        .gs-card-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(8,10,15,0.9) 100%); }
        .gs-card-tag { position: absolute; top: 28px; left: 28px; font-size: 0.6rem; font-weight: 900; color: var(--gc); background: rgba(0,0,0,0.5); padding: 5px 12px; border-radius: 8px; border: 1px solid color-mix(in srgb, var(--gc) 30%, transparent); z-index: 2; }
        
        .gs-card-content { position: relative; z-index: 2; }
        .gs-card-emoji { font-size: 2.8rem; display: block; margin-bottom: 12px; transition: transform 0.4s; }
        .gs-card-content h3 { font-size: 1.6rem; font-weight: 900; color: #fff; margin-bottom: 8px; }
        .gs-card-content p { font-size: 0.85rem; color: rgba(255,255,255,0.5); line-height: 1.5; margin-bottom: 20px; }
        .gs-card-btn { display: inline-block; padding: 10px 24px; background: var(--gc); color: #000; border-radius: 12px; font-weight: 900; font-size: 0.85rem; transition: 0.3s; }

        .gs-card:hover { transform: translateY(-10px); border-color: var(--gc); box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 30px color-mix(in srgb, var(--gc) 15%, transparent); }
        .gs-card:hover .gs-card-img { transform: scale(1.1); opacity: 0.5; }
        .gs-card:hover .gs-card-emoji { transform: scale(1.2) rotate(10deg); }

        /* ACTIVE CABINET */
        .gs-active-cabinet {
          background: #0d1017;
          border-radius: 32px;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.7);
        }
        .gs-cabinet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .gs-back { background: transparent; border: none; color: rgba(255,255,255,0.4); font-weight: 900; font-size: 0.75rem; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .gs-back:hover { color: #fff; }
        .gs-cabinet-title { text-align: center; }
        .gs-c-tag { display: block; font-size: 0.55rem; font-weight: 900; color: var(--gc); letter-spacing: 2px; }
        .gs-cabinet-title strong { font-size: 1.2rem; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
        .gs-cabinet-balance { display: flex; align-items: center; gap: 8px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); padding: 6px 14px; border-radius: 10px; color: #f59e0b; font-weight: 900; }

        .gs-cabinet-body { min-height: 400px; }
        .gs-lock-screen { padding: 100px 40px; text-align: center; }
        .gs-lock-icon { font-size: 4rem; margin-bottom: 20px; }

        @media (max-width: 768px) {
          .gs-title { font-size: 2.5rem; }
          .gs-wallet-strip { flex-direction: column; gap: 20px; padding: 24px; }
          .gs-cabinet-header { flex-direction: column; gap: 15px; }
          .gs-back { position: absolute; top: 20px; left: 20px; }
        }
      `}</style>
    </section>
  );
}
