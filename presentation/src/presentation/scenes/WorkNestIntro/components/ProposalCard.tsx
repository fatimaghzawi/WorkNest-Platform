import { motion } from 'framer-motion';
import { INTRO_ASSETS, WN, easeOut } from '../constants';

type Props = {
  visible: boolean;
  arrived?: boolean;
  morphing?: boolean;
};

export function ProposalCard({ visible, arrived, morphing }: Props) {
  return (
    <>
      <motion.div
        layoutId="wn-proposal-card"
        className="absolute z-30 w-[min(36%,300px)]"
        initial={false}
        animate={
          morphing
            ? { opacity: 0, left: '50%', top: '42%', x: '-50%', y: 40, scale: 0.4, filter: 'blur(8px)' }
            : visible
              ? arrived
                ? { opacity: 1, left: '18%', top: '48%', x: '0%', y: 0, scale: 0.92, filter: 'blur(0px)' }
                : { opacity: 1, left: '58%', top: '44%', x: '0%', y: 0, scale: 1, filter: 'blur(0px)' }
              : { opacity: 0, left: '72%', top: '40%', x: '0%', y: 12, scale: 0.85, filter: 'blur(4px)' }
        }
        transition={{ duration: morphing ? 1.05 : arrived ? 1.25 : 0.9, ease: easeOut }}
      >
        <div
          className="overflow-hidden rounded-2xl bg-white"
          style={{
            boxShadow: `0 20px 48px ${WN.orange}24`,
            outline: `1px solid ${WN.line}`,
          }}
        >
          <div className="flex items-center justify-between px-3.5 py-2" style={{ background: WN.orange }}>
            <span className="text-[10px] font-bold tracking-[0.18em] text-white">PROPOSAL</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold text-white">
              {arrived ? 'MATCHED' : 'SENT'}
            </span>
          </div>
          <div className="aspect-[5/3] overflow-hidden bg-[#FFF7ED]">
            <img
              src={INTRO_ASSETS.proposals}
              alt="WorkNest proposal"
              className="h-full w-full object-cover object-[50%_30%]"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute left-[18%] top-[72%] z-40"
        initial={false}
        animate={arrived && !morphing ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.55, ease: easeOut }}
      >
        <span
          className="rounded-full px-3 py-1 text-[9px] font-bold tracking-[0.16em] text-white"
          style={{ backgroundColor: WN.purple }}
        >
          PROPOSAL RECEIVED
        </span>
      </motion.div>
    </>
  );
}
