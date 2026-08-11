import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { GHOSTS, INTRO_ASSETS, T, WN, easeOut } from './constants';

type Props = {
  replayKey?: number;
  skipToken?: number;
  onComplete?: () => void;
};

/**
 * Creative opening: THE NEAR MISS
 * Two people reach across a dark gap. What’s missing floats — and fades.
 * WorkNest drops in as the keystone. Hands meet. Bridge complete.
 */
export function WorkNestIntro({ replayKey = 0, skipToken = 0, onComplete }: Props) {
  const [ms, setMs] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setMs(0);
    setDone(false);
    const start = performance.now();
    let raf = 0;
    let finished = false;
    const tick = (now: number) => {
      const elapsed = now - start;
      setMs(elapsed);
      if (elapsed >= T.hold && !finished) {
        finished = true;
        setDone(true);
        onComplete?.();
      }
      if (elapsed < T.end) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [replayKey, onComplete]);

  useEffect(() => {
    if (!skipToken) return;
    setMs(T.resolve);
    setDone(true);
    onComplete?.();
  }, [skipToken, onComplete]);

  const reaching = ms >= T.reach;
  const gapFocus = ms >= T.gapFocus;
  const showGhosts = ms >= T.ghosts && ms < T.keystone;
  const keystone = ms >= T.keystone;
  const connected = ms >= T.connect;
  const resolved = ms >= T.resolve;

  // Camera: push into the gap, then ease back
  const camScale = gapFocus && !keystone ? 1.18 : connected ? 1.02 : 1;
  const camY = gapFocus && !keystone ? 18 : 0;

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: WN.bg }}>
      {/* Stage lighting */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: resolved
            ? `radial-gradient(circle at 50% 45%, ${WN.green}20 0%, ${WN.bg} 60%)`
            : connected
              ? `radial-gradient(circle at 50% 48%, ${WN.purple}14 0%, ${WN.orange}10 40%, ${WN.bg} 70%)`
              : gapFocus
                ? `radial-gradient(circle at 50% 55%, #1A122418 0%, ${WN.bg} 55%)`
                : `radial-gradient(ellipse at 18% 50%, ${WN.purple}16 0%, transparent 38%),
                   radial-gradient(ellipse at 82% 50%, ${WN.orange}16 0%, transparent 38%),
                   linear-gradient(180deg, #FAF6FC 0%, ${WN.bg} 50%, #E8DCF2 100%)`,
        }}
        transition={{ duration: 0.9 }}
      />

      {/* Floor plane */}
      <div className="absolute bottom-[12%] left-[8%] right-[8%] h-px bg-[#E8E0F0]/70" />
      <div className="absolute bottom-[6%] left-1/2 h-32 w-[55%] -translate-x-1/2 rounded-[100%] bg-[#49225B]/[0.05] blur-3xl" />

      {/* Headline */}
      <motion.div
        className="absolute left-1/2 top-7 z-40 w-[min(740px,92vw)] -translate-x-1/2 text-center"
        animate={{ opacity: resolved ? 0 : gapFocus ? 0.55 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-display text-[clamp(1.15rem,2.7vw,1.9rem)] font-semibold leading-snug text-[#1A1224]">
          Talent exists. Opportunities exist.
        </p>
        <p className="mt-1.5 font-display text-[clamp(0.98rem,2.1vw,1.4rem)] font-medium text-[#5B5268]">
          What’s missing is a trusted way to work together.
        </p>
      </motion.div>

      <motion.div
        className="absolute inset-0 z-10 origin-center"
        animate={{ scale: camScale, y: camY }}
        transition={{ duration: 1.1, ease: easeOut }}
      >
        {/* Characters */}
        <Person
          side="client"
          visible={ms > 350}
          reaching={reaching}
          connected={connected}
          dim={gapFocus && !keystone}
        />
        <Person
          side="freelancer"
          visible={ms > 650}
          reaching={reaching}
          connected={connected}
          dim={gapFocus && !keystone}
        />

        {/* The gap — dark tear between them */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[30%] z-[5] h-[48%] w-[min(220px,28vw)] -translate-x-1/2"
          animate={{
            opacity: resolved ? 0 : gapFocus && !connected ? 1 : reaching ? 0.45 : 0.15,
            scaleX: gapFocus && !keystone ? 1.15 : connected ? 0.4 : 1,
          }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="h-full w-full"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(26,18,36,0.14) 0%, transparent 70%)',
            }}
          />
          {/* Crack line */}
          <motion.div
            className="absolute left-1/2 top-[10%] h-[80%] w-px -translate-x-1/2"
            style={{
              background: connected
                ? `linear-gradient(180deg, transparent, ${WN.green}, transparent)`
                : 'linear-gradient(180deg, transparent, #C4B5D4, transparent)',
            }}
            animate={{ opacity: connected ? 0 : 1, scaleY: keystone ? 0.3 : 1 }}
          />
        </motion.div>

        {/* Reaching hands / glow orbs */}
        <motion.div
          className="absolute left-1/2 top-[52%] z-20 flex -translate-x-1/2 -translate-y-1/2 items-center"
          animate={{ gap: connected ? 0 : gapFocus ? 28 : reaching ? 18 : 40 }}
          transition={{ duration: 0.9, ease: easeOut }}
        >
          <motion.div
            className="h-11 w-11 rounded-full md:h-14 md:w-14"
            style={{ background: `linear-gradient(135deg, ${WN.purple}, ${WN.purpleSoft})` }}
            animate={{
              x: connected ? 8 : 0,
              opacity: reaching ? 1 : 0,
              scale: connected ? 1.05 : 1,
            }}
            transition={{ duration: 0.7, ease: easeOut }}
          />
          <motion.div
            className="h-11 w-11 rounded-full md:h-14 md:w-14"
            style={{ background: `linear-gradient(135deg, ${WN.orange}, #FB923C)` }}
            animate={{
              x: connected ? -8 : 0,
              opacity: reaching ? 1 : 0,
              scale: connected ? 1.05 : 1,
            }}
            transition={{ duration: 0.7, ease: easeOut }}
          />
        </motion.div>

        {/* Ghost problems in the gap — appear, then shatter when keystone drops */}
        <AnimatePresence>
          {(showGhosts || (keystone && ms < T.connect)) &&
            GHOSTS.map((g, i) => {
              const shatter = keystone;
              return (
                <motion.div
                  key={g.id}
                  className="absolute left-1/2 top-[52%] z-30 -translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0.6, x: g.x * 0.3, y: g.y * 0.3 }}
                  animate={
                    shatter
                      ? {
                          opacity: 0,
                          scale: 0.4,
                          x: g.x * 1.6,
                          y: g.y * 1.6,
                          filter: 'blur(6px)',
                        }
                      : {
                          opacity: 1,
                          scale: 1,
                          x: g.x,
                          y: g.y,
                          filter: 'blur(0px)',
                        }
                  }
                  exit={{ opacity: 0 }}
                  transition={{
                    delay: shatter ? i * 0.05 : 0.15 * i,
                    duration: shatter ? 0.55 : 0.6,
                    ease: easeOut,
                  }}
                >
                  <div
                    className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold tracking-wide shadow-lg md:text-[11px]"
                    style={{ color: g.color, outline: `1px solid ${g.color}44` }}
                  >
                    {g.label}
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* WorkNest keystone */}
        <AnimatePresence>
          {keystone && !resolved ? (
            <motion.div
              className="absolute left-1/2 top-[52%] z-40 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              initial={{ opacity: 0, y: -80, scale: 0.5, rotate: -18 }}
              animate={{ opacity: connected ? 0.9 : 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 16 }}
            >
              <div
                className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-white shadow-[0_22px_55px_rgba(73,34,91,0.28)] md:h-20 md:w-20 md:rounded-[26px]"
                style={{ outline: `2px solid ${WN.green}` }}
              >
                <img src={INTRO_ASSETS.logo} alt="" className="h-10 w-10 object-contain md:h-12 md:w-12" />
              </div>
              {/* Bridge beam sprouts from keystone */}
              <motion.div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: connected ? 280 : 120 }}
                transition={{ delay: 0.25, duration: 0.85, ease: easeOut }}
                style={{
                  background: `linear-gradient(90deg, ${WN.purple}, ${WN.green}, ${WN.orange})`,
                  boxShadow: '0 0 22px rgba(22,163,74,0.4)',
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* Final line */}
      <AnimatePresence>
        {resolved ? (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55 }}
          >
            <motion.div
              className="mb-5 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white shadow-[0_24px_60px_rgba(73,34,91,0.25)]"
              style={{ outline: `2px solid ${WN.purpleSoft}` }}
              initial={{ scale: 0.75, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              <img src={INTRO_ASSETS.logo} alt="" className="h-14 w-14 object-contain" />
            </motion.div>
            <motion.p
              className="font-display text-2xl font-semibold text-[#49225B] md:text-3xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              WorkNest builds the bridge.
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-[60] h-0.5 w-28 -translate-x-1/2 overflow-hidden rounded-full bg-[#E8E0F0]/80">
        <div
          className="h-full bg-gradient-to-r from-[#A56ABD] to-[#F97316]"
          style={{ width: `${Math.min(100, (ms / T.hold) * 100)}%` }}
        />
      </div>
      {done ? <span className="sr-only">complete</span> : null}
    </div>
  );
}

function Person({
  side,
  visible,
  reaching,
  connected,
  dim,
}: {
  side: 'client' | 'freelancer';
  visible: boolean;
  reaching: boolean;
  connected: boolean;
  dim: boolean;
}) {
  const isClient = side === 'client';
  const accent = isClient ? WN.purple : WN.orange;
  const avatar = isClient ? INTRO_ASSETS.clientAvatar : INTRO_ASSETS.freelancerAvatar;

  // Slide toward center when reaching/connected
  const xRest = isClient ? '12%' : undefined;
  const rightRest = !isClient ? '12%' : undefined;
  const xShift = connected ? (isClient ? 56 : -56) : reaching ? (isClient ? 28 : -28) : 0;

  return (
    <motion.div
      className="absolute bottom-[18%] z-20 flex flex-col items-center"
      style={{ left: xRest, right: rightRest }}
      initial={{ opacity: 0, x: isClient ? -50 : 50 }}
      animate={{
        opacity: visible ? (dim ? 0.45 : 1) : 0,
        x: xShift,
        filter: dim ? 'blur(1px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.85, ease: easeOut }}
    >
      {/* Soft spotlight under character */}
      <div
        className="absolute -bottom-3 h-4 w-24 rounded-full blur-md"
        style={{ background: `${accent}33` }}
      />

      <div
        className="overflow-hidden rounded-full bg-white shadow-[0_18px_44px_rgba(50,20,64,0.2)]"
        style={{ width: 108, height: 108, outline: `3px solid ${accent}` }}
      >
        <img src={avatar} alt="" className="h-full w-full object-cover" />
      </div>
      <div
        className="relative -mt-2 h-12 w-[72%] rounded-t-[32px]"
        style={{
          background: isClient
            ? `linear-gradient(165deg, ${WN.purple}, #6B3A7A)`
            : `linear-gradient(165deg, ${WN.orange}, #EA580C)`,
        }}
      />

      {/* Simple prop chips — what they bring */}
      <div className={`mt-3 flex gap-1.5 ${isClient ? '' : 'flex-row-reverse'}`}>
        {isClient ? (
          <>
            <Chip color={WN.purple}>Brief</Chip>
            <Chip color={WN.green}>$</Chip>
          </>
        ) : (
          <>
            <Chip color={WN.orange}>Skills</Chip>
            <Chip color={WN.purpleSoft}>Work</Chip>
          </>
        )}
      </div>
    </motion.div>
  );
}

function Chip({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold tracking-wide shadow-md"
      style={{ color, outline: `1px solid ${color}33` }}
    >
      {children}
    </span>
  );
}
