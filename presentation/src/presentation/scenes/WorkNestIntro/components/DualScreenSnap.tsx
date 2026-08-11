import { motion } from 'framer-motion';
import { INTRO_ASSETS, WN, easeOut } from '../constants';

type Props = {
  /** Dual screens visible. */
  visible: boolean;
  /** Screens slam together / fade into single dashboard. */
  merging?: boolean;
};

/** Client + Freelancer dashboards side-by-side, then snap into one product. */
export function DualScreenSnap({ visible, merging }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[42]">
      {/* CLIENT pane */}
      <motion.div
        className="absolute top-[10%] w-[min(44%,460px)]"
        initial={false}
        animate={
          visible
            ? merging
              ? { left: '50%', x: '-50%', opacity: 0, scale: 0.72, rotate: 0, filter: 'blur(8px)' }
              : { left: '4%', x: '0%', opacity: 1, scale: 1, rotate: -2.5, filter: 'blur(0px)' }
            : { left: '0%', x: '-8%', opacity: 0, scale: 0.9, rotate: -6, filter: 'blur(4px)' }
        }
        transition={{ duration: merging ? 0.85 : 0.9, ease: easeOut }}
      >
        <ScreenPane label="CLIENT HQ" accent={WN.purple} src={INTRO_ASSETS.clientDash} />
      </motion.div>

      {/* FREELANCER pane */}
      <motion.div
        className="absolute top-[10%] w-[min(44%,460px)]"
        initial={false}
        animate={
          visible
            ? merging
              ? { right: '50%', x: '50%', opacity: 0, scale: 0.72, rotate: 0, filter: 'blur(8px)' }
              : { right: '4%', x: '0%', opacity: 1, scale: 1, rotate: 2.5, filter: 'blur(0px)' }
            : { right: '0%', x: '8%', opacity: 0, scale: 0.9, rotate: 6, filter: 'blur(4px)' }
        }
        transition={{ duration: merging ? 0.85 : 0.9, ease: easeOut, delay: visible && !merging ? 0.08 : 0 }}
      >
        <ScreenPane label="FREELANCER HQ" accent={WN.orange} src={INTRO_ASSETS.freelancerDash} />
      </motion.div>

      {/* Center bridge label */}
      <motion.div
        className="absolute left-1/2 top-[48%] z-10 -translate-x-1/2 -translate-y-1/2"
        initial={false}
        animate={
          visible && !merging
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0, scale: 0.85, y: 10 }
        }
        transition={{ duration: 0.55, ease: easeOut }}
      >
        <div
          className="rounded-full px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-white shadow-xl"
          style={{ background: `linear-gradient(90deg, ${WN.purple}, ${WN.orange})` }}
        >
          ONE PLATFORM
        </div>
      </motion.div>

      {/* Slam flash when merging */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${WN.surface}ee 0%, transparent 55%)`,
        }}
        initial={false}
        animate={merging ? { opacity: [0, 0.7, 0] } : { opacity: 0 }}
        transition={{ duration: 0.7, ease: easeOut }}
      />
    </div>
  );
}

function ScreenPane({
  label,
  accent,
  src,
}: {
  label: string;
  accent: string;
  src: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-[16px] bg-white"
      style={{
        boxShadow: `0 28px 70px ${accent}33`,
        outline: `1px solid ${WN.line}`,
      }}
    >
      <div className="flex items-center gap-2 border-b border-[#E8E0F0] bg-[#FAF7FC] px-3 py-2">
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
          <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
          <span className="h-2 w-2 rounded-full bg-[#28C840]" />
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] text-white"
          style={{ background: accent }}
        >
          {label}
        </span>
      </div>
      <div className="aspect-[16/10] overflow-hidden bg-[#EDE4F5]">
        <img src={src} alt="" className="h-full w-full object-cover object-top" />
      </div>
    </div>
  );
}
