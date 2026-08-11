import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Scene } from '../components/Scene';
import { TrustLine } from '../components/TrustLine';

const beats = [
  {
    id: 'q1',
    kind: 'question' as const,
    text: 'Would you trust a stranger with your project?',
  },
  {
    id: 'q2',
    kind: 'question' as const,
    text: 'Would you trust a stranger to pay you?',
  },
  {
    id: 'people',
    kind: 'people' as const,
  },
  {
    id: 'brand',
    kind: 'brand' as const,
  },
];

export function HookMoment({ beat = 0 }: { beat?: number }) {
  const [local, setLocal] = useState(0);
  const step = Math.min(Math.max(beat || local, 0), beats.length - 1);
  const current = beats[step];

  return (
    <Scene tone={current.kind === 'brand' ? 'soft' : 'light'} className="justify-center gap-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {current.kind === 'question' ? (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full"
            >
              <p className="mb-6 text-[11px] font-bold tracking-[0.22em] text-[#8B8298]">
                THE TRUST EXPERIMENT
              </p>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-[#1A1224] md:text-6xl">
                {current.text}
              </h1>
              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLocal(Math.min(step + 1, beats.length - 1))}
                  className="rounded-2xl border border-[#E8E0F0] bg-white px-5 py-4 text-left shadow-sm transition hover:border-[#49225B]"
                >
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#49225B]">CLIENT FEAR</p>
                  <p className="mt-2 font-display text-lg font-semibold">Will they deliver?</p>
                </button>
                <button
                  type="button"
                  onClick={() => setLocal(Math.min(step + 1, beats.length - 1))}
                  className="rounded-2xl border border-[#E8E0F0] bg-white px-5 py-4 text-left shadow-sm transition hover:border-[#F97316]"
                >
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[#F97316]">FREELANCER FEAR</p>
                  <p className="mt-2 font-display text-lg font-semibold">Will I get paid?</p>
                </button>
              </div>
            </motion.div>
          ) : null}

          {current.kind === 'people' ? (
            <motion.div
              key="people"
              className="grid w-full gap-4 md:grid-cols-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Profile
                who="CLIENT"
                name="Sarah"
                line="I need someone to build my project."
                color="client"
              />
              <Profile
                who="FREELANCER"
                name="Alex"
                line="I need someone to trust me with theirs."
                color="talent"
              />
            </motion.div>
          ) : null}

          {current.kind === 'brand' ? (
            <motion.div
              key="brand"
              className="w-full"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TrustLine phase="broken" />
              <img src="/logo.png" alt="" className="mx-auto mt-10 h-16 w-16 rounded-2xl shadow-lg" />
              <h1 className="mt-5 font-display text-5xl font-extrabold tracking-tight text-[#49225B] md:text-7xl">
                WORKNEST
              </h1>
              <p className="mt-4 text-xl text-[#5B5268]">Let’s see what happens when two strangers work together.</p>
              <div className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-2">
                {['Find', 'Connect', 'Protect', 'Deliver', 'Pay'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#49225B] ring-1 ring-[#E8E0F0]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-10 flex gap-2">
          {beats.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setLocal(i)}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-[#49225B]' : 'w-2 bg-[#D4CBE0]'
              }`}
            />
          ))}
        </div>
      </div>
    </Scene>
  );
}

function Profile({
  who,
  name,
  line,
  color,
}: {
  who: string;
  name: string;
  line: string;
  color: 'client' | 'talent';
}) {
  return (
    <div className="rounded-3xl border border-[#E8E0F0] bg-white px-7 py-8 text-left shadow-[0_18px_50px_rgba(73,34,91,0.08)]">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white ${
            color === 'client' ? 'bg-[#49225B]' : 'bg-[#F97316]'
          }`}
        >
          {name[0]}
        </div>
        <div>
          <p
            className={`text-[11px] font-bold tracking-[0.18em] ${
              color === 'client' ? 'text-[#49225B]' : 'text-[#F97316]'
            }`}
          >
            {who}
          </p>
          <p className="font-display text-xl font-bold text-[#1A1224]">{name}</p>
        </div>
      </div>
      <p className="mt-5 font-display text-xl font-semibold leading-snug text-[#1A1224]">{line}</p>
    </div>
  );
}
