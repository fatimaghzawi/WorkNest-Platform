import { AnimatePresence, motion } from 'framer-motion';
import { PROJECT_AMOUNT, type MoneyState } from '../data/journey';

export function PaymentVault({ state }: { state: MoneyState }) {
  if (state === 'none') return null;

  return (
    <div className="rounded-3xl border border-[#E8E0F0] bg-white/95 p-5 shadow-[0_18px_50px_rgba(73,34,91,0.1)] backdrop-blur">
      <p className="text-[10px] font-bold tracking-[0.18em] text-[#8B8298]">TRUST LAYER</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Node label="CLIENT" active={state === 'deposit' || state === 'ask'} />
        <div className="relative h-1 flex-1 rounded-full bg-[#E8E0F0]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#49225B] to-[#F97316]"
            animate={{
              width:
                state === 'ask'
                  ? '10%'
                  : state === 'deposit'
                    ? '50%'
                    : state === 'secured' || state === 'working'
                      ? '50%'
                      : state === 'release' || state === 'paid'
                        ? '100%'
                        : '0%',
            }}
            transition={{ duration: 0.8 }}
          />
          <AnimatePresence>
            {(state === 'secured' || state === 'working') && (
              <motion.div
                key="lock"
                className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-[#49225B] px-2.5 py-1 text-[10px] font-bold text-white"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                🔒 {PROJECT_AMOUNT}
              </motion.div>
            )}
            {(state === 'release' || state === 'paid') && (
              <motion.div
                key="coin"
                className="absolute top-1/2 flex -translate-y-1/2 items-center rounded-full bg-[#F97316] px-2.5 py-1 text-[10px] font-bold text-white"
                initial={{ left: '45%' }}
                animate={{ left: '88%' }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                💰
              </motion.div>
            )}
            {state === 'deposit' && (
              <motion.div
                key="dep"
                className="absolute top-1/2 flex -translate-y-1/2 items-center rounded-full bg-[#49225B] px-2.5 py-1 text-[10px] font-bold text-white"
                initial={{ left: '8%' }}
                animate={{ left: '42%' }}
                transition={{ duration: 0.85 }}
              >
                {PROJECT_AMOUNT}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Node label="NEST" active={state === 'secured' || state === 'working'} nest />
        <div className="h-1 w-8 rounded-full bg-[#E8E0F0]" />
        <Node label="FREELANCER" active={state === 'paid' || state === 'release'} talent />
      </div>
      <p className="mt-4 text-center font-display text-sm font-semibold text-[#1A1224]">
        {state === 'ask' && 'Who pays first?'}
        {state === 'deposit' && 'Client deposits full amount'}
        {state === 'secured' && 'Funds secured in WorkNest'}
        {state === 'working' && '🔒 Payment secured · work in progress'}
        {state === 'release' && 'Vault unlocks · payment moves'}
        {state === 'paid' && 'Payment released to freelancer'}
      </p>
    </div>
  );
}

function Node({
  label,
  active,
  nest,
  talent,
}: {
  label: string;
  active?: boolean;
  nest?: boolean;
  talent?: boolean;
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wide ${
        active
          ? nest
            ? 'bg-[#49225B] text-white'
            : talent
              ? 'bg-[#F97316] text-white'
              : 'bg-[#49225B] text-white'
          : 'bg-[#F3EEF8] text-[#8B8298]'
      }`}
    >
      {label}
    </span>
  );
}
