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

      {!isCover ? <StoryRibbon chapter={beat.chapter} /> : null}
      {!isCover ? <CastChip perspective={beat.perspective} /> : null}

      {showChrome ? (
        <>
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-40 h-[3px] bg-wn-line">
            <div
              className="h-full bg-gradient-to-r from-wn-primary via-wn-accent to-wn-teal transition-all duration-300"
              style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
            />
          </div>

          <div className="absolute right-5 top-4 z-40">
            <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-wn-muted shadow-card ring-1 ring-wn-line">
              {String(index + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
            </div>
          </div>

          {!isCover ? (
            <div className="pointer-events-none absolute bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-1.5 md:flex">
              {journey.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  title={b.line}
                  onClick={() => go(i)}
                  className={`pointer-events-auto h-2 rounded-full transition-all ${
                    i === index
                      ? 'w-8 bg-wn-primary'
                      : i < index
                        ? 'w-2.5 bg-wn-accent/70 hover:bg-wn-accent'
                        : 'w-2 bg-wn-line hover:bg-wn-faint'
                  }`}
                />
              ))}
            </div>
          ) : null}

          <div className="absolute bottom-5 right-5 z-40 flex items-center gap-2">
            <p className="mr-1 hidden text-[11px] text-wn-faint lg:block">You control the pace · ← →</p>
            <button
              type="button"
              onClick={() => {
                if (isCover) setIntroReplayKey((k) => k + 1);
                else go(index - 1);
              }}
              disabled={!isCover && index === 0}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-wn-primary shadow-card ring-1 ring-wn-line transition hover:bg-wn-soft disabled:opacity-35"
            >
              {isCover ? 'Replay' : 'Prev'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isEnd) go(index + 1);
              }}
              disabled={isEnd}
              className="rounded-full bg-wn-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-wn-hover disabled:opacity-35"
            >
              {isCover ? 'Begin the story' : isEnd ? 'End' : 'Next →'}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
