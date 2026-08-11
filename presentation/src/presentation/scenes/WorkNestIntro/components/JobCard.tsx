import { motion } from 'framer-motion';
import { INTRO_ASSETS, WN, easeOut } from '../constants';

type Props = {
  visible: boolean;
  morphing?: boolean;
};

export function JobCard({ visible, morphing }: Props) {
  return (
    <motion.div
      layoutId="wn-job-card"
      className="absolute left-1/2 top-[16%] z-30 w-[min(42%,340px)] -translate-x-1/2"
      initial={false}
      animate={
        morphing
          ? { opacity: 0, y: 80, scale: 0.45, filter: 'blur(8px)' }
          : visible
            ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
            : { opacity: 0, y: 18, scale: 0.72, filter: 'blur(6px)' }
      }
      transition={{ duration: morphing ? 1.05 : 0.95, ease: easeOut }}
    >
      <div
        className="overflow-hidden rounded-2xl bg-white"
        style={{
          boxShadow: `0 22px 50px ${WN.purple}1F`,
          outline: `1px solid ${WN.line}`,
        }}
      >
        <div className="flex items-center justify-between px-3.5 py-2" style={{ background: WN.purple }}>
          <span className="text-[10px] font-bold tracking-[0.18em] text-white">PROJECT</span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold text-white/90">
            OPEN
          </span>
        </div>
        <div className="aspect-[16/9] overflow-hidden bg-[#F3ECF8]">
          <img
            src={INTRO_ASSETS.jobs}
            alt="WorkNest job"
            className="h-full w-full object-cover object-[20%_58%]"
          />
        </div>
      </div>
    </motion.div>
  );
}
