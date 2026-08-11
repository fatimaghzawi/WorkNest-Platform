import { motion } from 'framer-motion';
import { paymentFlow } from '../data/presentationContent';

const icons: Record<string, string> = {
  deposit: '💰',
  lock: '🔒',
  work: '👨‍💻',
  check: '✅',
  release: '💰',
};

export function PaymentFlow({ activeStep = 4 }: { activeStep?: number }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      {paymentFlow.map((step, i) => {
        const on = i <= activeStep;
        return (
          <div key={`${step.role}-${i}`} className="flex flex-col items-center">
            <motion.div
              className={`w-full rounded-2xl border px-5 py-4 transition-colors ${
                on
                  ? 'border-wn-primary/25 bg-white shadow-card'
                  : 'border-wn-line/50 bg-white/40 opacity-45'
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: on ? 1 : 0.45, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-wn-soft text-xl">
                  {icons[step.icon]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-wn-primary">
                    {step.role}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-wn-ink md:text-xl">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-wn-muted">{step.detail}</p>
                </div>
              </div>
            </motion.div>
            {i < paymentFlow.length - 1 ? (
              <div className="my-1 h-5 w-px bg-gradient-to-b from-wn-primary/50 to-wn-orange/50" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
