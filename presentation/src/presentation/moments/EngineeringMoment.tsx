import { motion } from 'framer-motion';
import { Eyebrow, Scene } from '../components/Scene';

export function EngineeringMoment() {
  return (
    <Scene tone="light" className="justify-center gap-8">
      <div className="text-center">
        <Eyebrow>What makes the experience possible?</Eyebrow>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#1A1224] md:text-5xl">
          Thoughtful structure. Quiet power.
        </h2>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3">
        <Pill delay={0}>CLIENT · FREELANCER · ADMIN</Pill>
        <Line />
        <Pill delay={0.1} strong>
          WORKNEST PLATFORM
        </Pill>
        <Line />
        <div className="flex flex-wrap justify-center gap-2">
          {['IDENTITY', 'PROJECTS', 'PAYMENTS', 'COMMUNICATION'].map((m, i) => (
            <motion.span
              key={m}
              className="rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wide text-[#5B5268] ring-1 ring-[#E8E0F0]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
            >
              {m}
            </motion.span>
          ))}
        </div>
        <Line />
        <Pill delay={0.45}>DATA</Pill>
      </div>

      <div className="mx-auto grid w-full max-w-4xl gap-3 md:grid-cols-3">
        {[
          {
            n: '01',
            t: 'Security',
            d: 'Different people have different responsibilities and permissions.',
          },
          {
            n: '02',
            t: 'Reliability',
            d: 'Important actions are validated before they affect the system.',
          },
          {
            n: '03',
            t: 'Structure',
            d: 'The system is organized into clear domains so the product can grow.',
          },
        ].map((item, i) => (
          <motion.div
            key={item.n}
            className="rounded-2xl border border-[#E8E0F0] bg-white px-5 py-5 text-left shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
          >
            <p className="text-[11px] font-bold tracking-[0.16em] text-[#A56ABD]">{item.n}</p>
            <h3 className="mt-2 font-display text-xl font-bold text-[#1A1224]">{item.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5B5268]">{item.d}</p>
          </motion.div>
        ))}
      </div>
    </Scene>
  );
}

function Pill({
  children,
  delay = 0,
  strong,
}: {
  children: string;
  delay?: number;
  strong?: boolean;
}) {
  return (
    <motion.div
      className={`rounded-2xl px-6 py-3 text-sm font-bold tracking-wide ${
        strong ? 'bg-[#49225B] text-white shadow-lg' : 'bg-white text-[#1A1224] ring-1 ring-[#E8E0F0]'
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function Line() {
  return <div className="h-5 w-px bg-gradient-to-b from-[#49225B]/50 to-[#F97316]/50" />;
}
