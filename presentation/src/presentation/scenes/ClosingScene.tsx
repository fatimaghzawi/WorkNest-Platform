import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SceneContainer } from '../components/SceneContainer';

const beats = [
  { type: 'pair' as const },
  { type: 'line' as const, text: 'WORKNEST CONNECTED US.' },
  { type: 'line' as const, text: 'WORKNEST PROTECTED THE TRANSACTION.' },
  { type: 'line' as const, text: 'WORKNEST GAVE US A PLACE TO GET THE WORK DONE.' },
  { type: 'final' as const },
];

export function ClosingScene() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setI((v) => (v < beats.length - 1 ? v + 1 : v));
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const beat = beats[i];

  return (
    <SceneContainer tone={beat.type === 'final' ? 'hero' : 'light'} className="justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          className="mx-auto w-full max-w-4xl text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45 }}
        >
          {beat.type === 'pair' ? (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-3xl border border-wn-line bg-white/90 p-8 shadow-card">
                <p className="text-xs font-bold tracking-[0.18em] text-wn-primary">CLIENT</p>
                <p className="mt-4 font-display text-2xl font-semibold text-wn-ink md:text-3xl">
                  “I needed someone I could trust.”
                </p>
              </div>
              <div className="rounded-3xl border border-wn-line bg-white/90 p-8 shadow-card">
                <p className="text-xs font-bold tracking-[0.18em] text-wn-orange">FREELANCER</p>
                <p className="mt-4 font-display text-2xl font-semibold text-wn-ink md:text-3xl">
                  “I needed a client I could trust.”
                </p>
              </div>
            </div>
          ) : null}

          {beat.type === 'line' ? (
            <h2 className="font-display text-3xl font-bold tracking-tight text-wn-primary md:text-5xl">
              {beat.text}
            </h2>
          ) : null}

          {beat.type === 'final' ? (
            <>
              <img src="/logo.png" alt="" className="mx-auto mb-5 h-14 w-14 rounded-2xl shadow-soft" />
              <h1 className="font-display text-5xl font-extrabold tracking-tight md:text-7xl">WORKNEST</h1>
              <p className="mt-5 font-display text-2xl font-semibold tracking-wide text-white/90 md:text-3xl">
                FIND. TRUST. WORK.
              </p>
              <p className="mx-auto mt-4 max-w-md text-white/75">
                From finding the right person to completing the work.
              </p>
              <p className="mt-12 font-display text-3xl font-bold md:text-4xl">Thank you.</p>
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </SceneContainer>
  );
}
