import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SceneContainer } from '../components/SceneContainer';

const beats = [
  { who: null as string | null, text: 'Imagine you need someone to build something important.' },
  { who: 'CLIENT', text: 'I need the right person.' },
  { who: 'FREELANCER', text: 'I need the right opportunity.' },
  { who: 'CLIENT', text: 'But how do I know I can trust them?' },
  { who: 'FREELANCER', text: 'And how do I know I’ll get paid?' },
  { who: 'reveal', text: 'WORKNEST' },
];

export function HookScene() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((v) => (v < beats.length - 1 ? v + 1 : v));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const beat = beats[active];
  const revealed = beat.who === 'reveal';

  return (
    <SceneContainer tone={revealed ? 'hero' : 'light'} className="justify-center">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        {!revealed ? (
          <motion.div
            className="mb-10 flex items-center gap-3 opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
          >
            <img src="/logo.png" alt="" className="h-9 w-9 rounded-xl" />
            <span className="font-display text-sm font-bold tracking-[0.2em] text-wn-primary">
              WORKNEST
            </span>
          </motion.div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {beat.who && beat.who !== 'reveal' ? (
              <p
                className={`mb-5 text-xs font-bold tracking-[0.22em] ${
                  beat.who === 'CLIENT' ? 'text-wn-primary' : 'text-wn-orange'
                }`}
              >
                {beat.who}
              </p>
            ) : null}

            {revealed ? (
              <>
                <img src="/logo.png" alt="" className="mx-auto mb-6 h-16 w-16 rounded-2xl shadow-lift" />
                <h1 className="font-display text-6xl font-extrabold tracking-tight md:text-8xl">
                  WORKNEST
                </h1>
                <p className="mx-auto mt-6 max-w-xl text-xl font-medium text-white/88">
                  Where freelance work becomes a trusted experience.
                </p>
                <p className="mt-10 text-sm tracking-[0.18em] text-white/55">FIND · TRUST · WORK</p>
              </>
            ) : (
              <h1
                className={`font-display font-bold leading-[1.1] tracking-tight text-wn-ink ${
                  active === 0 ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'
                }`}
              >
                {beat.text}
              </h1>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </SceneContainer>
  );
}
