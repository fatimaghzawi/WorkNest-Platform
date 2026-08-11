import { motion } from 'framer-motion';
import { architectureLayers } from '../data/presentationContent';

export function ArchitectureDiagram() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        {architectureLayers.people.map((p, i) => (
          <motion.div
            key={p}
            className="rounded-2xl border border-wn-line bg-white px-5 py-3 font-display text-sm font-semibold text-wn-ink shadow-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            {p}
          </motion.div>
        ))}
      </div>

      <div className="h-6 w-px bg-gradient-to-b from-wn-primary/40 to-wn-accent/50" />

      <motion.div
        className="rounded-2xl bg-wn-primary px-8 py-4 font-display text-lg font-bold text-white shadow-soft"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {architectureLayers.platform}
      </motion.div>

      <div className="h-6 w-px bg-gradient-to-b from-wn-accent/50 to-wn-orange/40" />

      <div className="flex max-w-3xl flex-wrap justify-center gap-2.5">
        {architectureLayers.modules.map((m, i) => (
          <motion.span
            key={m}
            className="rounded-full border border-wn-line bg-white px-4 py-2 text-sm font-semibold text-wn-muted shadow-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 + i * 0.05 }}
          >
            {m}
          </motion.span>
        ))}
      </div>

      <div className="h-6 w-px bg-gradient-to-b from-wn-orange/40 to-wn-teal/50" />

      <motion.div
        className="rounded-2xl border border-wn-teal/30 bg-wn-teal/10 px-6 py-3 text-sm font-bold tracking-wide text-wn-ink"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        {architectureLayers.data}
      </motion.div>
    </div>
  );
}
