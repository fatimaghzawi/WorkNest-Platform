import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BrowserFrame } from '../components/BrowserFrame';
import { Scene } from '../components/Scene';
import { shots } from '../data/story';

export function ClosingMoment({ beat = 0 }: { beat?: number }) {
  const [local, setLocal] = useState(0);
  const step = beat > 0 ? beat : local;

  useEffect(() => {
    if (beat > 0) return;
    const timers = [0, 1, 2].map((i) => window.setTimeout(() => setLocal(i), 400 + i * 2200));
    return () => timers.forEach(clearTimeout);
  }, [beat]);

  return (
    <Scene tone={step >= 2 ? 'ink' : 'soft'} className="justify-center gap-5">
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="before"
            className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card who="CLIENT" line="Can I trust this person?" />
            <Card who="FREELANCER" line="Can I trust this client?" />
          </motion.div>
        ) : null}

        {step === 1 ? (
          <motion.div
            key="after"
            className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[1fr_1.1fr]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Card who="CLIENT" line="I found the right person." />
              <Card who="FREELANCER" line="I found the right opportunity." />
              <Card who="CLIENT" line="My payment was protected." />
              <Card who="FREELANCER" line="My work was rewarded." />
            </div>
            <BrowserFrame
              src={shots.freelancerKanbanBoard}
              alt="Workspace"
              url="app.worknest.com/workspace"
              imgClassName="max-h-[min(48vh,440px)]"
            />
          </motion.div>
        ) : null}

        {step >= 2 ? (
          <motion.div
            key="final"
            className="text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <img src="/logo.png" alt="" className="mx-auto h-16 w-16 rounded-2xl" />
            <h1 className="mt-6 font-display text-6xl font-extrabold tracking-tight md:text-8xl">
              WORKNEST
            </h1>
            <p className="mt-6 font-display text-2xl font-semibold tracking-[0.12em] text-[#A56ABD] md:text-3xl">
              FIND. TRUST. WORK.
            </p>
            <p className="mx-auto mt-5 max-w-md text-lg text-white/70">
              Because great work starts with trust.
            </p>
            <p className="mt-14 text-sm tracking-[0.2em] text-white/40">Questions?</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Scene>
  );
}

function Card({ who, line }: { who: string; line: string }) {
  return (
    <div className="rounded-3xl border border-[#E8E0F0] bg-white px-6 py-6 text-left shadow-sm">
      <p
        className={`text-[11px] font-bold tracking-[0.18em] ${
          who === 'CLIENT' ? 'text-[#49225B]' : 'text-[#F97316]'
        }`}
      >
        {who}
      </p>
      <p className="mt-3 font-display text-xl font-semibold text-[#1A1224]">{line}</p>
    </div>
  );
}
