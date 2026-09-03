'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Per-route theming for the transition curtain.
const ROUTES = {
  '/':             { label: 'HOME',        icon: '⬡', colors: ['#00f2ff', '#0066ff'] },
  '/bonuses':      { label: 'BONUSES',     icon: '💎', colors: ['#53fc18', '#00b341'] },
  '/raffles':      { label: 'RAFFLES',     icon: '🎟️', colors: ['#ff5edb', '#a020f0'] },
  '/challenges':   { label: 'CHALLENGES',  icon: '🎯', colors: ['#ffb020', '#ff5e00'] },
  '/rankings':     { label: 'LEADERBOARD', icon: '🏆', colors: ['#ffd54a', '#ff8a00'] },
  '/wager-rewards':{ label: 'LEADERBOARD', icon: '🏆', colors: ['#ffd54a', '#ff8a00'] },
  '/shop':         { label: 'SHOP',        icon: '🛍️', colors: ['#7c5cff', '#00d4ff'] },
  '/faq':          { label: 'FAQ',         icon: '❔', colors: ['#00f2ff', '#8a2be2'] },
  '/socials':      { label: 'SOCIALS',     icon: '📡', colors: ['#1da1f2', '#9146ff'] },
  '/banned-games': { label: 'BANNED',      icon: '⛔', colors: ['#ff4444', '#7a0000'] },
};
const routeMeta = (path) => ROUTES[path] || { label: (path.replace('/', '') || 'PAGE').toUpperCase(), icon: '⬡', colors: ['#00f2ff', '#0066ff'] };

const PANELS = 6;
const COVER_MS = 600;   // curtain closes
const HOLD_MS = 260;    // brief pause on full cover before route swap
const REVEAL_MS = 620;  // curtain opens
const STAGGER = 0.045;

export default function PageTransition() {
  const pathname = usePathname();
  const router = useRouter();
  const pathRef = useRef(pathname);
  const phaseRef = useRef('idle');

  const [phase, setPhase] = useState('idle'); // idle | cover | reveal
  const [meta, setMeta] = useState(routeMeta(pathname));
  const reduced = useRef(false);

  useEffect(() => { pathRef.current = pathname; }, [pathname]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    reduced.current = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // When the pathname actually changes: swap to reveal (curtain opens).
  useEffect(() => {
    if (phaseRef.current === 'cover') {
      setPhase('reveal');
      const t = setTimeout(() => setPhase('idle'), REVEAL_MS + 120);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  const go = useCallback((href) => {
    if (reduced.current) { router.push(href); return; }
    setMeta(routeMeta(new URL(href, window.location.href).pathname));
    setPhase('cover');
    setTimeout(() => router.push(href), COVER_MS + HOLD_MS);
  }, [router]);

  // Intercept internal link clicks so the curtain closes before navigation.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a');
      if (!a) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      const rel = a.getAttribute('rel') || '';
      if (rel.includes('external')) return;
      let url;
      try { url = new URL(a.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathRef.current) return; // same page (or hash) — let it be
      if (phaseRef.current !== 'idle') { e.preventDefault(); return; }
      e.preventDefault();
      go(url.pathname + url.search);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [go]);

  const active = phase !== 'idle';
  const opening = phase === 'reveal';
  const [c1, c2] = meta.colors;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pt-root"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="pt-panels">
            {Array.from({ length: PANELS }).map((_, i) => (
              <motion.div
                key={i}
                className="pt-panel"
                style={{ background: `linear-gradient(160deg, ${c1}, ${c2})` }}
                initial={{ scaleY: opening ? 1 : 0 }}
                animate={{ scaleY: opening ? 0 : 1 }}
                transition={{
                  duration: (opening ? REVEAL_MS : COVER_MS) / 1000,
                  ease: [0.76, 0, 0.24, 1],
                  delay: (opening ? (PANELS - 1 - i) : i) * STAGGER,
                }}
              />
            ))}
          </div>

          <motion.div
            className="pt-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: opening ? 0 : 1, scale: opening ? 1.1 : 1 }}
            transition={{ duration: 0.35, delay: opening ? 0 : 0.18 }}
          >
            <motion.div
              className="pt-orb"
              style={{ boxShadow: `0 0 60px ${c1}, 0 0 120px ${c2}` }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
            >
              <span>{meta.icon}</span>
            </motion.div>
            <div className="pt-label">
              {meta.label.split('').map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.22 + i * 0.03, duration: 0.3 }}
                >
                  {ch === ' ' ? ' ' : ch}
                </motion.span>
              ))}
            </div>
            <div className="pt-bar"><motion.i
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: (COVER_MS + HOLD_MS) / 1000, ease: 'easeInOut' }}
            /></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
