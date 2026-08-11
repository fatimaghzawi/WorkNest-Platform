import { useEffect, useState } from 'react';
import { MoneyFlow } from '../components/MoneyFlow';
import { Eyebrow, Scene } from '../components/Scene';
import { TrustLine } from '../components/TrustLine';
import { BrowserFrame } from '../components/BrowserFrame';
import { shots } from '../data/story';

export function VaultMoment({ beat = 0 }: { beat?: number }) {
  const [local, setLocal] = useState(0);
  const step = beat > 0 ? beat : local;

  useEffect(() => {
    if (beat > 0) return;
    const timers = [0, 1, 2].map((i) => window.setTimeout(() => setLocal(i), 400 + i * 1800));
    return () => timers.forEach(clearTimeout);
  }, [beat]);

  const stage = step === 0 ? 'deposit' : step === 1 ? 'secured' : 'working';

  return (
    <Scene tone="soft" className="justify-center gap-4 !py-[2.2vh]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Act V · Trust mechanism</Eyebrow>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#1A1224] md:text-4xl">
            Full amount. Secured. Then work begins.
          </h2>
        </div>
      </div>

      <TrustLine phase={stage === 'deposit' ? 'linked' : 'funded'} />

      <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-4 lg:grid-cols-2">
        <MoneyFlow stage={stage} />
        <BrowserFrame
          src={shots.freelancerWallet}
          alt="Escrow context"
          url="app.worknest.com · secured funds"
          imgClassName="max-h-[min(48vh,440px)]"
        />
      </div>
    </Scene>
  );
}
