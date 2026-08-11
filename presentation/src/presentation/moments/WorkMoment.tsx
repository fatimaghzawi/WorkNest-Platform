import { AnimatePresence, motion } from 'framer-motion';
import { BrowserFrame } from '../components/BrowserFrame';
import { Eyebrow, Scene } from '../components/Scene';
import { workspaceJourney } from '../data/story';

export function WorkMoment({ step = 0 }: { step?: number }) {
  const idx = Math.min(Math.max(step, 0), workspaceJourney.length - 1);
  const phase = workspaceJourney[idx];

  return (
    <Scene tone="soft" className="justify-center gap-3 !py-[2vh]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Eyebrow>Act VI · Workspace</Eyebrow>
            <span className="rounded-full bg-[#49225B] px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-white">
              {phase.badge}
            </span>
            <span className="text-xs font-semibold tabular-nums text-[#8B8298]">
              {idx + 1}/{workspaceJourney.length}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#1A1224] md:text-4xl">
                {phase.title}
              </h2>
              <p className="mt-2 text-base text-[#5B5268] md:text-lg">{phase.line}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="hidden text-xs text-[#8B8298] lg:block">Click screenshot to expand · → next</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase.id + '-frame'}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <BrowserFrame
              src={phase.src}
              fallbackSrc={'fallback' in phase ? phase.fallback : undefined}
              alt={phase.title}
              url={`app.worknest.com/workspace · ${phase.id}`}
              imgClassName="max-h-[min(54vh,500px)]"
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col justify-center gap-3">
          {phase.points.map((point, i) => (
            <motion.div
              key={phase.id + point}
              className="rounded-2xl border border-[#E8E0F0] bg-white px-4 py-3.5 shadow-sm"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <p className="text-[10px] font-bold tracking-[0.16em] text-[#A56ABD]">0{i + 1}</p>
              <p className="mt-1 font-display text-lg font-semibold leading-snug text-[#1A1224]">
                {point}
              </p>
            </motion.div>
          ))}
          <div className="mt-1 flex flex-wrap gap-1.5">
            {workspaceJourney.map((s, i) => (
              <span
                key={s.id}
                title={s.title}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? 'w-7 bg-[#49225B]' : i < idx ? 'w-3 bg-[#A56ABD]' : 'w-2 bg-[#D4CBE0]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
