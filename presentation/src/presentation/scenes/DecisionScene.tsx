import { motion } from 'framer-motion';
import { proposals } from '../data/presentationContent';
import { PerspectiveBadge } from '../components/PerspectiveBadge';
import { SceneContainer } from '../components/SceneContainer';

export function DecisionScene({ selectedId = 'b' }: { selectedId?: string }) {
  return (
    <SceneContainer className="justify-center gap-6">
      <div>
        <PerspectiveBadge perspective="client" />
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-wn-ink md:text-5xl">
          If you were the client… who would you choose?
        </h2>
        <p className="mt-3 text-lg text-wn-muted">
          Opportunity → Proposal → Trust → Agreement
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-3">
        {proposals.map((p, i) => {
          const selected = p.id === selectedId;
          return (
            <motion.article
              key={p.id}
              className={`relative flex flex-col rounded-3xl border p-6 transition ${
                selected
                  ? 'border-wn-primary bg-white shadow-lift ring-2 ring-wn-primary/20'
                  : 'border-wn-line/80 bg-white/70 shadow-card'
              }`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {p.recommend ? (
                <span className="absolute -top-3 right-5 rounded-full bg-wn-orange px-3 py-1 text-[10px] font-bold tracking-wider text-white">
                  STRONG FIT
                </span>
              ) : null}
              <p className="text-xs font-bold tracking-[0.14em] text-wn-faint">PROPOSAL 0{i + 1}</p>
              <h3 className="mt-3 font-display text-2xl font-bold text-wn-ink">{p.name}</h3>
              <p className="text-wn-muted">{p.title}</p>
              <div className="mt-5 flex gap-4 text-sm font-semibold text-wn-ink">
                <span>{p.bid}</span>
                <span className="text-wn-faint">·</span>
                <span>{p.days}</span>
                <span className="text-wn-faint">·</span>
                <span>★ {p.rating}</span>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-wn-muted">{p.note}</p>
              {selected ? (
                <div className="mt-5 rounded-xl bg-wn-primary px-4 py-2.5 text-center text-sm font-bold text-white">
                  Selected
                </div>
              ) : (
                <div className="mt-5 rounded-xl bg-wn-soft px-4 py-2.5 text-center text-sm font-semibold text-wn-muted">
                  Review
                </div>
              )}
            </motion.article>
          );
        })}
      </div>
    </SceneContainer>
  );
}
