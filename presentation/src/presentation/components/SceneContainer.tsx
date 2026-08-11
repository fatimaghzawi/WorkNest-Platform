import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'soft' | 'deep' | 'hero';
};

const tones: Record<NonNullable<Props['tone']>, string> = {
  light: 'bg-transparent',
  soft: 'bg-gradient-to-br from-white/40 via-transparent to-wn-soft/50',
  deep: 'bg-wn-primary text-white',
  hero: 'bg-gradient-to-br from-wn-primary via-wn-hover to-[#5a2d6e] text-white',
};

export function SceneContainer({ children, className = '', tone = 'light' }: Props) {
  return (
    <motion.section
      className={`relative h-full w-full overflow-hidden px-[4.5vw] py-[4.5vh] ${tones[tone]} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-wn-accent/20 blur-3xl" />
        <div className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-wn-orange/15 blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col">{children}</div>
    </motion.section>
  );
}
