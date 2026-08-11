import { motion } from 'framer-motion';
import { journeySteps } from '../data/journey';

export function JourneyRecap({ activeIndex = 10 }: { activeIndex?: number }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3">
      {journeySteps.map((step, i) => (
        <motion.div
          key={step}
          className="flex w-full max-w-md items-center gap-3"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              i <= activeIndex ? 'bg-[#49225B] text-white' : 'bg-[#E8E0F0] text-[#8B8298]'
            }`}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <div
            className={`flex-1 rounded-xl px-4 py-2.5 font-display text-sm font-semibold tracking-wide ${
              i <= activeIndex
                ? 'bg-white text-[#1A1224] shadow-sm ring-1 ring-[#E8E0F0]'
                : 'bg-white/40 text-[#8B8298]'
            }`}
          >
            {step}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
