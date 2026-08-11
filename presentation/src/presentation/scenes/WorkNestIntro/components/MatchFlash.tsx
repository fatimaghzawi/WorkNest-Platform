import { motion } from 'framer-motion';
import { WN, easeOut } from '../constants';

type Props = {
  /** Fire a short match burst when true. */
  active: boolean;
};

/** Brief flash when the proposal reaches the client — “matched”. */
export function MatchFlash({ active }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[45]">
      {/* Radial burst */}
      <motion.div
        className="absolute left-[22%] top-[52%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${WN.orange}55 0%, ${WN.purple}22 35%, transparent 70%)`,
        }}
        initial={false}
        animate={active ? { opacity: [0, 1, 0], scale: [0.4, 1.35, 1.6] } : { opacity: 0, scale: 0.4 }}
        transition={{ duration: 0.85, ease: easeOut }}
      />

      {/* Expanding ring */}
      <motion.div
        className="absolute left-[22%] top-[52%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{ borderColor: WN.orange }}
        initial={false}
        animate={active ? { opacity: [0, 0.9, 0], scale: [0.5, 1.8] } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.75, ease: easeOut }}
      />

      {/* MATCHED chip */}
      <motion.div
        className="absolute left-[22%] top-[38%] -translate-x-1/2"
        initial={false}
        animate={active ? { opacity: [0, 1, 1, 0], y: [12, 0, 0, -8], scale: [0.9, 1.05, 1, 0.98] } : { opacity: 0, y: 12 }}
        transition={{ duration: 1.35, ease: easeOut }}
      >
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${WN.purple}, ${WN.orange})`,
          }}
        >
          <span className="h-2 w-2 rounded-full bg-white" />
          <span className="text-[11px] font-bold tracking-[0.2em] text-white">MATCHED</span>
        </div>
      </motion.div>

      {/* Tiny spark dots */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const dist = 56;
        return (
          <motion.span
            key={i}
            className="absolute left-[22%] top-[52%] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: i % 2 === 0 ? WN.orange : WN.purple }}
            initial={false}
            animate={
              active
                ? {
                    opacity: [0, 1, 0],
                    x: [0, Math.cos(angle) * dist],
                    y: [0, Math.sin(angle) * dist],
                    scale: [0.5, 1.2, 0.3],
                  }
                : { opacity: 0, x: 0, y: 0 }
            }
            transition={{ duration: 0.7, delay: 0.05 * i, ease: easeOut }}
          />
        );
      })}
    </div>
  );
}
