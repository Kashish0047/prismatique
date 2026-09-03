'use client';
import { motion } from 'framer-motion';

// Re-mounts on every route change → gives the incoming page its entrance.
export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
