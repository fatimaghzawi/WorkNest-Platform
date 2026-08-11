import { AnimatePresence, motion } from 'framer-motion';
import { BrowserFrame } from '../components/BrowserFrame';
import { Eyebrow, Scene } from '../components/Scene';
import { matchingSteps } from '../data/story';

export function FreelancerMoment({ step = 0 }: { step?: number }) {
  const idx = Math.min(Math.max(step, 0), matchingSteps.length - 1);
  const beat = matchingSteps[idx];

  return (
    <Scene tone="soft" className="justify-center gap-3 !py-[2.2vh]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Eyebrow>Act II · Matching</Eyebrow>
            <span className="rounded-full bg-[#F97316] px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-white">
              {beat.badge}
            </span>
            <span className="text-xs font-semibold tabular-nums text-[#8B8298]">
              {idx + 1}/{matchingSteps.length}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={beat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#1A1224] md:text-4xl">
                {beat.title}
              </h2>
              <p className="mt-2 max-w-2xl text-base text-[#5B5268] md:text-lg">{beat.line}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <AnimatePresence mode="wait">
          <motion.div
            key={beat.id + '-ui'}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <BrowserFrame
              src={beat.src}
              fallbackSrc={'fallback' in beat ? beat.fallback : undefined}
              alt={beat.title}
              url={`app.worknest.com · ${beat.id}`}
              imgClassName="max-h-[min(54vh,500px)]"
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col justify-center gap-3">
          {beat.points.map((point, i) => (
            <div
              key={point}
              className="rounded-2xl border border-[#E8E0F0] bg-white px-4 py-3.5 shadow-sm"
            >
              <p className="text-[10px] font-bold tracking-[0.16em] text-[#F97316]">0{i + 1}</p>
              <p className="mt-1 font-display text-lg font-semibold text-[#1A1224]">{point}</p>
            </div>
          ))}
          <div className="mt-1 flex gap-1.5">
            {matchingSteps.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full ${
                  i === idx ? 'w-8 bg-[#F97316]' : i < idx ? 'w-4 bg-[#FDBA74]' : 'w-2.5 bg-[#D4CBE0]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Scene>
  );
}
