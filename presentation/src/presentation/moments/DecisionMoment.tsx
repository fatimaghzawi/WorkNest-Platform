import { motion } from 'framer-motion';
import { useState } from 'react';
import { BrowserFrame } from '../components/BrowserFrame';
import { Eyebrow, Scene } from '../components/Scene';
import { proposals, shots } from '../data/story';

export function DecisionMoment({
  selectedId,
  onSelect,
}: {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(selectedId ?? null);
  const chosen = selectedId ?? picked;

  const choose = (id: string) => {
    setPicked(id);
    onSelect?.(id);
  };

  return (
    <Scene tone="light" className="justify-center gap-4 !py-[2.2vh]">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center">
          <Eyebrow className="!text-[#F97316]">Act III · Decision</Eyebrow>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#1A1224] md:text-4xl">
            {chosen ? 'MATCH FOUND' : 'Who should Sarah trust?'}
          </h2>
          <p className="mt-2 text-base text-[#5B5268]">
            {chosen
              ? 'Click Next to accept — then we protect the money.'
              : 'Audience moment: pick a proposal.'}
          </p>

          <div className="mt-5 space-y-3">
            {proposals.map((p, i) => {
              const on = chosen === p.id;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => choose(p.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    on
                      ? 'border-[#49225B] bg-white shadow-lg ring-2 ring-[#49225B]/15'
                      : 'border-[#E8E0F0] bg-white/85 hover:border-[#A56ABD]'
                  }`}
                  animate={{ opacity: chosen && !on ? 0.4 : 1 }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.14em] text-[#8B8298]">
                        PROPOSAL 0{i + 1}
                      </p>
                      <p className="font-display text-lg font-bold text-[#1A1224]">{p.name}</p>
                      <p className="text-sm text-[#5B5268]">
                        {p.bid} · {p.days} · ★ {p.rating}
                      </p>
                    </div>
                    {on ? (
                      <span className="rounded-full bg-[#49225B] px-3 py-1 text-[10px] font-bold text-white">
                        SELECTED
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#EDE4F5] px-3 py-1 text-[10px] font-bold text-[#49225B]">
                        CHOOSE
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <BrowserFrame
          src={shots.freelancerProposals}
          fallbackSrc={shots.clientMatching}
          alt="Proposals UI"
          url="app.worknest.com · proposals"
          imgClassName="max-h-[min(58vh,540px)]"
        />
      </div>
    </Scene>
  );
}
