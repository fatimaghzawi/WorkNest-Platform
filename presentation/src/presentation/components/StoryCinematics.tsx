import { useEffect } from 'react';
import { STORY_CHAPTERS, type Beat } from '../data/journey';

/** Persistent story ribbon — FIND → SPARK → MEET → MATCH → FUND → WORK → PAY */
export function StoryRibbon({ chapter }: { chapter?: Beat['chapter'] }) {
  const activeIdx = chapter ? STORY_CHAPTERS.indexOf(chapter as (typeof STORY_CHAPTERS)[number]) : -1;
  if (!chapter || chapter === 'GAP' || chapter === 'ARC') {
    return (
      <div className="pointer-events-none absolute left-1/2 top-2.5 z-50 hidden -translate-x-1/2 short:hidden md:block md:short:top-2">
        <div className="rounded-full bg-white px-3 py-1 text-[9px] font-bold tracking-[0.22em] text-wn-primary shadow-card ring-1 ring-wn-line">
          WORKNEST · THE BRIDGE
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-2.5 z-50 hidden -translate-x-1/2 short:hidden md:block md:short:top-2">
      <div className="flex items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-card ring-1 ring-wn-line short:scale-90">
        {STORY_CHAPTERS.map((c, i) => {
          const on = i === activeIdx;
          const done = i < activeIdx;
          return (
            <div key={c} className="flex items-center gap-1">
              {i > 0 ? <span className="h-px w-2 bg-wn-line" /> : null}
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] transition ${
                  on
                    ? 'bg-wn-primary text-white'
                    : done
                      ? 'bg-wn-soft text-wn-accent'
                      : 'text-wn-faint'
                }`}
              >
                {c}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Cast chip — who we’re watching right now */
export function CastChip({ perspective }: { perspective: Beat['perspective'] }) {
  if (perspective === 'system') return null;

  const label =
    perspective === 'both' ? 'Sarah + Jack' : perspective === 'client' ? 'Sarah' : 'Jack';

  return (
    <div className="pointer-events-none absolute right-5 top-14 z-50 hidden short:hidden md:block">
      <div className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-wn-primary shadow-card ring-1 ring-wn-line">
        Watching · {label}
      </div>
    </div>
  );
}

export function usePrefetchShots(shots: string[]) {
  useEffect(() => {
    shots.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [shots]);
}
