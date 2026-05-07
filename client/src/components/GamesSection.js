'use client';
import { useState, useEffect, useCallback } from 'react';
import DiceGame from './games/DiceGame';
import LimboGame from './games/LimboGame';
import MinesGame from './games/MinesGame';
import DragonTowerGame from './games/DragonTowerGame';
import ChickenGame from './games/ChickenGame';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const GAMES = [
  { id: 'dice', name: 'DICE', emoji: '🎲', desc: 'Roll over or under your target number', color: '#00f2ff' },
  { id: 'limbo', name: 'LIMBO', emoji: '🚀', desc: 'Set a multiplier and watch it launch', color: '#a855f7' },
  { id: 'mines', name: 'MINES', emoji: '💣', desc: 'Navigate the grid and avoid the mines', color: '#f59e0b' },
  { id: 'dragon_tower', name: 'DRAGON TOWER', emoji: '🐉', desc: 'Climb the tower, pick safe eggs to survive', color: '#ef4444' },
  { id: 'chicken', name: 'CHICKEN ROCKSTAR', emoji: '🌟', desc: 'Find the Rockstar chicken and win 5x', color: '#53fc18' },
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

  // Countdown timer
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

  if (!user) {
    return (
      <section id="games" className="games-section">
        <div className="container">
          <h2 className="section-title">PRISMATIQUE <span className="highlight-blue">GAMES</span></h2>
          <div className="games-login-prompt">
            <div className="games-lock-icon">🔒</div>
            <h3>Login to Play</h3>
            <p>You must be logged in with your Kick account to play games and earn coins.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="games" className="games-section">
      <div className="container">
        <h2 className="section-title">PRISMATIQUE <span className="highlight-blue">GAMES</span></h2>

        {/* Coins Wallet */}
        <div className="coins-wallet">
          <div className="wallet-balance">
            <span className="wallet-icon">🪙</span>
            <span className="wallet-amount">{coins.toLocaleString()}</span>
            <span className="wallet-label">COINS</span>
          </div>
          <div className="wallet-claim">
            {claimMsg && <span className="claim-msg">{claimMsg}</span>}
            {canClaim ? (
              <button className="claim-btn ready" onClick={handleClaim} disabled={claiming}>
                {claiming ? 'CLAIMING...' : '🎁 CLAIM 20 COINS'}
              </button>
            ) : (
              <button className="claim-btn waiting" disabled>
                ⏳ {timeLeft || 'LOADING...'}
              </button>
            )}
          </div>
        </div>

        {/* Game Grid or Active Game */}
        {!activeGame ? (
          <div className="games-grid">
            {GAMES.map(game => (
              <button key={game.id} className="game-card" onClick={() => setActiveGame(game.id)}
                style={{ '--game-color': game.color }}>
                <div className="game-card-emoji">{game.emoji}</div>
                <div className="game-card-name">{game.name}</div>
                <div className="game-card-desc">{game.desc}</div>
                <div className="game-card-play">PLAY NOW →</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="active-game-container">
            <div className="active-game-header">
              <button className="back-to-games" onClick={() => setActiveGame(null)}>← ALL GAMES</button>
              <div className="active-game-title">
                {GAMES.find(g => g.id === activeGame)?.emoji} {GAMES.find(g => g.id === activeGame)?.name}
              </div>
              <div className="active-game-balance">🪙 {coins.toLocaleString()}</div>
            </div>
            {GameComponent && <GameComponent user={user} onCoinsUpdate={handleCoinsUpdate} />}
          </div>
        )}
      </div>
    </section>
  );
}
