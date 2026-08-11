import { useState } from 'react';
import { BrowserFrame } from '../components/BrowserFrame';
import { Eyebrow, Scene } from '../components/Scene';
import { shots } from '../data/story';

const fears = [
  {
    id: 'send',
    who: 'CLIENT',
    q: 'Do I send the money first?',
    color: 'text-[#49225B]',
    bg: 'hover:border-[#49225B]',
  },
  {
    id: 'start',
    who: 'FREELANCER',
    q: 'Do I start working first?',
    color: 'text-[#F97316]',
    bg: 'hover:border-[#F97316]',
  },
];

export function TruthMoment({ beat = 0 }: { beat?: number }) {
  const [picked, setPicked] = useState<string | null>(null);
  const step = beat;

  return (
    <Scene tone={step >= 2 ? 'ink' : 'soft'} className="justify-center gap-6">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center">
          <Eyebrow className={step >= 2 ? '!text-[#A56ABD]' : undefined}>Act IV · The money</Eyebrow>
          <h2
            className={`mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl ${
              step >= 2 ? 'text-white' : 'text-[#1A1224]'
            }`}
          >
            {step < 1
              ? 'The freelancer is chosen.'
              : step < 2
                ? 'But there is still a problem.'
                : step < 3
                  ? 'THE MONEY.'
                  : 'Neither side should simply trust the other.'}
          </h2>
          <p className={`mt-4 text-lg ${step >= 2 ? 'text-white/70' : 'text-[#5B5268]'}`}>
            Tap a fear — this is the deadlock freelance work usually hits.
          </p>

          <div className="mt-6 space-y-3">
            {fears.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setPicked(f.id)}
                className={`w-full rounded-2xl border px-5 py-4 text-left transition ${
                  step >= 2
                    ? 'border-white/15 bg-white/10 text-white'
                    : `border-[#E8E0F0] bg-white ${f.bg}`
                } ${picked === f.id ? 'ring-2 ring-[#F97316]/40' : ''}`}
              >
                <p className={`text-[11px] font-bold tracking-[0.16em] ${step >= 2 ? 'text-[#FDBA74]' : f.color}`}>
                  {f.who}
                </p>
                <p className="mt-2 font-display text-xl font-semibold">{f.q}</p>
              </button>
            ))}
          </div>
        </div>

        <BrowserFrame
          src={shots.freelancerWallet}
          alt="Escrow & wallet context"
          url="app.worknest.com · trust layer"
          imgClassName="max-h-[min(56vh,520px)]"
        />
      </div>
    </Scene>
  );
}
