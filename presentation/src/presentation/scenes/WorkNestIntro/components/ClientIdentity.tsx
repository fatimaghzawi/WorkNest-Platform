import { motion } from 'framer-motion';
import { INTRO_ASSETS, WN, easeOut } from '../constants';

type Props = {
  visible: boolean;
  absorbing?: boolean;
  morphing?: boolean;
};

export function ClientIdentity({ visible, absorbing, morphing }: Props) {
  return (
    <motion.div
      layoutId="wn-client-avatar"
      className="absolute left-[9%] top-[38%] z-20 flex -translate-y-1/2 flex-col items-center"
      initial={false}
      animate={
        morphing
          ? { opacity: 0, x: 100, y: -28, scale: 0.4, filter: 'blur(8px)' }
          : visible
            ? absorbing
              ? { opacity: 0.6, x: 20, y: 0, scale: 0.96, filter: 'blur(0px)' }
              : { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }
            : { opacity: 0, x: -48, y: 10, scale: 0.9, filter: 'blur(12px)' }
      }
      transition={{ duration: morphing ? 1.1 : 1.15, ease: easeOut }}
    >
      <div
        className="h-[88px] w-[88px] overflow-hidden rounded-full bg-[#EDE4F5] md:h-[104px] md:w-[104px]"
        style={{
          outline: `3px solid ${WN.purple}`,
          boxShadow: `0 18px 40px ${WN.purple}33`,
        }}
      >
        <img
          src={INTRO_ASSETS.clientAvatar}
          alt="Sarah"
          className="h-full w-full object-cover object-center"
        />
      </div>
      <motion.span
        className="mt-3 rounded-full px-3.5 py-1 text-[10px] font-bold tracking-[0.2em] text-white"
        style={{ backgroundColor: WN.purple }}
        initial={false}
        animate={visible && !morphing ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.55, delay: visible ? 0.25 : 0 }}
      >
        SARAH
      </motion.span>
    </motion.div>
  );
}
