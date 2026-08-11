import { AnimatePresence, motion } from 'framer-motion';
import { journeyShots } from '../data/presentationContent';
import { BrowserFrame } from '../components/BrowserFrame';
import { SceneContainer } from '../components/SceneContainer';

export function WorkspaceScene({ step = 0 }: { step?: number }) {
  const idx = Math.min(Math.max(step, 0), journeyShots.length - 1);
  const shot = journeyShots[idx];
  const roleColor =
    shot.role === 'client' ? 'bg-wn-primary' : shot.role === 'freelancer' ? 'bg-wn-orange' : 'bg-wn-teal';

  return (
    <SceneContainer className="justify-center gap-4 !py-[3vh]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full ${roleColor} px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-white`}
            >
              {shot.badge}
            </span>
            <span className="text-xs font-semibold tabular-nums text-wn-faint">
              Step {idx + 1} / {journeyShots.length}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={shot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <h2 className="font-display text-3xl font-bold tracking-tight text-wn-ink md:text-4xl">
                {shot.title}
              </h2>
              <p className="mt-2 max-w-2xl text-base text-wn-muted md:text-lg">{shot.line}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="hidden text-xs text-wn-faint md:block">Press → to walk the full hire</p>
      </div>

      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={shot.src + shot.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.985, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.01, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrowserFrame
              src={shot.src}
              alt={shot.title}
              url={`app.worknest.com · ${shot.id}`}
              className="h-full shadow-lift [&_img]:h-[min(58vh,560px)] [&_img]:object-top"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {journeyShots.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 shrink-0 rounded-full transition-all ${
              i === idx ? 'w-8 bg-wn-primary' : i < idx ? 'w-4 bg-wn-accent' : 'w-3 bg-wn-line'
            }`}
            title={s.title}
          />
        ))}
      </div>
    </SceneContainer>
  );
}
