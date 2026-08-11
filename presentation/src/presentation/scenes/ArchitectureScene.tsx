import { motion } from 'framer-motion';
import { architectureLayers } from '../data/presentationContent';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { SceneContainer } from '../components/SceneContainer';

export function ArchitectureScene() {
  return (
    <SceneContainer tone="soft" className="justify-center gap-6">
      <div className="max-w-3xl">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-wn-primary">BEHIND THE EXPERIENCE</p>
        <h2 className="font-display text-3xl font-bold tracking-tight text-wn-ink md:text-4xl">
          What looks simple on the outside requires thoughtful engineering underneath.
        </h2>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ArchitectureDiagram />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {architectureLayers.qualities.map((q, i) => (
            <motion.div
              key={q.title}
              className="rounded-2xl border border-wn-line/80 bg-white/90 px-5 py-4 shadow-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
            >
              <h3 className="font-display text-lg font-bold text-wn-ink">{q.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-wn-muted">{q.line}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SceneContainer>
  );
}
