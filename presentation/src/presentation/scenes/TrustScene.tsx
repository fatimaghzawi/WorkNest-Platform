import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PaymentFlow } from '../components/PaymentFlow';
import { SceneContainer } from '../components/SceneContainer';

export function TrustScene() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 1600),
      window.setTimeout(() => setPhase(2), 3200),
      window.setTimeout(() => setPhase(3), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <SceneContainer tone={phase >= 2 ? 'soft' : 'light'} className="justify-center">
      <AnimatePresence mode="wait">
        {phase < 2 ? (
          <motion.div
            key="question"
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
          >
            <p className="mb-4 text-xs font-bold tracking-[0.2em] text-wn-orange">THE TRUST MOMENT</p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-wn-ink md:text-6xl">
              {phase === 0
                ? 'Now comes the most important question…'
                : 'What happens to the money?'}
            </h2>
          </motion.div>
        ) : (
          <motion.div
            key="flow"
            className="flex h-full flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
          >
            <div className="mb-5 text-center">
              <p className="text-xs font-bold tracking-[0.18em] text-wn-primary">SECURED TRANSACTION</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-wn-ink md:text-4xl">
                Deposit → Protect → Complete → Release
              </h2>
              <p className="mt-2 text-wn-muted">
                Full project amount. Held by WorkNest. Released when the work is done.
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-auto no-scrollbar pb-2">
              <PaymentFlow activeStep={phase >= 3 ? 4 : 2} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneContainer>
  );
}
