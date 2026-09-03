'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ShopPage() {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

    (async () => {
      try {
        const res = await fetch(`${API}/shop`);
        const data = await res.json();
        if (data.success) setItems(data.data);
      } catch (e) {} finally {
        setLoading(false);
      }
    })();
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
      <Navbar user={user} onLogout={handleLogout} onLoginClick={startLogin} coins={coins} />

      <section className="section-padding pt-32">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="section-title">PRISMATIQUE <span className="highlight-blue">SHOP</span></h1>
            <p className="page-subtitle">Redeem your coins for exclusive rewards.</p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20 w-full opacity-50">LOADING SHOP...</div>
          ) : items.length === 0 ? (
            <div className="rewards-content-wrapper">
              <div className="wager-rewards-coming">
                <div className="coming-soon-card-premium">
                  <div className="glass-effect"></div>
                  <div className="coming-soon-icon">🛍️</div>
                  <h3>SHOP COMING SOON</h3>
                  <p>The Prismatique rewards store is being stocked. Check back soon.</p>
                  <div className="coming-soon-badge-premium">
                    <span className="pulse-dot"></span>
                    DEVELOPMENT IN PROGRESS
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="raffle-grid cards-grid-spacious">
              {items.map((item, i) => {
                const soldOut = item.status === 'soldout' || item.quantity === 0;
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="raffle-card shop-card"
                  >
                    <div className="shop-img-wrap">
                      {item.image
                        ? <img src={item.image} alt={item.title} className="shop-img" />
                        : <div className="shop-img-placeholder">🛍️</div>}
                      {soldOut && <div className="shop-soldout-tag">SOLD OUT</div>}
                    </div>
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                    <div className="shop-meta">
                      <span className="shop-price">🪙 {(item.price || 0).toLocaleString()}</span>
                      {item.quantity >= 0 && <span className="shop-stock">{item.quantity} left</span>}
                    </div>
                    <button className="raffle-btn" disabled={soldOut}>
                      {soldOut ? 'SOLD OUT' : 'REDEEM SOON'}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
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
