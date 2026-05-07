'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CoinWallet from '@/components/CoinWallet';

const GAMES = [
  { id: 'dice', name: 'DICE', emoji: '🎲', desc: 'Predict and win with custom odds', color: '#00f2ff', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&q=80&w=400' },
  { id: 'limbo', name: 'LIMBO', emoji: '🚀', desc: 'Watch the multiplier skyrocket', color: '#a855f7', image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=400' },
  { id: 'mines', name: 'MINES', emoji: '💣', desc: 'High stakes grid-based survival', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=400' },
  { id: 'dragon_tower', name: 'DRAGON TOWER', emoji: '🐉', desc: 'Climb the tower for massive payouts', color: '#ef4444', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400' },
  { id: 'chicken', name: 'CHICKEN', emoji: '🌟', desc: 'Find the Rockstar chicken', color: '#53fc18', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=400' },
];

export default function GamesPage() {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('prism_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setCoins(parsed.coins || 0);
    }
  }, []);

  return (
    <main className="min-h-screen bg-dark">
      <Navbar user={user} coins={coins} onLogout={() => {
        localStorage.removeItem('prism_user');
        window.location.href = window.location.origin;
      }} />

      <section className="games-hub-hero">
        <div className="container">
          <div className="hub-content">
            <h1>PRISMATIQUE <span className="highlight-blue">ORIGINALS</span></h1>
            <p>Experience the thrill of our custom-built, provably fair casino games.</p>
            <div style={{ marginTop: '30px' }}>
              <CoinWallet user={user} onCoinsUpdate={(newCoins) => setCoins(newCoins)} />
            </div>
          </div>

          <div className="hub-grid">
            {GAMES.map(game => (
              <Link href={`/games/${game.id}`} key={game.id} className="hub-card" style={{ '--game-color': game.color }}>
                <div className="hub-card-img" style={{ backgroundImage: `url(${game.image})` }}>
                  <div className="hub-card-overlay">
                    <span className="hub-emoji">{game.emoji}</span>
                  </div>
                </div>
                <div className="hub-card-info">
                  <h3>{game.name}</h3>
                  <p>{game.desc}</p>
                  <div className="hub-play-btn">PLAY NOW</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .games-hub-hero { padding: 150px 0 100px; }
        .hub-content { text-align: center; margin-bottom: 80px; }
        .hub-content h1 { font-size: 4rem; font-weight: 900; letter-spacing: -2px; margin-bottom: 20px; }
        .hub-content p { color: var(--text-secondary); font-size: 1.2rem; max-width: 600px; margin: 0 auto; }
        
        .hub-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
          gap: 30px; 
        }

        .hub-card {
          background: var(--bg-card);
          border-radius: 24px;
          overflow: hidden;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .hub-card:hover {
          transform: translateY(-15px);
          border-color: var(--game-color);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5), 0 0 30px color-mix(in srgb, var(--game-color) 20%, transparent);
        }

        .hub-card-img {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .hub-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.8));
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hub-emoji { font-size: 4rem; transition: transform 0.3s; }
        .hub-card:hover .hub-emoji { transform: scale(1.2) rotate(10deg); }

        .hub-card-info { padding: 25px; }
        .hub-card-info h3 { font-size: 1.5rem; font-weight: 900; margin-bottom: 10px; color: #fff; }
        .hub-card-info p { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px; line-height: 1.5; }

        .hub-play-btn {
          background: var(--game-color);
          color: #000;
          text-align: center;
          padding: 12px;
          border-radius: 12px;
          font-weight: 900;
          font-size: 0.9rem;
          transition: 0.3s;
        }

        @media (max-width: 768px) {
          .hub-content h1 { font-size: 2.5rem; }
        }
      `}</style>
    </main>
  );
}
