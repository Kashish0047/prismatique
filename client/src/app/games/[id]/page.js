'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CoinWallet from '@/components/CoinWallet';
import DiceGame from '@/components/games/DiceGame';
import LimboGame from '@/components/games/LimboGame';
import MinesGame from '@/components/games/MinesGame';
import DragonTowerGame from '@/components/games/DragonTowerGame';
import ChickenGame from '@/components/games/ChickenGame';

const GAMES_META = {
  dice: { name: 'DICE', emoji: '🎲', component: DiceGame, color: '#00f2ff' },
  limbo: { name: 'LIMBO', emoji: '🚀', component: LimboGame, color: '#a855f7' },
  mines: { name: 'MINES', emoji: '💣', component: MinesGame, color: '#f59e0b' },
  dragon_tower: { name: 'DRAGON TOWER', emoji: '🐉', component: DragonTowerGame, color: '#ef4444' },
  chicken: { name: 'CHICKEN', emoji: '🌟', component: ChickenGame, color: '#53fc18' },
};

export default function SingleGamePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const game = GAMES_META[id];
  
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('prism_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setCoins(parsed.coins || 0);
    } else {
      // Redirect to hub if not logged in
      window.location.href = '/?error=login_required';
    }
  }, []);

  const handleCoinsUpdate = (newCoins) => {
    setCoins(newCoins);
    const updatedUser = { ...user, coins: newCoins };
    setUser(updatedUser);
    localStorage.setItem('prism_user', JSON.stringify(updatedUser));
  };

  if (!game) return <div className="p-20 text-center">Game not found</div>;

  const GameComponent = game.component;

  return (
    <main className="min-h-screen bg-dark">
      <Navbar user={user} coins={coins} onLogout={() => {
        localStorage.removeItem('prism_user');
        window.location.href = window.location.origin;
      }} />

      <section className="game-player-section">
        <div className="container">
          <div className="player-layout">
            <div className="player-sidebar" style={{ backgroundColor: '#1a1d23', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Link href="/games" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '12px', 
                color: '#00f2ff', 
                textDecoration: 'none', 
                fontWeight: '900', 
                fontSize: '0.85rem', 
                marginBottom: '60px', 
                background: 'rgba(0,242,255,0.1)', 
                padding: '12px 20px', 
                borderRadius: '12px', 
                border: '1px solid rgba(0,242,255,0.2)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                transition: '0.3s'
              }}>
                <span style={{ fontSize: '1.2rem' }}>←</span> BACK TO GAMES HUB
              </Link>
              <div className="game-badge" style={{ backgroundColor: game.color, color: '#000', padding: '4px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '0.7rem', display: 'inline-block', marginBottom: '20px' }}>{game.name}</div>
              <h1>{game.emoji} {game.name}</h1>
              <p>Experience the most immersive {game.name.toLowerCase()} game on Prismatique.</p>
              
              <div className="player-wallet-box" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <span className="label" style={{ marginBottom: '10px' }}>YOUR WALLET</span>
                <CoinWallet user={user} onCoinsUpdate={handleCoinsUpdate} />
              </div>

              <div className="game-sidebar-footer">
                <div className="provably-fair">🛡️ Provably Fair</div>
              </div>
            </div>

            <div className="player-main">
              <div className="game-wrapper">
                {user && <GameComponent user={user} onCoinsUpdate={handleCoinsUpdate} />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .game-player-section { padding: 120px 0 60px; min-height: 90vh; }
        .player-layout { display: grid; grid-template-columns: 350px 1fr; gap: 40px; align-items: start; }
        
        .player-sidebar {
          background: var(--bg-card);
          padding: 40px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
          position: sticky;
          top: 100px;
        }

        .back-link { 
          display: inline-flex; 
          align-items: center;
          gap: 10px;
          color: #fff; 
          text-decoration: none; 
          font-weight: 800; 
          margin-bottom: 60px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-size: 0.85rem;
          background: rgba(255,255,255,0.05);
          padding: 12px 24px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .back-link:hover { 
          background: var(--accent); 
          color: #000; 
          transform: translateX(-10px);
          box-shadow: 0 10px 30px rgba(0,242,255,0.3);
          border-color: var(--accent);
        }

        .game-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 8px;
          font-weight: 900;
          font-size: 0.7rem;
          color: #000;
          margin-bottom: 20px;
        }

        .player-sidebar h1 { font-size: 2.2rem; font-weight: 900; margin-bottom: 15px; }
        .player-sidebar p { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 40px; }

        .player-wallet-box {
          background: rgba(0,0,0,0.3);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .player-wallet-box .label { font-size: 0.7rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 1px; display: block; margin-bottom: 5px; }
        .player-wallet-box .val { font-size: 1.8rem; font-weight: 900; color: #f59e0b; }

        .game-sidebar-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
        .provably-fair { font-size: 0.8rem; font-weight: 700; color: #53fc18; opacity: 0.8; }

        .player-main {
          background: #0d1117;
          border-radius: 24px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 40px 100px rgba(0,0,0,0.6);
        }

        .game-wrapper {
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .player-layout { grid-template-columns: 1fr; }
          .player-sidebar { position: static; }
        }
      `}</style>
    </main>
  );
}
