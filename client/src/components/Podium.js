'use client';
import { motion } from 'framer-motion';

export default function Podium({ top3 }) {
  return (
    <div className="podium-container">
      {/* Second Place (Left) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="podium-item second"
      >
        <div className="podium-rank-badge">RANK 2</div>
        <div className="podium-avatar">🥈</div>
        <div className="podium-name">{top3[1]?.username || '---'}</div>
        <div className="small-label">WAGERED</div>
        <div className="podium-value">${(top3[1]?.wageredUsd || 0).toLocaleString()}</div>
      </motion.div>

      {/* First Place (Center - BIG) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="podium-item first"
      >
        <div className="podium-rank-badge">RANK 1</div>
        <div className="podium-avatar" style={{ fontSize: '50px' }}>🏆</div>
        <div className="podium-name" style={{ fontSize: '1.4rem' }}>{top3[0]?.username || '---'}</div>
        <div className="small-label">WAGERED</div>
        <div className="podium-value" style={{ fontSize: '2rem' }}>${(top3[0]?.wageredUsd || 0).toLocaleString()}</div>
      </motion.div>

      {/* Third Place (Right) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="podium-item third"
      >
        <div className="podium-rank-badge">RANK 3</div>
        <div className="podium-avatar">🥉</div>
        <div className="podium-name">{top3[2]?.username || '---'}</div>
        <div className="small-label">WAGERED</div>
        <div className="podium-value">${(top3[2]?.wageredUsd || 0).toLocaleString()}</div>
      </motion.div>
    </div>
  );
}
