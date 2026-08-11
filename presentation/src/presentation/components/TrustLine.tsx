import { motion } from 'framer-motion';

type Phase = 'broken' | 'linked' | 'funded' | 'working' | 'complete' | 'released';

export function TrustLine({ phase = 'broken' }: { phase?: Phase }) {
  const solid = phase !== 'broken';
  const funded = ['funded', 'working', 'complete', 'released'].includes(phase);
  const released = phase === 'released';

  return (
    <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-2">
      <Node label="CLIENT" tone="client" />
      <div className="relative h-[2px] flex-1">
        <motion.div
          className={`absolute inset-y-0 left-0 ${
            solid ? 'bg-[#49225B]' : 'bg-[repeating-linear-gradient(90deg,#C4B5D0_0_8px,transparent_8px_14px)]'
          }`}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.7 }}
          style={{ height: 2 }}
        />
        {funded && !released ? (
          <motion.div
            className="absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-[#49225B] px-2.5 py-1 text-[10px] font-bold text-white shadow-lg"
            style={{ left: '50%', x: '-50%' }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            🔒 $
          </motion.div>
        ) : null}
        {released ? (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 rounded-full bg-[#F97316] px-2.5 py-1 text-[10px] font-bold text-white"
            initial={{ left: '50%', opacity: 1 }}
            animate={{ left: '92%', opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            💰
          </motion.div>
        ) : null}
      </div>
      <Node label="WORKNEST" tone="nest" active={funded} />
      <div className="relative h-[2px] flex-1">
        <motion.div
          className={`absolute inset-y-0 left-0 ${
            solid ? 'bg-[#49225B]' : 'bg-[repeating-linear-gradient(90deg,#C4B5D0_0_8px,transparent_8px_14px)]'
          }`}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ height: 2 }}
        />
      </div>
      <Node label="FREELANCER" tone="talent" />
    </div>
  );
}

function Node({
  label,
  tone,
  active,
}: {
  label: string;
  tone: 'client' | 'nest' | 'talent';
  active?: boolean;
}) {
  const colors = {
    client: 'bg-[#49225B] text-white',
    nest: active ? 'bg-[#F97316] text-white' : 'bg-white text-[#49225B] ring-1 ring-[#D4CBE0]',
    talent: 'bg-[#F97316] text-white',
  };
  return (
    <div className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] ${colors[tone]}`}>
      {label}
    </div>
  );
}
