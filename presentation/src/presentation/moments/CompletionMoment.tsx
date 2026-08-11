import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BrowserFrame } from '../components/BrowserFrame';
import { Scene } from '../components/Scene';
import { shots } from '../data/story';

export function CompletionMoment({ beat = 0 }: { beat?: number }) {
  const [local, setLocal] = useState(0);
  const step = beat > 0 ? beat : local;

  useEffect(() => {
    if (beat > 0) return;
    const t1 = window.setTimeout(() => setLocal(1), 1200);
    const t2 = window.setTimeout(() => setLocal(2), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [beat]);

  return (
    <Scene tone={step === 0 ? 'ink' : 'soft'} className="justify-center gap-4">
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.h1
            key="done"
            className="text-center font-display text-5xl font-extrabold tracking-tight md:text-7xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            PROJECT COMPLETED
          </motion.h1>
        ) : (
          <motion.div
            key="ui"
            className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BrowserFrame
              src={step >= 2 ? shots.freelancerProjects : shots.freelancerDeliverables}
              fallbackSrc={shots.freelancerKanbanBoard}
              alt="Completion"
              url="app.worknest.com · delivery"
              imgClassName="max-h-[min(56vh,520px)]"
            />
            <div className="flex flex-col justify-center gap-4">
              <h2 className="font-display text-3xl font-bold text-[#1A1224] md:text-4xl">
                {step >= 2 ? 'CLIENT CONFIRMS COMPLETION' : 'Delivery is on the board & in the files.'}
              </h2>
              <div className="space-y-3">
                {[
                  'Kanban shows Done',
                  'Deliverables are attached',
                  'Client reviews once — then confirms',
                ].map((line, i) => (
                  <div
                    key={line}
                    className="rounded-2xl border border-[#E8E0F0] bg-white px-4 py-3.5 shadow-sm"
                  >
                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#49225B]">0{i + 1}</p>
                    <p className="mt-1 font-display text-lg font-semibold text-[#1A1224]">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Scene>
  );
}
