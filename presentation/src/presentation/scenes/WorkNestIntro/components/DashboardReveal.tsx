import { motion } from 'framer-motion';
import { INTRO_ASSETS, WN, easeOut } from '../constants';

type Props = {
  visible: boolean;
  settle?: boolean;
  brand?: boolean;
};

export function DashboardReveal({ visible, settle, brand }: Props) {
  return (
    <motion.div
      className="absolute left-1/2 top-[5%] z-40 w-[min(86%,980px)] -translate-x-1/2"
      initial={false}
      animate={
        visible
          ? brand
            ? { opacity: 0.28, y: -8, scale: 0.88, filter: 'blur(1.5px)' }
            : settle
              ? { opacity: 1, y: 0, scale: 1.02, filter: 'blur(0px)' }
              : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0, y: 36, scale: 0.9, filter: 'blur(12px)' }
      }
      transition={{ duration: brand ? 1.0 : 1.25, ease: easeOut }}
    >
      <div
        className="overflow-hidden rounded-[18px] bg-white"
        style={{
          boxShadow: `0 36px 90px ${WN.purple}26`,
          outline: `1px solid ${WN.line}`,
        }}
      >
        <div className="flex items-center gap-3 border-b border-[#E8E0F0] bg-[#FAF7FC] px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 truncate rounded-full bg-white px-3 py-1 text-center text-[11px] font-medium text-[#8B8298] ring-1 ring-[#E8E0F0]">
            app.worknest.com
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-[#EDE4F5]">
          <motion.img
            layoutId="wn-dashboard-main"
            src={INTRO_ASSETS.clientDash}
            alt="WorkNest dashboard"
            className="absolute inset-0 h-full w-full object-cover object-top"
            animate={settle && !brand ? { scale: 1.04, y: -6 } : { scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: easeOut }}
          />
        </div>
      </div>
    </motion.div>
  );
}
