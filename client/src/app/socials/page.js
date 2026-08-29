'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const socials = [
  {
    name: 'Kick',
    handle: '@Prismatique',
    url: 'https://kick.com/Prismatique',
    icon: 'fas fa-play',
    color: '#53fc18',
    desc: 'Primary home base. Daily high-volatility slots, KENO and Mines sessions streamed live.',
    cta: 'Watch Live',
  },
  {
    name: 'Twitch',
    handle: '@prismatique',
    url: 'https://www.twitch.tv/prismatique',
    icon: 'fab fa-twitch',
    color: '#9146ff',
    desc: 'Simulcast of every Kick stream with chat side-by-side. Follow for go-live alerts.',
    cta: 'Follow',
  },
  {
    name: 'YouTube',
    handle: '@prismatiquee',
    url: 'https://www.youtube.com/@prismatiquee',
    icon: 'fab fa-youtube',
    color: '#ff0033',
    desc: 'Biggest wins, session recaps and clip compilations — including the 2254x Mines hit.',
    cta: 'Subscribe',
  },
  {
    name: 'X',
    handle: '@Prismatiquee',
    url: 'https://x.com/Prismatiquee',
    icon: 'fab fa-x-twitter',
    color: '#ffffff',
    desc: 'Verified account. Stream announcements, giveaway drops and community updates.',
    cta: 'Follow',
  },
  {
    name: 'Instagram',
    handle: '@Prismatiqueslots',
    url: 'https://www.instagram.com/Prismatiqueslots',
    icon: 'fab fa-instagram',
    color: '#e1306c',
    desc: 'Behind-the-scenes, win screenshots and story polls for the Prismatique community.',
    cta: 'Follow',
  },
  {
    name: 'Discord',
    handle: 'invite/prismatique',
    url: 'https://discord.com/invite/prismatique',
    icon: 'fab fa-discord',
    color: '#5865f2',
    desc: 'The community hub — chat, bonus alerts, raffle entries and direct support.',
    cta: 'Join Server',
  },
];

export default function SocialsPage() {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('prism_auth_v2');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setCoins(parsed.coins || 0);
      } catch (e) {}
    }

    const params = new URLSearchParams(window.location.search);
    const justLoggedOut = sessionStorage.getItem('just_logged_out');

    if (params.get('login_success') === 'true' && !justLoggedOut) {
      const userData = {
        username: params.get('username'),
        avatar: decodeURIComponent(params.get('avatar') || ''),
        coins: parseInt(params.get('coins') || '100', 10)
      };
      setUser(userData);
      setCoins(userData.coins);
      localStorage.setItem('prism_auth_v2', JSON.stringify(userData));
      sessionStorage.removeItem('just_logged_out');
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = window.location.pathname;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('prism_auth_v2');
    sessionStorage.setItem('just_logged_out', 'true');
    setUser(null);
    setCoins(0);
    window.location.replace(window.location.pathname);
  };

  const startLogin = () => {
    sessionStorage.removeItem('just_logged_out');
    window.location.href = `${API}/auth/kick?return_to=${encodeURIComponent(window.location.pathname)}`;
  };

  return (
    <main className="min-h-screen bg-dark">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onLoginClick={startLogin}
        coins={coins}
      />

      <section className="section-padding pt-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="section-title">FOLLOW <span className="highlight-blue">PRISMATIQUE</span></h1>
            <p className="page-subtitle">Every official channel in one place. Beware of impersonators — these are the only real accounts.</p>
          </motion.div>

          <div className="socials-grid">
            {socials.map((s, i) => (
              <motion.a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-card"
                style={{ '--brand': s.color }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="social-card-icon">
                  <i className={s.icon}></i>
                </div>
                <div className="social-card-body">
                  <h3>{s.name}</h3>
                  <span className="social-card-handle">{s.handle}</span>
                  <p>{s.desc}</p>
                </div>
                <span className="social-card-cta">
                  {s.cta} <i className="fas fa-arrow-right"></i>
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>&copy; 2024 PRISMATIQUE. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </main>
  );
}
