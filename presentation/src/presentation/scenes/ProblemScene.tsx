import { motion } from 'framer-motion';
import { journey } from '../data/presentationContent';
import { SceneContainer } from '../components/SceneContainer';

export function ProblemScene() {
  return (
    <SceneContainer tone="soft" className="justify-center">
      <p className="mb-3 text-xs font-bold tracking-[0.18em] text-wn-primary">THE PROBLEM</p>
      <h2 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-wn-ink md:text-5xl">
        Every freelance project asks the same questions.
      </h2>

      <div className="mt-10 flex flex-col gap-0">
        {journey.map((item, i) => (
          <div key={item.key} className="flex flex-col items-start">
            <motion.div
              className="flex w-full max-w-2xl items-start gap-5 rounded-2xl border border-wn-line/80 bg-white/80 px-6 py-5 shadow-card backdrop-blur"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.45 }}
            >
              <span className="font-display text-sm font-bold text-wn-accent">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="font-display text-2xl font-bold text-wn-ink">{item.title}</h3>
                <p className="mt-1 text-lg text-wn-muted">{item.line}</p>
              </div>
            </motion.div>
            {i < journey.length - 1 ? (
              <div className="ml-10 h-6 w-px bg-gradient-to-b from-wn-primary/40 to-wn-orange/40" />
            ) : null}
          </div>
        ))}
      </div>

      <motion.p
        className="mt-10 max-w-3xl font-display text-2xl font-semibold leading-snug text-wn-primary md:text-3xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        We wanted the entire journey to happen in one place.
      </motion.p>
    </SceneContainer>
  );
}
