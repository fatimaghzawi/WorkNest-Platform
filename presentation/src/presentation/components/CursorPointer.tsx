import { motion } from 'framer-motion';

export function CursorPointer({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`pointer-events-none absolute z-20 ${className}`}
      animate={{ y: [0, -6, 0], x: [0, 4, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 3l14 8.5-6.2 1.6L10 21 5 3z"
          fill="#1A1224"
          stroke="#fff"
          strokeWidth="1.4"
        />
      </svg>
    </motion.div>
  );
}
