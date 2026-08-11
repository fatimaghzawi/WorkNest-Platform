import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CinematicText, Scene } from '../components/Scene';

export function WhyMoment({ beat = 0 }: { beat?: number }) {
  const [local, setLocal] = useState(0);
  const step = beat > 0 ? beat : local;

  useEffect(() => {
    if (beat > 0) return;
    const timers = [0, 1, 2, 3].map((i) => window.setTimeout(() => setLocal(i), 350 + i * 1900));
    return () => timers.forEach(clearTimeout);
  }, [beat]);

  const statements = [
    { title: 'TRUST', line: 'A client can confidently start a project.' },
    { title: 'OPPORTUNITY', line: 'A freelancer can confidently take the work.' },
    { title: 'STRUCTURE', line: 'Both sides have one place to complete the journey.' },
  ];

  return (
    <Scene tone="soft" className="justify-center">
      <div className="mx-auto w-full max-w-3xl text-center">
        <AnimatePresence mode="wait">
          {step < 3 ? (
            <CinematicText key={step}>
              <p className="mb-4 text-[11px] font-bold tracking-[0.22em] text-[#6E3482]">WHY THIS MATTERS</p>
              <h1 className="font-display text-5xl font-extrabold tracking-tight text-[#49225B] md:text-7xl">
                {statements[step].title}
              </h1>
              <p className="mt-6 text-2xl text-[#5B5268] md:text-3xl">{statements[step].line}</p>
            </CinematicText>
          ) : (
            <CinematicText key="end" className="space-y-6">
              <h1 className="font-display text-3xl font-bold md:text-5xl">
                Technology is what makes it possible.
              </h1>
              <h2 className="font-display text-3xl font-bold text-[#49225B] md:text-5xl">
                Trust is what makes it valuable.
              </h2>
            </CinematicText>
          )}
        </AnimatePresence>
      </div>
    </Scene>
  );
}
