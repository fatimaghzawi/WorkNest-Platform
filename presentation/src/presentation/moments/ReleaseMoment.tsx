import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BrowserFrame } from '../components/BrowserFrame';
import { MoneyFlow } from '../components/MoneyFlow';
import { Scene } from '../components/Scene';
import { TrustLine } from '../components/TrustLine';
import { shots } from '../data/story';

export function ReleaseMoment({ beat = 0 }: { beat?: number }) {
  const [local, setLocal] = useState(0);
  const step = beat > 0 ? beat : local;

  useEffect(() => {
    if (beat > 0) return;
    const timers = [0, 1, 2, 3, 4].map((i) =>
      window.setTimeout(() => setLocal(i), 350 + i * 1500),
    );
    return () => timers.forEach(clearTimeout);
  }, [beat]);

  return (
    <Scene tone="soft" className="justify-center gap-4">
      <TrustLine phase={step >= 2 ? 'released' : 'complete'} />

      <AnimatePresence mode="wait">
        {step < 2 ? (
          <motion.div
            key="flow"
            className="grid w-full gap-4 lg:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MoneyFlow stage={step === 0 ? 'unlock' : 'released'} />
            <BrowserFrame
              src={shots.freelancerWalletDetail}
              fallbackSrc={shots.freelancerWallet}
              alt="Wallet"
              url="app.worknest.com/freelancer/wallet"
              imgClassName="max-h-[min(46vh,420px)]"
            />
          </motion.div>
        ) : null}

        {step === 2 ? (
          <motion.div
            key="pay"
            className="w-full text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-[#49225B] md:text-6xl">
              PAYMENT RELEASED
            </h1>
            <p className="mt-4 text-lg text-[#5B5268]">Escrow unlocks → wallet updates.</p>
          </motion.div>
        ) : null}

        {step === 3 ? (
          <motion.div
            key="wallet"
            className="flex h-full w-full flex-col gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <p className="text-[11px] font-bold tracking-[0.18em] text-[#F97316]">
                FREELANCER WALLET
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-[#1A1224]">
                Earnings where they belong.
              </h2>
            </div>
            <BrowserFrame
              src={shots.freelancerWalletDetail}
              fallbackSrc={shots.freelancerWallet}
              alt="Freelancer wallet"
              url="app.worknest.com/freelancer/wallet"
              imgClassName="max-h-[min(50vh,460px)]"
            />
          </motion.div>
        ) : null}

        {step >= 4 ? (
          <motion.div
            key="win"
            className="text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-[#1A1224] md:text-7xl">
              BOTH SIDES WIN.
            </h1>
            <div className="mx-auto mt-8 grid max-w-2xl gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8E0F0]">
                <p className="text-[11px] font-bold tracking-[0.18em] text-[#49225B]">CLIENT</p>
                <p className="mt-2 font-display text-xl font-semibold">Project completed.</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8E0F0]">
                <p className="text-[11px] font-bold tracking-[0.18em] text-[#F97316]">FREELANCER</p>
                <p className="mt-2 font-display text-xl font-semibold">Payment in wallet.</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Scene>
  );
}
