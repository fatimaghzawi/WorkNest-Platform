import { motion } from 'framer-motion';
import { productPillars } from '../data/presentationContent';
import { BrowserFrame } from '../components/BrowserFrame';
import { SceneContainer } from '../components/SceneContainer';

export function ProductScene({ active = 0 }: { active?: number }) {
  const idx = Math.min(Math.max(active, 0), productPillars.length - 1);

  return (
    <SceneContainer className="justify-center gap-5">
      <div>
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-wn-primary">MEET WORKNEST</p>
        <h2 className="font-display text-4xl font-bold tracking-tight text-wn-ink md:text-5xl">
          One product. The full journey.
        </h2>
        <p className="mt-2 text-lg text-wn-muted">Find → Connect → Collaborate → Get Paid</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 lg:grid-cols-4">
        {productPillars.map((p, i) => (
          <motion.div
            key={p.title}
            className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border transition ${
              i === idx
                ? 'border-wn-primary/40 bg-white shadow-lift ring-2 ring-wn-primary/15'
                : 'border-wn-line/70 bg-white/70'
            }`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="border-b border-wn-line/60 px-3 py-2.5">
              <p className="text-[10px] font-bold tracking-[0.14em] text-wn-faint">0{i + 1}</p>
              <h3 className="font-display text-lg font-bold text-wn-ink">{p.title}</h3>
              <p className="text-xs text-wn-muted">{p.line}</p>
            </div>
            <div className="min-h-0 flex-1 bg-wn-canvas">
              <BrowserFrame
                src={p.shot}
                alt={p.title}
                url="worknest"
                className="rounded-none border-0 shadow-none [&_img]:h-[min(34vh,300px)]"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </SceneContainer>
  );
}
