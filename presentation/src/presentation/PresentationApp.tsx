import { useCallback, useEffect, useMemo, useState } from 'react';
import { ALL_SHOTS, journey } from './data/journey';
import { JourneyExperience } from './components/JourneyExperience';
import { CastChip, StoryRibbon, usePrefetchShots } from './components/StoryCinematics';

const TOTAL = journey.length;

/**
 * Presenter-controlled deck — nothing advances on its own.
 * ← → Space / buttons move slides. Esc toggles chrome. F fullscreen. M jump to smart match.
 */
export function PresentationApp() {
  const [index, setIndex] = useState(0);
  const [showChrome, setShowChrome] = useState(true);
  const [introReplayKey, setIntroReplayKey] = useState(0);

  usePrefetchShots(useMemo(() => ALL_SHOTS, []));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('beat') || window.location.hash.replace(/^#/, '');
    if (!raw) return;
    const idx = journey.findIndex((b) => b.id === raw || b.chapter === raw.toUpperCase());
    if (idx >= 0) setIndex(idx);
  }, []);

  const go = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(TOTAL - 1, next)));
  }, []);

  const beat = journey[index];
  const isCover = beat.id === 'cover';
  const isEnd = index === TOTAL - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
      if (document.querySelector('[aria-modal="true"]') && e.key === 'Escape') return;

      if (isCover && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIntroReplayKey((k) => k + 1);
        return;
      }

      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const sparkIdx = journey.findIndex((b) => b.id === 'smart-match');
        if (sparkIdx >= 0) go(sparkIdx);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        if (index < TOTAL - 1) go(index + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (index > 0) go(index - 1);
      } else if (e.key === 'Escape') {
        setShowChrome((v) => !v);
      } else if (e.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      } else if (e.key === 'Home') {
        go(0);
        if (index === 0) setIntroReplayKey((k) => k + 1);
      } else if (e.key === 'End') {
        go(TOTAL - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, isCover]);

  useEffect(() => {
    document.title = `WorkNest — ${beat.line}`;
  }, [beat.line]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('beat', beat.id);
    window.history.replaceState({}, '', url);
  }, [beat.id]);

  return (
    <div
      className="relative h-dvh w-full overflow-hidden font-body text-wn-ink"
      style={{ backgroundColor: 'var(--wn-page)', backgroundImage: 'var(--wn-page-wash)' }}
    >
      <JourneyExperience index={index} introReplayKey={introReplayKey} />

      {!isCover && !isEnd && beat.id !== 'arc' && beat.id !== 'end' ? (
        <StoryRibbon chapter={beat.chapter} />
      ) : null}
      {!isCover && !isEnd && beat.id !== 'arc' && beat.id !== 'end' ? (
        <CastChip perspective={beat.perspective} />
      ) : null}

      {showChrome ? (
        <>
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-40 h-[2px] bg-wn-line short:h-[2px] md:h-[3px]">
            <div
              className="h-full bg-gradient-to-r from-wn-primary via-wn-accent to-wn-teal transition-all duration-300"
              style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
            />
          </div>

          <div className="absolute right-3 top-2.5 z-40 short:top-2 short:right-2.5 md:right-5 md:top-4">
            <div className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold tabular-nums text-wn-muted shadow-card ring-1 ring-wn-line short:px-2 short:py-0.5 short:text-[9px] md:px-3 md:py-1.5 md:text-xs">
              {String(index + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
            </div>
          </div>

          {!isCover ? (
            <div className="pointer-events-none absolute bottom-5 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-1.5 short:bottom-3.5 short:hidden md:flex lg:bottom-6">
              {journey.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  title={b.line}
                  onClick={() => go(i)}
                  className={`pointer-events-auto h-1.5 rounded-full transition-all short:h-1 md:h-2 ${
                    i === index
                      ? 'w-6 bg-wn-primary md:w-8'
                      : i < index
                        ? 'w-2 bg-wn-accent/70 hover:bg-wn-accent md:w-2.5'
                        : 'w-1.5 bg-wn-line hover:bg-wn-faint md:w-2'
                  }`}
                />
              ))}
            </div>
          ) : null}

          <div className="absolute bottom-3 right-3 z-40 flex items-center gap-1.5 short:bottom-2.5 short:right-2.5 md:bottom-5 md:right-5 md:gap-2">
            <p className="mr-1 hidden text-[11px] text-wn-faint short:hidden xl:block">You control the pace · ← →</p>
            <button
              type="button"
              onClick={() => {
                if (isCover) setIntroReplayKey((k) => k + 1);
                else go(index - 1);
              }}
              disabled={!isCover && index === 0}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-wn-primary shadow-card ring-1 ring-wn-line transition hover:bg-wn-soft disabled:opacity-35 short:px-2.5 short:py-1 short:text-[11px] md:px-4 md:py-2 md:text-sm"
            >
              {isCover ? 'Replay' : 'Prev'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isEnd) go(index + 1);
              }}
              disabled={isEnd}
              className="rounded-full bg-wn-primary px-3 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:bg-wn-hover disabled:opacity-35 short:px-2.5 short:py-1 short:text-[11px] md:px-4 md:py-2 md:text-sm"
            >
              {isCover ? 'Begin the story' : isEnd ? 'End' : 'Next →'}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
