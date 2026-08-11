import { AnimatePresence, motion } from 'framer-motion';
import { PROJECT_AMOUNT } from '../data/story';

type Stage = 'ask' | 'deposit' | 'secured' | 'working' | 'unlock' | 'released';

export function MoneyFlow({ stage }: { stage: Stage }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6">
      <div className="grid w-full grid-cols-3 items-center gap-4">
        <Column label="CLIENT" />
        <Column label="WORKNEST" highlight />
        <Column label="FREELANCER" />
      </div>

      <div className="relative flex h-40 w-full max-w-3xl items-center justify-between px-6">
        <Slot label="Client" />
        <Vault locked={stage === 'secured' || stage === 'working'} open={stage === 'unlock' || stage === 'released'} />
        <Slot label="Freelancer" />

        <AnimatePresence>
          {stage === 'deposit' || stage === 'secured' || stage === 'working' ? (
            <motion.div
              key="coin-vault"
              className="absolute z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#49225B] font-display text-sm font-bold text-white shadow-2xl"
              initial={{ left: '8%', opacity: 0, scale: 0.8 }}
              animate={{
                left: stage === 'deposit' ? '46%' : '46%',
                opacity: 1,
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{ top: '28%' }}
            >
              {PROJECT_AMOUNT}
            </motion.div>
          ) : null}

          {stage === 'released' ? (
            <motion.div
              key="coin-out"
              className="absolute z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F97316] font-display text-sm font-bold text-white shadow-2xl"
              initial={{ left: '46%', opacity: 1 }}
              animate={{ left: '86%', opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ top: '28%' }}
            >
              {PROJECT_AMOUNT}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <p className="text-center font-display text-2xl font-semibold text-[#1A1224] md:text-3xl">
        {stage === 'ask' && 'Neither side should have to simply trust the other.'}
        {stage === 'deposit' && 'Client deposits the full project amount.'}
        {stage === 'secured' && 'WorkNest secures the payment.'}
        {stage === 'working' && 'The money stays protected while work happens.'}
        {stage === 'unlock' && 'Project completed. Vault unlocks.'}
        {stage === 'released' && 'Payment released.'}
      </p>
    </div>
  );
}

function Column({ label, highlight }: { label: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 text-center text-[11px] font-bold tracking-[0.18em] ${
        highlight ? 'bg-[#49225B] text-white' : 'bg-white text-[#5B5268] ring-1 ring-[#D4CBE0]'
      }`}
    >
      {label}
    </div>
  );
}

function Slot({ label }: { label: string }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed border-[#D4CBE0] bg-white/70 text-[10px] font-bold tracking-wider text-[#8B8298]">
      {label}
    </div>
  );
}

function Vault({ locked, open }: { locked?: boolean; open?: boolean }) {
  return (
    <div
      className={`flex h-28 w-28 flex-col items-center justify-center rounded-3xl border-2 ${
        open
          ? 'border-[#22C55E] bg-[#22C55E]/10'
          : locked
            ? 'border-[#49225B] bg-[#49225B]/10'
            : 'border-[#D4CBE0] bg-white'
      }`}
    >
      <span className="text-3xl">{open ? '🔓' : '🔒'}</span>
      <span className="mt-1 text-[10px] font-bold tracking-[0.16em] text-[#49225B]">VAULT</span>
    </div>
  );
}
