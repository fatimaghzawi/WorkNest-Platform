import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  tone?: 'light' | 'soft' | 'ink' | 'void';
};

const tones = {
  light: 'bg-wn-page text-wn-ink',
  soft: 'bg-wn-soft text-wn-ink',
  ink: 'bg-wn-primary text-white',
  void: 'bg-wn-active text-white',
};

export function Scene({ children, className = '', tone = 'light' }: Props) {
  return (
    <motion.section
      className={`relative flex h-full w-full flex-col overflow-hidden ${tones[tone]} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1500px] flex-col px-[4.5vw] py-[4vh]">
        {children}
      </div>
    </motion.section>
  );
}

export function CinematicText({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-bold tracking-[0.22em] uppercase text-wn-hover ${className}`}>
      {children}
    </p>
  );
}
