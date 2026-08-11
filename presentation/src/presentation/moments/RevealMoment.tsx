import { useState } from 'react';
import { BrowserFrame } from '../components/BrowserFrame';
import { Eyebrow, Scene } from '../components/Scene';
import { shots } from '../data/story';

const pillars = [
  { title: 'FIND', line: 'Find the right opportunity.', src: shots.freelancerJobs },
  { title: 'CONNECT', line: 'Choose the right person.', src: shots.freelancerProposals },
  { title: 'TRUST', line: 'Protect the transaction.', src: shots.freelancerWallet },
  { title: 'DELIVER', line: 'Complete the work together.', src: shots.freelancerKanbanBoard },
];

export function RevealMoment({ beat = 0 }: { beat?: number }) {
  const [active, setActive] = useState(0);
  const step = beat;
  const pillar = pillars[Math.min(active, pillars.length - 1)];

  return (
    <Scene tone="soft" className="justify-center gap-5">
      <div className="text-center">
        <Eyebrow>You just experienced WorkNest</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#1A1224] md:text-5xl">
          {step < 1
            ? 'Not another job board.'
            : 'A trusted journey from opportunity to completion.'}
        </h2>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="flex flex-col justify-center gap-2">
          {pillars.map((p, i) => (
            <button
              key={p.title}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-2xl border px-5 py-4 text-left transition ${
                active === i
                  ? 'border-[#49225B] bg-white shadow-lg ring-2 ring-[#49225B]/15'
                  : 'border-[#E8E0F0] bg-white/70 hover:border-[#A56ABD]'
              }`}
            >
              <p className="font-display text-xl font-bold text-[#49225B]">{p.title}</p>
              <p className="mt-1 text-sm text-[#5B5268]">{p.line}</p>
            </button>
          ))}
        </div>
        <BrowserFrame
          src={pillar.src}
          alt={pillar.title}
          url={`app.worknest.com · ${pillar.title.toLowerCase()}`}
          imgClassName="max-h-[min(56vh,520px)]"
        />
      </div>
    </Scene>
  );
}
