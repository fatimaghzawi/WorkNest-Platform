import { motion } from 'framer-motion';
import { INTRO_ASSETS, WN, easeOut } from '../constants';

type Props = {
  visible: boolean;
  secured?: boolean;
  morphing?: boolean;
};

export function PaymentCard({ visible, secured, morphing }: Props) {
  return (
    <motion.div
      layoutId="wn-payment-card"
      className="absolute z-30 w-[min(34%,280px)]"
      initial={false}
      animate={
        morphing
          ? { opacity: 0, left: '50%', top: '55%', x: '-50%', scale: 0.4, filter: 'blur(8px)' }
          : visible
            ? secured
              ? { opacity: 1, left: '50%', top: '58%', x: '-50%', scale: 1, filter: 'blur(0px)' }
              : { opacity: 1, left: '14%', top: '62%', x: '0%', scale: 0.96, filter: 'blur(0px)' }
            : { opacity: 0, left: '10%', top: '66%', x: '0%', scale: 0.9, filter: 'blur(4px)' }
      }
      transition={{ duration: morphing ? 1.05 : 1.1, ease: easeOut }}
    >
      {/* Trust seal rings */}
      {secured && !morphing ? (
        <>
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{ borderColor: `${WN.teal}55` }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.85, 1.15], opacity: [0.55, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: `${WN.teal}40` }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: [0.9, 1.2], opacity: [0.4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.35 }}
          />
        </>
      ) : null}

      <div
        className="relative z-10 overflow-hidden rounded-2xl bg-white"
        style={{
          boxShadow: secured
            ? `0 0 0 1px ${WN.teal}66, 0 22px 50px ${WN.purple}22, 0 0 40px ${WN.teal}22`
            : `0 18px 44px ${WN.purple}18`,
          outline: `1px solid ${WN.line}`,
        }}
      >
        <div className="flex items-center justify-between px-3.5 py-2" style={{ background: WN.purple }}>
          <span className="text-[10px] font-bold tracking-[0.18em] text-white">PROJECT PAYMENT</span>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide text-white"
            style={{ background: secured ? WN.teal : 'rgba(255,255,255,0.18)' }}
          >
            {secured ? '🔒 SECURED' : 'DEPOSIT'}
          </span>
        </div>
        <div className="aspect-[16/10] overflow-hidden bg-[#F3ECF8]">
          <img
            src={INTRO_ASSETS.wallet}
            alt="WorkNest payment"
            className="h-full w-full object-cover object-[50%_40%]"
          />
        </div>
      </div>

      <motion.div
        className="relative z-10 mt-2 flex justify-center"
        initial={false}
        animate={secured && !morphing ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 6, scale: 0.94 }}
        transition={{ duration: 0.55, ease: easeOut }}
      >
        <span
          className="rounded-full px-3 py-1 text-[9px] font-bold tracking-[0.16em] text-white shadow-lg"
          style={{ backgroundColor: WN.teal }}
        >
          SECURED IN WORKNEST
        </span>
      </motion.div>
    </motion.div>
  );
}
