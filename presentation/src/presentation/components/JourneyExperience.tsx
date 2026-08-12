import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { PROJECT_AMOUNT, closingDecisions, journey, type Beat } from '../data/journey';
import { UserPerspective } from './UserPerspective';
import {
  ClientMatchRadarUI,
  FreelancerMatchRadarUI,
} from './MatchRadarProductUI';
import '../styles/matchRadarProduct.css';

const ease = [0.22, 1, 0.36, 1] as const;

/** Soft lilac WorkNest stage — light page with purple / orange / teal atmosphere. */
function SlideAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 12% 16%, rgba(165,106,189,0.32) 0%, transparent 48%),
            radial-gradient(ellipse at 90% 12%, rgba(249,115,22,0.14) 0%, transparent 40%),
            radial-gradient(ellipse at 78% 90%, rgba(20,184,166,0.14) 0%, transparent 46%),
            radial-gradient(circle at 50% 42%, #ffffff 0%, #f3ecf8 55%, #e8dcf2 100%)
          `,
        }}
      />
      <div className="absolute -left-24 top-12 h-96 w-96 rounded-full bg-wn-accent/25 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-wn-primary/10 blur-3xl" />
      <div className="absolute left-1/3 top-[62%] h-72 w-72 -translate-x-1/2 rounded-full bg-wn-teal/12 blur-3xl" />
      <div className="absolute right-[18%] top-[28%] h-52 w-52 rounded-full bg-wn-orange/12 blur-3xl" />
    </div>
  );
}

type IntroControls = {
  introReplayKey?: number;
  introSkipToken?: number;
};

export function JourneyExperience({
  index,
  introReplayKey = 0,
}: {
  index: number;
} & IntroControls) {
  const beat = journey[Math.min(Math.max(index, 0), journey.length - 1)];
  const isOpener = beat.id === 'cover';

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundColor: 'var(--wn-page)', backgroundImage: 'var(--wn-page-wash)' }}
    >
      <SlideAtmosphere />
      <AnimatePresence mode="wait">
        <motion.div
          key={`${beat.id}-${isOpener ? introReplayKey : 0}`}
          className="absolute inset-0"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease }}
        >
          {beat.layout === 'hook' ? <HookBeat beat={beat} opener={isOpener} /> : null}
          {beat.layout === 'problems' ? <ProblemsBeat beat={beat} /> : null}
          {beat.layout === 'screen' ? <ScreenBeat beat={beat} /> : null}
          {beat.layout === 'dual' ? <DualBeat beat={beat} /> : null}
          {beat.layout === 'radar' ? <RadarBeat beat={beat} /> : null}
          {beat.layout === 'match' ? <MatchBeat beat={beat} /> : null}
          {beat.layout === 'money' ? <MoneyBeat beat={beat} /> : null}
          {beat.layout === 'spotlight' ? <SpotlightBeat beat={beat} /> : null}
          {beat.layout === 'arc' ? <ArcBeat beat={beat} /> : null}
          {beat.layout === 'closing' ? <ClosingBeat beat={beat} /> : null}
          {beat.layout === 'qr' ? <QrBeat beat={beat} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function HookBeat({ beat, opener = false }: { beat: Beat; opener?: boolean }) {
  if (opener) return <CoverBeat beat={beat} />;

  const shots = beat.gallery ?? [];
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-transparent">
      <div className="absolute inset-0 flex items-center justify-center gap-4 px-8 opacity-40">
        {shots.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            className="h-[70vh] w-[28vw] rounded-2xl object-cover object-top shadow-2xl ring-1 ring-wn-line"
            initial={{ opacity: 0, y: 40, rotate: (i - 1) * 6 }}
            animate={{ opacity: 1, y: 0, rotate: (i - 1) * 4 }}
            transition={{ delay: 0.15 * i, duration: 0.7, ease }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[#F3ECF8]/70 backdrop-blur-[2px]" />
      <motion.div
        className="relative z-10 max-w-3xl px-6 text-center"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease }}
      >
        <UserPerspective perspective={beat.perspective} />
        <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-wn-primary short:mt-3 short:text-2xl md:text-6xl md:short:text-4xl">
          {beat.line}
        </h1>
        <p className="mt-5 text-lg text-wn-orange short:mt-2 short:text-base md:mt-5 md:text-2xl">{beat.note}</p>
      </motion.div>
    </div>
  );
}

/** Opening poster — brand as bridge between Sarah and Jack. */
function CoverBeat({ beat }: { beat: Beat }) {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#120a1a]">
      {/* Living atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 18% 42%, rgba(165,106,189,0.38) 0%, transparent 58%),
            radial-gradient(ellipse 65% 50% at 82% 48%, rgba(249,115,22,0.28) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 78%, rgba(20,184,166,0.18) 0%, transparent 60%),
            linear-gradient(168deg, #1c0f28 0%, #120a1a 48%, #0d0814 100%)
          `,
        }}
      />

      {/* Soft product silhouettes — atmosphere only, not the hero */}
      {(beat.gallery ?? []).slice(0, 2).map((src, i) => (
        <motion.img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className="pointer-events-none absolute w-[38vw] max-w-md rounded-xl opacity-[0.12] shadow-2xl"
          style={{
            top: i === 0 ? '12%' : 'auto',
            bottom: i === 1 ? '10%' : 'auto',
            left: i === 0 ? '-4%' : 'auto',
            right: i === 1 ? '-6%' : 'auto',
            rotate: i === 0 ? '-8deg' : '7deg',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 0.12, y: 0 }}
          transition={{ delay: 0.35 + i * 0.15, duration: 1, ease }}
        />
      ))}

      {/* Drift particles */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-white/50"
          style={{
            left: `${10 + i * 11}%`,
            top: `${22 + (i % 4) * 14}%`,
          }}
          animate={{ y: [0, -22, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 3.2 + i * 0.35, repeat: Infinity, delay: i * 0.25 }}
        />
      ))}

      {/* Bridge arc */}
      <svg
        className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          d="M 12 48 C 28 28, 38 28, 50 42 C 62 28, 72 28, 88 48"
          fill="none"
          stroke="url(#wn-bridge)"
          strokeWidth="0.35"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 1.6, delay: 0.55, ease }}
        />
        <defs>
          <linearGradient id="wn-bridge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A56ABD" />
            <stop offset="50%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>

      {/* Light sweep across the bridge */}
      <motion.div
        className="pointer-events-none absolute left-[12%] top-[40%] z-[6] h-px w-[76%] overflow-visible"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <motion.span
          className="absolute top-1/2 h-8 w-24 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-white/35 to-transparent blur-md"
          animate={{ left: ['0%', '100%'] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
        />
      </motion.div>

      {/* Sarah — client */}
      <CoverPortrait
        side="left"
        src="/avatars/client.jpg"
        name="Sarah"
        role="Client"
        accent="#A56ABD"
        delay={0.2}
      />

      {/* Jack — freelancer */}
      <CoverPortrait
        side="right"
        src="/avatars/freelancer.jpg"
        name="Jack"
        role="Freelancer"
        accent="#F97316"
        delay={0.35}
      />

      {/* Brand center — hero: line → sentence → logo → path */}
      <div className="relative z-20 flex h-full w-full flex-col items-center justify-center px-5 pb-14 text-center short:pb-12 short:justify-center md:pb-16">
        <div className="relative">
          {/* Keystone glow */}
          <motion.div
            className="absolute left-1/2 top-[55%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#14B8A6]/25 blur-3xl short:h-28 short:w-28 md:h-56 md:w-56"
            animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.92, 1.08, 0.92] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.p
            className="relative mx-auto font-display text-[clamp(1.15rem,2.8vw,2rem)] font-semibold leading-snug text-white short:text-[clamp(1.05rem,2.4vw,1.45rem)]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55, ease }}
          >
            {beat.line}
          </motion.p>

          {beat.note ? (
            <motion.p
              className="relative mx-auto mt-2.5 max-w-lg text-[clamp(0.9rem,1.8vw,1.2rem)] leading-relaxed text-white/65 short:mt-1.5 short:text-[clamp(0.8rem,1.5vw,0.95rem)]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.55, ease }}
            >
              {beat.note}
            </motion.p>
          ) : null}

          {/* Full wordmark on the dark stage — no white plate */}
          <motion.img
            src="/logo.png"
            alt="WorkNest"
            className="relative mx-auto mt-7 h-12 w-auto max-w-[min(82vw,380px)] object-contain object-center mix-blend-screen short:mt-4 short:h-9 md:mt-8 md:h-[4.25rem]"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.25, duration: 0.65, ease }}
          />
        </div>

        {/* Path — steps light up under the brand */}
        <div className="mt-8 short:mt-4 md:mt-10">
          <CoverPathSteps />
        </div>
      </div>
    </div>
  );
}

const COVER_PATH = [
  { label: 'Find', accent: '#A56ABD' },
  { label: 'Meet', accent: '#7C6BC4' },
  { label: 'Work', accent: '#14B8A6' },
  { label: 'Pay', accent: '#F97316' },
] as const;

function CoverPathSteps() {
  return (
    <motion.div
      className="relative flex flex-wrap items-center justify-center gap-1.5 md:gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.85, duration: 0.35 }}
      aria-label="Find, Meet, Work, Pay"
    >
      {/* Soft rail under the path */}
      <motion.div
        className="pointer-events-none absolute left-[8%] right-[8%] top-1/2 hidden h-px -translate-y-1/2 md:block"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(165,106,189,0.35), rgba(20,184,166,0.35), rgba(249,115,22,0.35), transparent)',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 2.0, duration: 1.4, ease }}
      />

      {COVER_PATH.map((step, i) => (
        <span key={step.label} className="relative z-10 flex items-center gap-1.5 md:gap-2">
          <motion.span
            className="relative overflow-hidden rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-white ring-1 short:px-2.5 short:py-1 short:text-[10px] md:px-4 md:py-2 md:text-xs"
            style={{
              backgroundColor: `${step.accent}33`,
              boxShadow: `0 0 0 1px ${step.accent}55, 0 10px 28px ${step.accent}33`,
            }}
            initial={{ opacity: 0, y: 18, scale: 0.7, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{
              delay: 2.1 + i * 0.42,
              duration: 0.55,
              ease,
            }}
          >
            {/* Shine sweep when the step lands */}
            <motion.span
              className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
              initial={{ left: '-60%', opacity: 0 }}
              animate={{ left: '120%', opacity: [0, 1, 0] }}
              transition={{ delay: 2.2 + i * 0.42, duration: 0.7, ease: 'easeOut' }}
            />
            <span className="relative">{step.label}</span>
          </motion.span>

          {i < COVER_PATH.length - 1 ? (
            <motion.span
              className="flex items-center text-sm font-bold md:text-base"
              style={{ color: COVER_PATH[i + 1].accent }}
              initial={{ opacity: 0, x: -8, scale: 0.5 }}
              animate={{ opacity: 0.85, x: 0, scale: 1 }}
              transition={{
                delay: 2.35 + i * 0.42,
                duration: 0.4,
                ease,
              }}
            >
              <motion.span
                animate={{ x: [0, 4, 0], opacity: [0.55, 1, 0.55] }}
                transition={{
                  delay: 2.75 + i * 0.42,
                  duration: 1.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                →
              </motion.span>
            </motion.span>
          ) : null}
        </span>
      ))}
    </motion.div>
  );
}

function CoverPortrait({
  side,
  src,
  name,
  role,
  accent,
  delay,
}: {
  side: 'left' | 'right';
  src: string;
  name: string;
  role: string;
  accent: string;
  delay: number;
}) {
  const isLeft = side === 'left';

  return (
    <motion.div
      className={`absolute top-[14%] z-10 flex -translate-y-0 flex-col items-center short:top-[10%] short:scale-[0.72] md:top-1/2 md:-translate-y-1/2 md:short:scale-[0.78] ${
        isLeft ? 'left-[4%] md:left-[7%]' : 'right-[4%] md:right-[7%]'
      } max-md:scale-[0.78]`}
      initial={{ opacity: 0, x: isLeft ? -36 : 36, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay, duration: 0.85, ease }}
    >
      <div className="relative">
        <motion.div
          className="absolute -inset-4 rounded-full blur-2xl short:-inset-3 md:-inset-6"
          style={{ backgroundColor: `${accent}44` }}
          animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.95, 1.08, 0.95] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay }}
        />
        <div
          className="relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-full bg-white/10 short:h-14 short:w-14 md:h-[7.25rem] md:w-[7.25rem] md:short:h-[5.25rem] md:short:w-[5.25rem]"
          style={{
            boxShadow: `0 0 0 3px ${accent}, 0 22px 50px ${accent}55`,
          }}
        >
          <img src={src} alt={name} className="h-full w-full object-cover object-center" />
        </div>
      </div>
      <p className="mt-2 font-display text-xs font-bold text-white short:mt-1.5 short:text-[11px] md:mt-3 md:text-base md:short:text-sm">{name}</p>
      <p
        className="mt-0.5 text-[9px] font-bold tracking-[0.2em] short:text-[8px] md:text-[11px]"
        style={{ color: accent }}
      >
        {role.toUpperCase()}
      </p>
    </motion.div>
  );
}

function ProblemsBeat({ beat }: { beat: Beat }) {
  const lists = beat.checklists;
  if (!lists) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-transparent px-6">
        <p className="text-wn-muted">{beat.line}</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-transparent">
      {/* Soft split atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 45% 60% at 12% 40%, rgba(165,106,189,0.22) 0%, transparent 70%),
            radial-gradient(ellipse 45% 60% at 88% 40%, rgba(249,115,22,0.16) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 50% 100%, rgba(20,184,166,0.08) 0%, transparent 70%)
          `,
        }}
      />

      <div className="relative z-10 shrink-0 px-4 pb-1.5 pt-4 text-center short:pb-1 short:pt-3 md:px-8 md:pt-7 md:short:pt-4">
        <motion.p
          className="text-[11px] font-bold tracking-[0.24em] text-wn-accent short:text-[9px]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {beat.step}
        </motion.p>
        <motion.h1
          className="mt-2 font-display text-2xl font-bold tracking-tight text-wn-primary short:mt-1 short:text-xl md:text-4xl lg:text-[2.75rem] md:short:text-2xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease }}
        >
          {beat.line}
        </motion.h1>
      </div>

      <div className="relative z-10 mx-auto grid min-h-0 w-full max-w-5xl flex-1 grid-cols-1 content-center gap-3 overflow-y-auto px-4 pb-14 short:gap-2 short:pb-12 md:grid-cols-[1fr_auto_1fr] md:gap-5 md:px-8 md:pb-6 md:short:pb-14">
        <ProblemChecklist
          side="client"
          name={lists.client.name}
          role={lists.client.role}
          avatar={lists.client.avatar}
          accent="#A56ABD"
          items={lists.client.items}
          baseDelay={0.25}
        />

        {/* Center rift */}
        <div className="relative hidden items-center justify-center md:flex">
          <motion.div
            className="absolute inset-y-[12%] w-px bg-gradient-to-b from-transparent via-wn-line to-transparent"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease }}
          />
          <motion.div
            className="relative z-10 flex max-w-[7.5rem] flex-col items-center rounded-2xl bg-wn-surface/95 px-3 py-4 text-center shadow-card ring-1 ring-wn-line"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.35, type: 'spring', stiffness: 260, damping: 16 }}
          >
            <motion.span
              className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1224] text-sm font-black text-white"
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ delay: 2.6, duration: 0.7 }}
            >
              ?
            </motion.span>
            <p className="font-display text-[11px] font-bold leading-snug text-wn-primary">
              Trust is missing
            </p>
            <p className="mt-1 text-[10px] leading-snug text-wn-muted">No shared path yet</p>
          </motion.div>
        </div>

        <ProblemChecklist
          side="freelancer"
          name={lists.freelancer.name}
          role={lists.freelancer.role}
          avatar={lists.freelancer.avatar}
          accent="#F97316"
          items={lists.freelancer.items}
          baseDelay={0.45}
        />
      </div>

      {beat.note ? (
        <motion.p
          className="relative z-10 shrink-0 px-6 pb-14 text-center text-sm font-medium text-wn-orange short:pb-12 short:text-xs md:pb-5 md:text-base md:short:pb-14"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.7, duration: 0.5 }}
        >
          {beat.note}
        </motion.p>
      ) : null}
    </div>
  );
}

function ProblemChecklist({
  side,
  name,
  role,
  avatar,
  accent,
  items,
  baseDelay,
}: {
  side: 'client' | 'freelancer';
  name: string;
  role: string;
  avatar: string;
  accent: string;
  items: string[];
  baseDelay: number;
}) {
  return (
    <motion.section
      className="relative flex min-h-0 flex-col overflow-hidden rounded-[1.35rem] bg-wn-surface/95 p-3 shadow-lift ring-1 ring-wn-line short:p-2.5 md:p-5"
      style={{ boxShadow: `0 18px 40px ${accent}18` }}
      initial={{ opacity: 0, x: side === 'client' ? -28 : 28, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: baseDelay, duration: 0.55, ease }}
      aria-label={`${name} problem checklist`}
    >
      {/* Clipboard header */}
      <div className="mb-3 flex items-center gap-3 border-b border-wn-line pb-3">
        <div
          className="h-11 w-11 overflow-hidden rounded-full ring-2 md:h-12 md:w-12"
          style={{ boxShadow: `0 0 0 2px ${accent}` }}
        >
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 text-left">
          <p className="text-[10px] font-bold tracking-[0.2em]" style={{ color: accent }}>
            {role.toUpperCase()} CHECKLIST
          </p>
          <p className="font-display text-lg font-bold text-wn-ink md:text-xl">{name}</p>
        </div>
        <motion.span
          className="ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white"
          style={{ backgroundColor: accent }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: baseDelay + 0.35 }}
        >
          OPEN
        </motion.span>
      </div>

      <ul className="flex flex-1 flex-col gap-2.5">
        {items.map((item, i) => (
          <motion.li
            key={item}
            className="group flex items-start gap-3 rounded-xl bg-wn-soft/60 px-3 py-2.5 ring-1 ring-wn-line/80"
            initial={{ opacity: 0, x: side === 'client' ? -16 : 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ delay: baseDelay + 0.4 + i * 0.28, duration: 0.45, ease }}
          >
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              {/* Empty box first */}
              <motion.span
                className="absolute inset-0 rounded-[5px] border-2 bg-white"
                style={{ borderColor: `${accent}66` }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: baseDelay + 0.4 + i * 0.28, duration: 0.3 }}
              />
              {/* Problem mark stamps in */}
              <motion.span
                className="relative z-10 flex h-5 w-5 items-center justify-center rounded-[5px] text-[11px] font-black text-white"
                style={{ backgroundColor: accent }}
                initial={{ scale: 0, rotate: -40, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  delay: baseDelay + 0.62 + i * 0.28,
                  type: 'spring',
                  stiffness: 420,
                  damping: 14,
                }}
              >
                !
              </motion.span>
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[13px] font-semibold leading-snug text-wn-ink md:text-[14px]">{item}</p>
              <motion.p
                className="mt-0.5 text-[10px] font-bold tracking-[0.14em] text-wn-faint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: baseDelay + 0.75 + i * 0.28 }}
              >
                UNRESOLVED
              </motion.p>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}

/** Full, clear product screenshot — the star of the slide. */
function ScreenBeat({ beat }: { beat: Beat }) {
  return (
    <div className="relative flex h-full w-full flex-col bg-transparent">
      <CaptionBar beat={beat} />
      <div className="relative min-h-0 flex-1 px-3 pb-14 pt-1 short:pb-12 md:px-5 md:pb-5 md:short:pb-14">
        <FullFrame src={beat.src!} alt={beat.line} url={beat.url} />
      </div>
    </div>
  );
}

type CinemaPhase = 'establish' | 'zoom' | 'highlight' | 'result' | 'zoomOut';

const CINEMA: { phase: CinemaPhase; ms: number }[] = [
  { phase: 'establish', ms: 850 },
  { phase: 'zoom', ms: 1100 },
  { phase: 'highlight', ms: 950 },
  { phase: 'result', ms: 1400 },
  { phase: 'zoomOut', ms: 900 },
];
const CINEMA_TOTAL_MS = CINEMA.reduce((s, p) => s + p.ms, 0);

function SpotlightBeat({ beat }: { beat: Beat }) {
  const spots = beat.spotlights ?? [];
  const wideSrc = beat.src ?? spots[0]?.src ?? '';
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(true);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [phase, setPhase] = useState<CinemaPhase>('establish');
  const spot = spots[Math.min(active, Math.max(spots.length - 1, 0))];
  const accent = spot ? spotlightAccent(spot.id) : '#F97316';

  const goSpot = (next: number, _direction?: number) => {
    if (!spots.length) return;
    const clamped = ((next % spots.length) + spots.length) % spots.length;
    setActive(clamped);
    setPhase('establish');
    setTick((t) => t + 1);
  };

  // Run cinematic phases for the active spot
  useEffect(() => {
    if (!spot || paused || open) return;
    setPhase('establish');
    let elapsed = 0;
    const timers = CINEMA.map((step) => {
      const id = window.setTimeout(() => setPhase(step.phase), elapsed);
      elapsed += step.ms;
      return id;
    });
    const advance = window.setTimeout(() => {
      if (spots.length > 1) goSpot(active + 1, 1);
    }, CINEMA_TOTAL_MS);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(advance);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused, open, tick, spot?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!spot || !wideSrc) {
    return (
      <div className="relative flex h-full w-full flex-col bg-transparent">
        <CaptionBar beat={beat} />
        <div className="relative min-h-0 flex-1 px-3 pb-14 pt-1 short:pb-12 md:px-5 md:pb-5 md:short:pb-14">
          {beat.src ? <FullFrame src={beat.src} alt={beat.line} url={beat.url} /> : null}
        </div>
      </div>
    );
  }

  const focus = spot.focus;
  const cx = focus.x + focus.w / 2;
  const cy = focus.y + focus.h / 2;
  /** Zoom so the focus rect nearly fills the stage, with a little padding. */
  const autoZoom = Math.min(100 / Math.max(focus.w, 6), 100 / Math.max(focus.h, 6)) * 0.72;
  const zoomScale = spot.scale ?? Math.min(Math.max(autoZoom, 1.08), 1.85);
  /**
   * Manual step chips keep the tour paused — still show the zoomed, highlighted region.
   * Autoplay uses establish → zoom → highlight → result → zoomOut.
   */
  const isWide = !paused && (phase === 'establish' || phase === 'zoomOut');
  const showHighlight = paused || phase === 'highlight' || phase === 'result';
  const showResult = paused || phase === 'result';
  const frameSrc = spot.src || wideSrc;
  const showDetail = false;

  /** Pan so the focus center lands in the middle of the stage (not pinned to its old spot). */
  const camX = isWide ? 0 : 50 - cx;
  const camY = isWide ? 0 : 50 - cy;
  const camScale = isWide ? 1 : zoomScale;

  const phaseLabel = paused
    ? 'FOCUS · REGION'
    : phase === 'establish'
      ? '01 · FULL INTERFACE'
      : phase === 'zoom'
        ? '02 · ZOOM IN'
        : phase === 'highlight'
          ? '03 · HIGHLIGHT ACTION'
          : phase === 'result'
            ? '04 · ANIMATE RESULT'
            : '05 · ZOOM OUT';

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-transparent">
      <motion.div
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full blur-3xl"
        animate={{ backgroundColor: `${accent}33` }}
        transition={{ duration: 0.6 }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full blur-3xl"
        animate={{ backgroundColor: `${accent}22` }}
        transition={{ duration: 0.6 }}
      />

      <CaptionBar beat={beat} />

      <div className="relative z-10 px-4 short:px-3 md:px-6">
        <div className="relative mb-2 hidden h-0.5 overflow-hidden rounded-full bg-wn-soft short:mb-1 sm:block">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: `linear-gradient(90deg, ${accent}, #F97316)` }}
            animate={{ width: `${((active + 1) / spots.length) * 100}%` }}
            transition={{ duration: 0.45, ease }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 short:gap-1 md:gap-2">
          {spots.map((s, i) => {
            const on = i === active;
            const done = i < active;
            const c = spotlightAccent(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  goSpot(i);
                  setPaused(true);
                }}
                className={`group relative overflow-hidden rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] transition short:px-2 short:py-0.5 short:text-[8px] md:px-3 md:py-1.5 md:text-[10px] ${
                  on
                    ? 'text-white shadow-soft'
                    : done
                      ? 'bg-wn-soft text-wn-muted hover:bg-wn-canvas'
                      : 'bg-wn-soft text-wn-faint hover:bg-wn-canvas hover:text-wn-muted'
                }`}
                style={on ? { background: c } : undefined}
              >
                {on && !paused ? (
                  <motion.span
                    key={`${s.id}-${tick}`}
                    className="absolute inset-y-0 left-0 bg-wn-accent/25"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: CINEMA_TOTAL_MS / 1000, ease: 'linear' }}
                  />
                ) : null}
                <span className="relative z-10">
                  {String(i + 1).padStart(2, '0')} · {s.label.toUpperCase()}
                </span>
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-wn-soft px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] text-wn-faint ring-1 ring-wn-line lg:inline">
              {phaseLabel}
            </span>
            <button
              type="button"
              onClick={() => goSpot(active - 1, -1)}
              className="rounded-full bg-wn-soft px-2.5 py-1.5 text-[10px] font-semibold text-wn-faint ring-1 ring-wn-line hover:text-wn-ink"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goSpot(active + 1, 1)}
              className="rounded-full bg-wn-soft px-2.5 py-1.5 text-[10px] font-semibold text-wn-faint ring-1 ring-wn-line hover:text-wn-ink"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="rounded-full bg-wn-soft px-3 py-1.5 text-[10px] font-semibold tracking-wide text-wn-faint ring-1 ring-wn-line hover:text-wn-muted"
            >
              {paused ? 'Play tour' : 'Pause tour'}
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-0 flex-1 px-3 pb-14 pt-2 short:pb-12 short:pt-1 md:px-5 md:pb-5 md:short:pb-14">
        <motion.div
          className="relative mx-auto flex h-full w-full max-w-[1280px] flex-col overflow-hidden rounded-2xl bg-wn-surface ring-1 ring-wn-line short:rounded-xl"
          style={{
            boxShadow: `0 0 0 1px ${accent}40, 0 20px 48px rgba(73,34,91,0.12), 0 0 40px ${accent}18`,
          }}
        >
          <BrowserChrome url={`${beat.url} · ${spot.id}`} onExpand={() => setOpen(true)} />
          <button
            type="button"
            className="relative min-h-0 flex-1 cursor-zoom-in overflow-hidden bg-wn-soft"
            onClick={() => setOpen(true)}
          >
            {/*
              Locked 16:10 stage matching screenshots — focus % maps 1:1 to image pixels.
              object-cover was cropping and making zoom/highlight miss the real UI.
            */}
            <div
              className="absolute inset-0 flex items-center justify-center p-2 md:p-3"
              style={{ containerType: 'size' }}
            >
              <div
                className="relative overflow-hidden rounded-xl bg-wn-page shadow-card ring-1 ring-wn-line"
                style={{
                  aspectRatio: '16 / 10',
                  width: 'min(100%, calc(100cqh * 1.6))',
                  maxHeight: '100%',
                  maxWidth: '100%',
                }}
              >
                <motion.div
                  key={`${spot.id}-cam-${tick}`}
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    scale: camScale,
                    x: `${camX}%`,
                    y: `${camY}%`,
                    filter: 'blur(0px) brightness(1)',
                  }}
                  transition={{ duration: phase === 'zoom' || phase === 'zoomOut' ? 0.85 : 0.5, ease }}
                  style={{ transformOrigin: `${cx}% ${cy}%` }}
                >
                  <img
                    src={frameSrc}
                    alt={spot.label}
                    className="absolute inset-0 h-full w-full object-contain object-top"
                    draggable={false}
                  />

                  {/* Highlight stays inside the camera so it tracks the zoom origin */}
                  <AnimatePresence>
                    {showHighlight ? (
                      <motion.div
                        key="hl"
                        className="pointer-events-none absolute rounded-xl"
                        style={{
                          left: `${focus.x}%`,
                          top: `${focus.y}%`,
                          width: `${focus.w}%`,
                          height: `${focus.h}%`,
                          boxShadow: `0 0 0 9999px rgba(26,18,36,0.38), 0 0 28px ${accent}99`,
                          outline: `3px solid ${accent}`,
                        }}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, ease }}
                      />
                    ) : null}
                  </AnimatePresence>
                </motion.div>

                {/* Clean focus crop on result — no baked vignette */}
                <AnimatePresence>
                  {showDetail ? (
                    <motion.div
                      key="detail"
                      className="pointer-events-none absolute inset-[6%] overflow-hidden rounded-xl bg-wn-surface shadow-lift"
                      style={{ outline: `2px solid ${accent}` }}
                      initial={{ opacity: 0, y: 18, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.97 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <img src={spot.src} alt="" className="h-full w-full object-contain object-top" />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            {/* Action → Result cards */}
            <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex max-w-lg flex-col gap-2">
              <AnimatePresence mode="wait">
                {paused || phase === 'highlight' || phase === 'zoom' ? (
                  <motion.div
                    key={`action-${spot.id}`}
                    className="rounded-2xl bg-wn-surface/95 px-4 py-3 ring-1 ring-wn-line backdrop-blur-md"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <p className="text-[10px] font-bold tracking-[0.16em]" style={{ color: accent }}>
                      ACTION
                    </p>
                    <p className="mt-1 font-display text-sm font-semibold text-wn-ink md:text-base">
                      {spot.action ?? spot.label}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <AnimatePresence>
                {showResult ? (
                  <motion.div
                    key={`result-${spot.id}`}
                    className="rounded-2xl px-4 py-3 text-white shadow-lg"
                    style={{ background: accent, boxShadow: `0 0 28px ${accent}88` }}
                    initial={{ opacity: 0, y: 16, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  >
                    <p className="text-[10px] font-bold tracking-[0.16em] opacity-80">RESULT</p>
                    <p className="mt-1 font-display text-sm font-bold md:text-base">
                      {spot.result ?? spot.note}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              {isWide ? (
                <motion.div
                  key="wide-cap"
                  className="rounded-2xl bg-wn-surface/95 px-4 py-3 ring-1 ring-wn-line backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-[10px] font-bold tracking-[0.16em] text-wn-faint">
                    {phase === 'establish' ? 'FULL INTERFACE' : 'PULLING BACK'}
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold text-wn-ink">{spot.note}</p>
                </motion.div>
              ) : null}
            </div>

            {/* Phase chips */}
            <div className="pointer-events-none absolute right-4 top-4 z-20 flex flex-col items-end gap-1.5">
              {(['establish', 'zoom', 'highlight', 'result', 'zoomOut'] as CinemaPhase[]).map((p, i) => {
                const on = phase === p;
                const passed = CINEMA.findIndex((c) => c.phase === phase) > i;
                return (
                  <span
                    key={p}
                    className={`rounded-full px-2 py-0.5 text-[8px] font-bold tracking-[0.12em] ${
                      on ? 'text-wn-ink' : passed ? 'bg-wn-canvas text-wn-muted' : 'bg-wn-soft text-wn-faint'
                    }`}
                    style={on ? { background: accent } : undefined}
                  >
                    {String(i + 1).padStart(2, '0')} {p === 'zoomOut' ? 'OUT' : p.toUpperCase()}
                  </span>
                );
              })}
            </div>

            {spot.id === 'complete' && showResult ? (
              <motion.div
                className="pointer-events-none absolute left-1/2 top-[30%] z-20 -translate-x-1/2 rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.18em] text-white"
                style={{ background: accent, boxShadow: `0 0 32px ${accent}` }}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14 }}
              >
                ✓ HANDOFF READY
              </motion.div>
            ) : null}

            <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex items-center gap-1.5">
              {spots.map((s, i) => (
                <span
                  key={s.id}
                  className={`rounded-full transition-all ${
                    i === active ? 'h-1.5 w-8' : i < active ? 'h-1.5 w-3 bg-wn-accent/40' : 'h-1.5 w-1.5 bg-wn-accent/25'
                  }`}
                  style={i === active ? { background: accent } : undefined}
                />
              ))}
            </div>
          </button>
        </motion.div>
      </div>

      {open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[200] flex items-center justify-center bg-wn-ink/85 p-4 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            >
              <button
                type="button"
                className="absolute right-5 top-5 rounded-full bg-wn-primary px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Close · Esc
              </button>
              <img
                src={showDetail ? spot.src : wideSrc}
                alt={spot.label}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function spotlightAccent(id: string) {
  if (id === 'overview') return '#49225B';
  if (id === 'tasks') return '#F97316';
  if (id === 'filters') return '#A56ABD';
  if (id === 'attachments') return '#14B8A6';
  if (id === 'complete') return '#F97316';
  return '#49225B';
}

/** Two product UIs side by side — Tab cycles Client → Freelancer → Both. Focused pane pops up. */
function DualBeat({ beat }: { beat: Beat }) {
  const panes = beat.gallery ?? (beat.src ? [beat.src] : []);
  const labels = beat.paneLabels ?? ['View A', 'View B'];
  const urls = [beat.url, beat.urlB ?? beat.url];
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [focus, setFocus] = useState<ManualFocus>('both');
  const paneRoles = resolveDualPaneRoles(beat, labels);
  const clientIdx = paneRoles.findIndex((r) => r.kind === 'client');
  const talentIdx = paneRoles.findIndex((r) => r.kind === 'freelancer');
  const focusedIdx =
    focus === 'client' ? (clientIdx >= 0 ? clientIdx : 0) : focus === 'freelancer' ? (talentIdx >= 0 ? talentIdx : 1) : -1;

  useEffect(() => {
    setFocus('both');
  }, [beat.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (document.querySelector('[aria-modal="true"]')) {
        if (e.key === 'Escape') setLightbox(null);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setFocus((prev) => cycleFocus(prev, e.shiftKey));
        return;
      }
      if (e.key === 'Escape' && focus !== 'both') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setFocus('both');
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [focus]);

      const popped =
    focusedIdx >= 0 && panes[focusedIdx]
      ? {
          src: panes[focusedIdx],
          label: labels[focusedIdx] ?? '',
          url: urls[focusedIdx],
          accent: paneRoles[focusedIdx]?.accent ?? '#49225B',
          kind: paneRoles[focusedIdx]?.kind ?? 'client',
          badge:
            beat.perspective === 'both'
              ? paneRoles[focusedIdx]?.kind === 'client'
                ? 'CLIENT'
                : 'FREELANCER'
              : (labels[focusedIdx] ?? 'FOCUS').toUpperCase(),
        }
      : null;

  return (
    <div className="relative flex h-full w-full flex-col bg-transparent">
      <CaptionBar beat={beat} />

      <p className="relative z-20 shrink-0 pb-1 text-center text-[10px] font-semibold tracking-[0.2em] text-wn-faint">
        {focus === 'both' ? 'TAB · FOCUS A VIEW' : 'TAB · NEXT · ESC BOTH'}
      </p>

      <div
        className={`relative grid min-h-0 flex-1 grid-cols-1 gap-3 px-3 pb-14 pt-1 short:gap-2 short:pb-12 md:grid-cols-2 md:gap-4 md:px-5 md:pb-5 md:short:pb-14 ${
          popped ? 'pointer-events-none' : ''
        }`}
      >
        {panes.slice(0, 2).map((src, i) => {
          const role = paneRoles[i];
          const frameKind =
            beat.perspective === 'client'
              ? 'client'
              : beat.perspective === 'freelancer'
                ? 'freelancer'
                : role.kind;
          const frameAccent = frameKind === 'client' ? '#A56ABD' : '#F97316';
          const roleLabel =
            beat.perspective === 'both'
              ? frameKind === 'client'
                ? 'CLIENT'
                : 'FREELANCER'
              : (labels[i] ?? '').toUpperCase();

          return (
            <RoleUiFrame
              key={`${beat.id}-${src}`}
              kind={frameKind}
              accent={frameAccent}
              label={roleLabel}
              person={
                beat.perspective === 'both'
                  ? frameKind === 'client'
                    ? 'SARAH'
                    : 'JACK'
                  : undefined
              }
              initial={{
                opacity: 0,
                x: i === 0 ? '-28%' : '28%',
                rotate: i === 0 ? -4 : 4,
                scale: 0.92,
              }}
              animate={{
                opacity: popped ? 0.28 : 1,
                x: 0,
                rotate: 0,
                scale: popped ? 0.94 : 1,
                filter: popped ? 'blur(2px)' : 'blur(0px)',
              }}
              transition={{ delay: 0.12 + i * 0.12, duration: 0.45, ease }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-wn-line bg-wn-soft px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  </span>
                  <span className="truncate text-[10px] font-medium text-black/45">{urls[i]}</span>
                </div>
                <span className="truncate text-[10px] font-semibold text-wn-muted">{labels[i]}</span>
              </div>
              <button
                type="button"
                className="pointer-events-auto relative min-h-0 flex-1 cursor-zoom-in bg-wn-soft"
                onClick={() => setLightbox(src)}
              >
                <img
                  src={src}
                  alt={labels[i] ?? beat.line}
                  className="absolute inset-0 h-full w-full object-cover object-top short:object-contain"
                />
              </button>
            </RoleUiFrame>
          );
        })}
      </div>

      <AnimatePresence>
        {popped ? (
          <FocusedUiPopup
            key={`${beat.id}-${popped.kind}`}
            src={popped.src}
            label={popped.label}
            url={popped.url}
            accent={popped.accent}
            badge={popped.badge}
            onClose={() => setFocus('both')}
            onExpand={() => setLightbox(popped.src)}
          />
        ) : null}
      </AnimatePresence>

      {lightbox
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[200] flex items-center justify-center bg-wn-ink/80 p-4"
              onClick={() => setLightbox(null)}
            >
              <img
                src={lightbox}
                alt=""
                className="max-h-full max-w-full rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

type ManualFocus = 'both' | 'client' | 'freelancer';

const FOCUS_CYCLE: ManualFocus[] = ['both', 'client', 'freelancer'];

function cycleFocus(current: ManualFocus, reverse = false): ManualFocus {
  const i = FOCUS_CYCLE.indexOf(current);
  const next = reverse ? (i - 1 + FOCUS_CYCLE.length) % FOCUS_CYCLE.length : (i + 1) % FOCUS_CYCLE.length;
  return FOCUS_CYCLE[next];
}

function FocusedUiPopup({
  src,
  label,
  url,
  accent,
  badge,
  onClose,
  onExpand,
  children,
}: {
  src?: string;
  label: string;
  url?: string;
  accent: string;
  badge: string;
  onClose: () => void;
  onExpand?: () => void;
  children?: ReactNode;
}) {
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center px-3 pb-3 pt-1 md:px-8 md:pb-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stage veil */}
      <motion.button
        type="button"
        className="absolute inset-0"
        aria-label="Return to both views"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: `
            radial-gradient(ellipse 55% 50% at 50% 48%, ${accent}33 0%, transparent 58%),
            radial-gradient(ellipse 80% 70% at 50% 50%, rgba(26,18,36,0.55) 0%, rgba(26,18,36,0.72) 100%)
          `,
        }}
      />

      {/* Ambient orbs */}
      <motion.div
        className="pointer-events-none absolute left-[18%] top-[22%] h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: accent }}
        animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[18%] right-[16%] h-36 w-36 rounded-full bg-[#14B8A6] blur-3xl"
        animate={{ opacity: [0.12, 0.28, 0.12], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />

      {/* Floating sparkles */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute h-1 w-1 rounded-full bg-white"
          style={{
            left: `${18 + i * 12}%`,
            top: `${20 + (i % 3) * 18}%`,
          }}
          animate={{ y: [0, -14, 0], opacity: [0.15, 0.85, 0.15] }}
          transition={{ duration: 2.8 + i * 0.25, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      <motion.div
        className="relative z-10 w-full max-w-5xl"
        initial={{ opacity: 0, y: 40, scale: 0.86 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
      >
        {/* Overhead title plate */}
        <motion.div
          className="mb-3 flex items-center justify-center gap-3 short:mb-1.5 short:scale-90"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/50 md:w-16" />
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[0.22em] text-white shadow-lg short:px-3 short:py-1 short:text-[10px]"
            style={{
              background: `linear-gradient(110deg, ${accent}, ${accent}cc)`,
              boxShadow: `0 12px 32px ${accent}66`,
            }}
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-white"
              animate={{ opacity: [1, 0.35, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            IN FOCUS · {badge}
          </div>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/50 md:w-16" />
        </motion.div>

        {/* Decorated frame */}
        <div className="relative p-[3px]">
          <div
            className="absolute inset-0 rounded-[1.6rem]"
            style={{
              background: `linear-gradient(135deg, ${accent}, #14B8A6, ${accent})`,
              boxShadow: `0 0 0 1px ${accent}88, 0 30px 80px rgba(0,0,0,0.45), 0 0 60px ${accent}44`,
            }}
          />

          <motion.div
            className="pointer-events-none absolute -inset-[2px] rounded-[1.7rem] opacity-70"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${accent}, transparent, #14B8A6, transparent)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative flex h-[min(62svh,calc(100dvh-7.5rem))] max-h-[760px] flex-col overflow-hidden rounded-[1.45rem] bg-white short:h-[min(58svh,calc(100dvh-6rem))]">
            <FocusCorner className="left-3 top-3" accent={accent} />
            <FocusCorner className="right-3 top-3 rotate-90" accent={accent} />
            <FocusCorner className="bottom-3 left-3 -rotate-90" accent={accent} />
            <FocusCorner className="bottom-3 right-3 rotate-180" accent={accent} />

            <motion.div
              className="pointer-events-none absolute inset-y-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ left: '-40%', opacity: 0 }}
              animate={{ left: '120%', opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, delay: 0.25, ease: 'easeOut' }}
            />

            <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-wn-line/80 bg-gradient-to-r from-[#F7F2FA] via-white to-[#F7F2FA] px-4 py-2 short:py-1.5 md:px-5 md:py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </span>
                <span className="truncate text-[11px] font-medium text-black/40">
                  {url ?? 'app.worknest.com'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden font-display text-sm font-semibold text-wn-ink sm:inline">
                  {label}
                </span>
                {onExpand ? (
                  <button
                    type="button"
                    onClick={onExpand}
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    Expand
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-wn-ink ring-1 ring-wn-line"
                >
                  Esc
                </button>
              </div>
            </div>

            <div className="relative z-10 min-h-0 flex-1 bg-[#F7F2FA]">
              {children ? (
                children
              ) : src ? (
                <img
                  src={src}
                  alt={label}
                  className="absolute inset-0 h-full w-full object-contain object-top"
                />
              ) : null}

              <div
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: `inset 0 0 80px ${accent}18` }}
              />
            </div>
          </div>
        </div>

        <motion.p
          className="mt-3 text-center text-[11px] font-semibold tracking-[0.18em] text-white/65 short:mt-1.5 short:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          TAB TO CONTINUE · ESC FOR BOTH
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function FocusCorner({ className, accent }: { className: string; accent: string }) {
  return (
    <span
      className={`pointer-events-none absolute z-20 h-5 w-5 ${className}`}
      style={{
        borderTop: `2.5px solid ${accent}`,
        borderLeft: `2.5px solid ${accent}`,
        opacity: 0.9,
      }}
      aria-hidden
    />
  );
}

function RoleUiFrame({
  kind,
  accent,
  label,
  person,
  children,
  className = '',
  initial,
  animate,
  transition,
}: {
  kind: 'client' | 'freelancer';
  accent: string;
  label: string;
  person?: string;
  children: ReactNode;
  className?: string;
  initial?: Record<string, string | number>;
  animate?: Record<string, string | number>;
  transition?: Record<string, unknown>;
}) {
  const isClient = kind === 'client';

  return (
    <motion.div
      className={`relative flex min-h-0 flex-col ${className}`}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <div
        className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.35rem] bg-white"
        style={{
          boxShadow: `0 0 0 2px ${accent}, 0 0 0 6px ${accent}22, 0 18px 40px ${accent}28`,
        }}
      >
        <div
          className="flex shrink-0 items-center justify-between gap-2 px-3 py-1.5"
          style={{
            background: isClient
              ? 'linear-gradient(90deg, #49225B, #A56ABD)'
              : 'linear-gradient(90deg, #EA580C, #F97316)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-black text-white ring-1 ring-white/35">
              {isClient ? 'C' : 'F'}
            </span>
            <span className="text-[10px] font-bold tracking-[0.18em] text-white">{label}</span>
          </div>
          {person ? (
            <span className="text-[9px] font-semibold tracking-[0.12em] text-white/75">{person}</span>
          ) : null}
        </div>

        <span
          className="pointer-events-none absolute left-2 top-[2.15rem] z-20 h-3 w-3"
          style={{ borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` }}
        />
        <span
          className="pointer-events-none absolute right-2 top-[2.15rem] z-20 h-3 w-3"
          style={{ borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}` }}
        />
        <span
          className="pointer-events-none absolute bottom-2 left-2 z-20 h-3 w-3"
          style={{ borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` }}
        />
        <span
          className="pointer-events-none absolute bottom-2 right-2 z-20 h-3 w-3"
          style={{ borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}` }}
        />

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </motion.div>
  );
}

function resolveDualPaneRoles(beat: Beat, labels: string[]) {
  const client = { kind: 'client' as const, accent: '#A56ABD' };
  const talent = { kind: 'freelancer' as const, accent: '#F97316' };

  if (beat.perspective === 'both') {
    const leftIsTalent = /jack|freelancer|his /i.test(labels[0] ?? '');
    return leftIsTalent ? [talent, client] : [client, talent];
  }
  // Same-role dual: first pane = Client key slot, second = Freelancer key slot for Tab cycle
  if (beat.perspective === 'freelancer') {
    return [
      { kind: 'client' as const, accent: '#F97316' },
      { kind: 'freelancer' as const, accent: '#F97316' },
    ];
  }
  return [
    { kind: 'client' as const, accent: '#A56ABD' },
    { kind: 'freelancer' as const, accent: '#A56ABD' },
  ];
}

/** Smart matching — live Match / Talent radar UI. Tab focuses a side. */
function RadarBeat({ beat }: { beat: Beat }) {
  const tips = beat.points ?? [];
  const [focus, setFocus] = useState<ManualFocus>('both');

  useEffect(() => {
    setFocus('both');
  }, [beat.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setFocus((prev) => cycleFocus(prev, e.shiftKey));
        return;
      }
      if (e.key === 'Escape' && focus !== 'both') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setFocus('both');
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [focus]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-transparent">
      <CaptionBar beat={beat} />
      <p className="relative z-20 shrink-0 pb-1 text-center text-[10px] font-semibold tracking-[0.2em] text-wn-faint">
        {focus === 'both' ? 'TAB · FOCUS A VIEW' : 'TAB · NEXT · ESC BOTH'}
      </p>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 pb-14 pt-1 short:pb-12 md:px-5 md:pb-4 md:short:pb-14">
        <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-2 overflow-hidden short:gap-1.5">
          <div
            className={`grid min-h-0 grid-cols-1 gap-3 overflow-hidden md:grid-cols-2 ${
              focus !== 'both' ? 'pointer-events-none' : ''
            }`}
          >
            <RoleUiFrame
              kind="freelancer"
              accent="#F97316"
              label="FREELANCER"
              person="JACK"
              animate={{
                opacity: focus !== 'both' ? 0.28 : 1,
                scale: focus !== 'both' ? 0.94 : 1,
                filter: focus !== 'both' ? 'blur(2px)' : 'blur(0px)',
              }}
              transition={{ duration: 0.4, ease }}
            >
              <BrowserChrome url="app.worknest.com/freelancer/jobs" />
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F7F2FA] p-2.5 md:p-3">
                <p className="mb-2 shrink-0 text-[12px] font-bold text-wn-ink">
                  Match radar on Browse Jobs
                </p>
                <div className="wn-pres-fit min-h-0 flex-1 overflow-hidden">
                  <FreelancerMatchRadarUI />
                </div>
              </div>
            </RoleUiFrame>

            <RoleUiFrame
              kind="client"
              accent="#A56ABD"
              label="CLIENT"
              person="SARAH"
              className="hidden md:flex"
              animate={{
                opacity: focus !== 'both' ? 0.28 : 1,
                scale: focus !== 'both' ? 0.94 : 1,
                filter: focus !== 'both' ? 'blur(2px)' : 'blur(0px)',
              }}
              transition={{ duration: 0.4, ease }}
            >
              <BrowserChrome url="app.worknest.com/client/jobs/…/proposals" />
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#F7F2FA] p-2.5 md:p-3">
                <p className="mb-2 shrink-0 text-[12px] font-bold text-wn-ink">
                  Talent radar on Job Proposals
                </p>
                <div className="wn-pres-fit min-h-0 flex-1 overflow-hidden">
                  <ClientMatchRadarUI />
                </div>
              </div>
            </RoleUiFrame>
          </div>

          <div className="shrink-0 rounded-2xl bg-white px-3 py-1.5 shadow-card ring-1 ring-wn-line short:py-1 md:px-4 md:py-2">
            <p className="mb-1 text-[12px] font-bold text-wn-primary short:mb-0.5 short:line-clamp-1 short:text-[11px]">
              Important: this only suggests. It never hires or starts a project.
            </p>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4 short:hidden sm:short:grid">
              {tips.map((tip, i) => (
                <p
                  key={tip}
                  className="rounded-xl bg-wn-soft px-2.5 py-1.5 text-[11px] leading-snug text-wn-ink short:px-2 short:py-1 short:text-[10px] short:line-clamp-2"
                >
                  <span className="font-bold text-wn-teal">{i + 1}. </span>
                  {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {focus === 'client' ? (
          <FocusedUiPopup
            key="radar-client"
            label="Talent radar"
            url="app.worknest.com/client/jobs/…/proposals"
            accent="#A56ABD"
            badge="CLIENT"
            onClose={() => setFocus('both')}
          >
            <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F2FA] p-3 md:p-4">
              <div className="wn-pres-fit min-h-0 flex-1 overflow-hidden">
                <ClientMatchRadarUI />
              </div>
            </div>
          </FocusedUiPopup>
        ) : null}
        {focus === 'freelancer' ? (
          <FocusedUiPopup
            key="radar-talent"
            label="Match radar"
            url="app.worknest.com/freelancer/jobs"
            accent="#F97316"
            badge="FREELANCER"
            onClose={() => setFocus('both')}
          >
            <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F2FA] p-3 md:p-4">
              <div className="wn-pres-fit min-h-0 flex-1 overflow-hidden">
                <FreelancerMatchRadarUI />
              </div>
            </div>
          </FocusedUiPopup>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MatchBeat({ beat }: { beat: Beat }) {
  const gallery = beat.gallery ?? (beat.src ? [beat.src] : []);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const current = gallery[active] ?? beat.src!;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative flex h-full w-full flex-col bg-transparent">
      <CaptionBar beat={beat} />
      <div className="relative min-h-0 flex-1 px-3 pb-14 pt-1 short:pb-12 md:px-5 md:pb-5 md:short:pb-14">
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-wn-line">
          <BrowserChrome url={beat.url} onExpand={() => setOpen(true)} />
          <button
            type="button"
            className="relative min-h-0 flex-1 cursor-zoom-in bg-wn-soft"
            onClick={() => setOpen(true)}
          >
            <img
              key={current}
              src={current}
              alt={beat.line}
              className="absolute inset-0 h-full w-full object-contain object-center"
            />
            <div className="pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2 rounded-full bg-[#14B8A6] px-5 py-2 text-[12px] font-bold tracking-[0.2em] text-white shadow-soft">
              ✓ MATCHED
            </div>
          </button>
          {gallery.length > 1 ? (
            <div className="flex items-center justify-center gap-2 border-t border-wn-line bg-white px-3 py-2.5">
              <button
                type="button"
                className="rounded-full bg-wn-soft px-3 py-1 text-[11px] font-semibold text-wn-ink ring-1 ring-wn-line"
                onClick={() => setActive((v) => (v - 1 + gallery.length) % gallery.length)}
              >
                ←
              </button>
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Screenshot ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === active ? 'w-7 bg-wn-orange' : 'w-2 bg-wn-line hover:bg-wn-faint'
                  }`}
                />
              ))}
              <button
                type="button"
                className="rounded-full bg-wn-soft px-3 py-1 text-[11px] font-semibold text-wn-ink ring-1 ring-wn-line"
                onClick={() => setActive((v) => (v + 1) % gallery.length)}
              >
                →
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[200] flex items-center justify-center bg-wn-ink/80 p-4"
              onClick={() => setOpen(false)}
            >
              <img
                src={current}
                alt={beat.line}
                className="max-h-full max-w-full rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

type MoneyStage = 'idle' | 'moving-in' | 'secured' | 'moving-out' | 'paid';

function MoneyBeat({ beat }: { beat: Beat }) {
  const phase = beat.moneyPhase ?? 'deposit';
  const isDeposit = phase === 'deposit';
  const [stage, setStage] = useState<MoneyStage>('idle');
  const [open, setOpen] = useState(false);
  const celebrate = !isDeposit && !beat.src;

  useEffect(() => {
    setStage('idle');
    const timers = isDeposit
      ? [
          window.setTimeout(() => setStage('moving-in'), 400),
          window.setTimeout(() => setStage('secured'), 1600),
        ]
      : [
          window.setTimeout(() => setStage('secured'), 200),
          window.setTimeout(() => setStage('moving-out'), 1100),
          window.setTimeout(() => setStage('paid'), 2300),
        ];
    return () => timers.forEach(clearTimeout);
  }, [isDeposit, beat.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const clientOn = stage === 'idle' || stage === 'moving-in';
  const nestOn = stage === 'moving-in' || stage === 'secured' || stage === 'moving-out';
  const talentOn = stage === 'moving-out' || stage === 'paid';
  const leftFill =
    stage === 'idle' ? '8%' : stage === 'moving-in' ? '100%' : '100%';
  const rightFill =
    stage === 'moving-out' || stage === 'paid' ? '100%' : stage === 'secured' ? '18%' : '0%';

  const status =
    stage === 'idle'
      ? 'Ready to fund the project'
      : stage === 'moving-in'
        ? 'Client deposits full amount → WorkNest'
        : stage === 'secured'
          ? isDeposit
            ? `🔒 ${PROJECT_AMOUNT} secured in WorkNest`
            : 'Vault unlocks after approval'
          : stage === 'moving-out'
            ? 'WorkNest releases payment → Freelancer'
            : `💰 ${PROJECT_AMOUNT} in freelancer wallet`;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-transparent">
      <CaptionBar beat={beat} />

      {celebrate ? <CompletionVibes active={stage === 'paid'} warming={stage !== 'idle'} /> : null}

      <div
        className={`relative z-10 mx-auto w-full max-w-5xl px-4 pb-3 short:pb-2 md:px-6 ${
          celebrate ? 'flex min-h-0 flex-1 flex-col justify-center' : ''
        }`}
      >
        <div className="rounded-2xl bg-wn-surface/95 px-4 py-4 shadow-card ring-1 ring-wn-line backdrop-blur-sm short:rounded-xl short:px-3 short:py-3 md:px-8 md:py-6">
          <div className="flex items-center gap-2 md:gap-3">
            <MoneyNode
              label="SARAH"
              tone="client"
              active={clientOn || stage === 'secured'}
              avatar="/avatars/client.jpg"
            />

            <div className="relative h-1.5 flex-1 overflow-visible rounded-full bg-wn-soft">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#A56ABD] to-[#14B8A6]"
                animate={{ width: leftFill }}
                transition={{ duration: 1.1, ease }}
              />
              {/* traveling deposit coin */}
              <AnimatePresence>
                {(stage === 'moving-in' || (isDeposit && stage === 'secured')) && (
                  <motion.div
                    key="coin-in"
                    className="absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 rounded-full bg-wn-primary px-2.5 py-1 text-[10px] font-bold text-white shadow-[0_0_24px_rgba(165,106,189,0.65)] ring-1 ring-wn-line md:text-[11px]"
                    initial={{ left: '4%', opacity: 0, scale: 0.85 }}
                    animate={{
                      left: stage === 'moving-in' ? '72%' : '50%',
                      opacity: 1,
                      scale: 1,
                      x: '-50%',
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 1.05, ease }}
                  >
                    {stage === 'secured' ? `🔒 ${PROJECT_AMOUNT}` : PROJECT_AMOUNT}
                  </motion.div>
                )}
              </AnimatePresence>
              {/* soft pulses on the deposit leg */}
              {stage === 'moving-in' ? (
                <motion.span
                  className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#A56ABD] shadow-[0_0_12px_#A56ABD]"
                  animate={{ left: ['0%', '100%'], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.05, ease: 'easeInOut' }}
                />
              ) : null}
            </div>

            <MoneyNode label="WORKNEST" tone="nest" active={nestOn || stage === 'paid'} nest />

            <div className="relative h-1.5 flex-1 overflow-visible rounded-full bg-wn-soft">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#14B8A6] to-[#F97316]"
                animate={{ width: rightFill }}
                transition={{ duration: 1.05, ease }}
              />
              <AnimatePresence>
                {(stage === 'moving-out' || stage === 'paid') && (
                  <motion.div
                    key="coin-out"
                    className="absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 rounded-full bg-wn-orange px-2.5 py-1 text-[10px] font-bold text-white shadow-[0_0_24px_rgba(249,115,22,0.55)] ring-1 ring-wn-line md:text-[11px]"
                    initial={{ left: '8%', opacity: 1, x: '-50%' }}
                    animate={{
                      left: stage === 'paid' ? '92%' : '55%',
                      opacity: 1,
                      x: '-50%',
                    }}
                    transition={{ duration: 1.05, ease }}
                  >
                    {stage === 'paid' ? `💰 ${PROJECT_AMOUNT}` : PROJECT_AMOUNT}
                  </motion.div>
                )}
              </AnimatePresence>
              {stage === 'moving-out' ? (
                <motion.span
                  className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-wn-orange shadow-[0_0_12px_#F97316]"
                  animate={{ left: ['0%', '100%'], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.05, ease: 'easeInOut' }}
                />
              ) : null}
              {/* dashed “waiting” state for deposit on the second leg */}
              {isDeposit && stage === 'secured' ? (
                <motion.p
                  className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold tracking-[0.14em] text-wn-faint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  HELD UNTIL DELIVERY
                </motion.p>
              ) : null}
            </div>

            <MoneyNode
              label="JACK"
              tone="talent"
              active={talentOn || (isDeposit && stage === 'secured')}
              soft={isDeposit && stage === 'secured'}
              avatar="/avatars/freelancer.jpg"
            />
          </div>

          <motion.p
            key={status}
            className="mt-5 text-center font-display text-base font-semibold text-wn-ink md:text-lg"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {status}
          </motion.p>

          {celebrate && stage === 'paid' ? (
            <motion.div
              className="mt-6 flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, ease }}
            >
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-[#14B8A6] text-2xl text-white shadow-[0_0_40px_rgba(20,184,166,0.55)] md:h-20 md:w-20 md:text-3xl"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                ✓
              </motion.div>
              <p className="font-display text-xl font-bold tracking-wide text-wn-primary md:text-2xl">
                Delivery complete. Paid.
              </p>
              <p className="max-w-md text-center text-sm text-wn-muted md:text-base">
                Escrow closed. Trust held. The bridge did its job.
              </p>
            </motion.div>
          ) : null}
        </div>
      </div>

      {beat.src ? (
        <div className="relative min-h-0 flex-1 px-3 pb-14 pt-1 short:pb-12 md:px-5 md:pb-4 md:short:pb-14">
          <motion.div
            className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-wn-line"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease }}
          >
            <BrowserChrome url={beat.url} onExpand={() => setOpen(true)} />
            <button
              type="button"
              className="relative min-h-0 flex-1 cursor-zoom-in bg-wn-soft"
              onClick={() => setOpen(true)}
            >
              <img
                src={beat.src}
                alt={beat.line}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </button>
          </motion.div>
        </div>
      ) : null}

      {open && beat.src
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[200] flex items-center justify-center bg-wn-ink/80 p-4"
              onClick={() => setOpen(false)}
            >
              <img
                src={beat.src}
                alt={beat.line}
                className="max-h-full max-w-full rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function CompletionVibes({ active, warming }: { active: boolean; warming: boolean }) {
  const sparks = [
    { left: '12%', top: '22%', color: '#A56ABD', delay: 0 },
    { left: '22%', top: '68%', color: '#F97316', delay: 0.15 },
    { left: '78%', top: '28%', color: '#14B8A6', delay: 0.08 },
    { left: '86%', top: '62%', color: '#A56ABD', delay: 0.22 },
    { left: '48%', top: '16%', color: '#F97316', delay: 0.12 },
    { left: '58%', top: '78%', color: '#14B8A6', delay: 0.28 },
    { left: '34%', top: '42%', color: '#F97316', delay: 0.18 },
    { left: '70%', top: '48%', color: '#A56ABD', delay: 0.05 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute left-1/2 top-[42%] h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#14B8A6]/20 blur-3xl md:h-[36rem] md:w-[36rem]"
        animate={{
          opacity: active ? [0.35, 0.7, 0.35] : warming ? 0.22 : 0.08,
          scale: active ? [0.92, 1.08, 0.92] : 0.95,
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-[18%] top-[30%] h-48 w-48 rounded-full bg-[#A56ABD]/25 blur-3xl"
        animate={{ opacity: warming ? [0.2, 0.45, 0.2] : 0.1, scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[18%] right-[14%] h-52 w-52 rounded-full bg-[#F97316]/22 blur-3xl"
        animate={{ opacity: warming ? [0.15, 0.4, 0.15] : 0.08, scale: [1, 1.12, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />

      <AnimatePresence>
        {active
          ? sparks.map((s, i) => (
              <motion.span
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{ left: s.left, top: s.top, backgroundColor: s.color }}
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.4, 1.4, 0.2],
                  y: [0, -48 - (i % 3) * 18, -90],
                }}
                transition={{
                  duration: 1.8,
                  delay: s.delay,
                  repeat: Infinity,
                  repeatDelay: 0.6,
                  ease: 'easeOut',
                }}
              />
            ))
          : null}
      </AnimatePresence>

      {active ? (
        <>
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute left-1/2 top-[48%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#14B8A6]/40 md:h-56 md:w-56"
              initial={{ opacity: 0.55, scale: 0.55 }}
              animate={{ opacity: 0, scale: 2.1 }}
              transition={{
                duration: 2.2,
                delay: ring * 0.55,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      ) : null}
    </div>
  );
}

function MoneyNode({
  label,
  tone,
  active,
  nest,
  soft,
  avatar,
}: {
  label: string;
  tone: 'client' | 'nest' | 'talent';
  active?: boolean;
  nest?: boolean;
  soft?: boolean;
  avatar?: string;
}) {
  const ring =
    tone === 'client'
      ? 'ring-[#A56ABD]/50'
      : tone === 'nest'
        ? 'ring-[#14B8A6]/55'
        : 'ring-[#F97316]/50';
  const glow = active
    ? tone === 'client'
      ? 'shadow-[0_0_28px_rgba(165,106,189,0.45)]'
      : tone === 'nest'
        ? 'shadow-[0_0_28px_rgba(20,184,166,0.4)]'
        : 'shadow-[0_0_28px_rgba(249,115,22,0.4)]'
    : '';

  return (
    <motion.div
      className={`flex shrink-0 flex-col items-center gap-1.5 ${soft ? 'opacity-55' : ''}`}
      animate={{ scale: active ? 1.04 : 0.96, opacity: soft ? 0.55 : 1 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-wn-soft ring-2 ${ring} ${glow} md:h-14 md:w-14`}
      >
        {nest ? (
          <img src="/logo-clear.png" alt="" className="h-7 w-7 object-contain md:h-8 md:w-8" />
        ) : avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] font-bold text-wn-muted">{label[0]}</span>
        )}
      </div>
      <span
        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-[0.14em] ${
          active
            ? nest
              ? 'bg-wn-teal text-white'
              : tone === 'talent'
                ? 'bg-wn-orange text-white'
                : 'bg-wn-accent text-white'
            : 'bg-wn-soft text-wn-faint'
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
}

function ArcBeat({ beat }: { beat: Beat }) {
  const acts = [
    {
      act: '01',
      title: 'FIND',
      line: 'The right job. The right talent.',
      detail: 'Browse · Match · Profile',
      src: beat.gallery?.[0],
      accent: '#F97316',
      who: 'Sarah posts. Jack discovers.',
    },
    {
      act: '02',
      title: 'CHOOSE',
      line: 'Meet. Trust. Accept.',
      detail: 'Interview · Hire · Escrow',
      src: beat.gallery?.[1],
      accent: '#A56ABD',
      who: 'They meet. She chooses Jack.',
    },
    {
      act: '03',
      title: 'DELIVER',
      line: 'Build together. Get paid.',
      detail: 'Workspace · Complete · Wallet',
      src: beat.gallery?.[2],
      accent: '#14B8A6',
      who: 'Work ships. Escrow unlocks.',
    },
  ] as const;

  const [focus, setFocus] = useState<number | null>(null);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    setFocus(null);
    setLit(0);
    const timers = [
      window.setTimeout(() => setLit(1), 450),
      window.setTimeout(() => setLit(2), 1100),
      window.setTimeout(() => setLit(3), 1750),
    ];
    return () => timers.forEach(clearTimeout);
  }, [beat.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focus != null) {
        e.preventDefault();
        setFocus(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0c0812]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 18% 30%, rgba(249,115,22,0.22) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 55%, rgba(165,106,189,0.2) 0%, transparent 50%),
            radial-gradient(ellipse 55% 45% at 82% 35%, rgba(20,184,166,0.18) 0%, transparent 55%),
            linear-gradient(168deg, #16101f 0%, #0c0812 55%, #08050c 100%)
          `,
        }}
      />

      {/* Sweeping light across the arc */}
      <motion.div
        className="pointer-events-none absolute left-0 top-[42%] z-[1] h-24 w-40 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
        animate={{ left: ['5%', '85%', '5%'], opacity: [0.15, 0.45, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 flex shrink-0 flex-col items-center px-5 pt-4 text-center short:pt-3 md:pt-7 md:short:pt-3.5">
        <motion.p
          className="text-[11px] font-bold tracking-[0.32em] text-[#14B8A6] short:text-[9px]"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          THE FULL JOURNEY
        </motion.p>
        <motion.h1
          className="mt-2 font-display text-[clamp(1.5rem,3.8vw,3.25rem)] font-bold tracking-tight text-white short:mt-1 short:text-[clamp(1.25rem,3.2vw,1.85rem)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease }}
        >
          {beat.line}
        </motion.h1>
        <motion.p
          className="mt-1.5 font-display text-sm font-semibold tracking-[0.08em] text-white/55 short:mt-1 short:text-xs md:mt-2 md:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          {beat.note}
        </motion.p>
      </div>

      {/* Connecting path under the acts */}
      <div className="pointer-events-none absolute left-[12%] right-[12%] top-[52%] z-[2] hidden h-px md:block">
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-[#F97316] via-[#A56ABD] to-[#14B8A6]"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: lit >= 3 ? 1 : lit / 3, opacity: 1 }}
          transition={{ duration: 0.8, ease }}
        />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 pb-14 pt-3 short:pb-12 short:pt-2 md:px-8 md:pb-7 md:short:pb-14">
        <div className="grid h-full max-h-full w-full max-w-6xl grid-cols-1 gap-2.5 overflow-y-auto sm:grid-cols-3 sm:gap-3 sm:overflow-visible md:gap-5">
          {acts.map((act, i) => {
            const isFocus = focus === i;
            const dimmed = focus != null && !isFocus;
            const revealed = lit > i;

            return (
              <motion.button
                key={act.act}
                type="button"
                onClick={() => setFocus(isFocus ? null : i)}
                className="group relative min-h-[160px] overflow-hidden rounded-[1.25rem] text-left short:min-h-[140px] sm:h-full sm:min-h-0 md:rounded-[1.5rem]"
                initial={{ opacity: 0, y: 48, scale: 0.92 }}
                animate={{
                  opacity: dimmed ? 0.35 : revealed ? 1 : 0.25,
                  y: revealed ? 0 : 28,
                  scale: isFocus ? 1.03 : revealed ? 1 : 0.94,
                  filter: dimmed ? 'blur(2px)' : 'blur(0px)',
                }}
                transition={{ duration: 0.65, delay: 0.15 + i * 0.12, ease }}
                style={{
                  zIndex: isFocus ? 20 : 10,
                  boxShadow: revealed
                    ? `0 0 0 1px ${act.accent}66, 0 28px 60px rgba(0,0,0,0.45), 0 0 50px ${act.accent}33`
                    : 'none',
                }}
              >
                {act.src ? (
                  <motion.img
                    src={act.src}
                    alt={act.title}
                    className="absolute inset-0 h-full w-full object-cover object-top"
                    animate={{ scale: isFocus ? 1.06 : 1 }}
                    transition={{ duration: 0.6 }}
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: act.accent }} />
                )}

                <div
                  className="absolute inset-0"
                  style={{
                    background: `
                      linear-gradient(180deg, rgba(8,5,12,0.15) 0%, rgba(8,5,12,0.35) 42%, ${act.accent}f0 100%)
                    `,
                  }}
                />

                {/* Act number watermark */}
                <motion.span
                  className="pointer-events-none absolute -right-1 top-2 font-display text-[5.5rem] font-black leading-none text-white/[0.08] md:text-[7rem]"
                  animate={{ opacity: revealed ? 1 : 0 }}
                >
                  {act.act}
                </motion.span>

                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] text-white"
                      style={{ backgroundColor: `${act.accent}` }}
                    >
                      ACT {act.act}
                    </span>
                    <motion.span
                      className="h-2 w-2 rounded-full bg-white"
                      animate={
                        revealed
                          ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }
                          : { opacity: 0.2 }
                      }
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                  </div>
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-white short:text-xl md:text-4xl lg:text-5xl md:short:text-2xl">
                    {act.title}
                  </h2>
                  <p className="mt-1.5 text-sm font-semibold text-white/95 short:mt-1 short:text-xs md:mt-2 md:text-base">{act.line}</p>
                  <p className="mt-1 text-[12px] text-white/70 short:line-clamp-1 md:mt-1.5 md:text-[13px]">{act.who}</p>
                  <p className="mt-2 text-[10px] font-bold tracking-[0.16em] text-white/55 short:mt-1.5 short:hidden md:mt-3 md:short:block md:short:line-clamp-1">
                    {act.detail}
                  </p>
                </div>

                {/* Shine on reveal */}
                {revealed ? (
                  <motion.span
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ left: '-40%', opacity: 0 }}
                    animate={{ left: '120%', opacity: [0, 1, 0] }}
                    transition={{ delay: 0.35 + i * 0.15, duration: 0.9, ease: 'easeOut' }}
                  />
                ) : null}
              </motion.button>
            );
          })}
        </div>
      </div>

      <motion.p
        className="relative z-10 shrink-0 pb-14 text-center text-[11px] font-medium tracking-[0.14em] text-white/40 short:pb-12 short:text-[10px] md:pb-4 md:short:pb-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        {focus != null
          ? `ACT ${acts[focus].act} · ${acts[focus].title} — click again or Esc`
          : 'Click an act to focus'}
      </motion.p>
    </div>
  );
}

/** Final slide — large QR to the live app. */
function QrBeat({ beat }: { beat: Beat }) {
  const src = beat.src ?? '/worknest-qr.png';
  const url = beat.url ?? 'https://work-nest-platform-nu.vercel.app/';
  const href = url.startsWith('http') ? url : `https://${url}`;
  const label = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#F4F0F8]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 50% 0%, rgba(165,106,189,0.2) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 100% 100%, rgba(73,34,91,0.1) 0%, transparent 50%)
          `,
        }}
      />
      <motion.div
        className="relative z-10 flex max-h-full flex-col items-center overflow-y-auto px-6 pb-16 pt-4 text-center short:pb-14 short:pt-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
      >
        <img
          src="/logo-clear.png"
          alt="WorkNest"
          className="h-8 w-auto object-contain short:h-7 md:h-10"
        />
        <h1 className="mt-4 font-display text-2xl font-bold text-wn-primary short:mt-2 short:text-xl md:mt-5 md:text-5xl md:short:text-3xl">
          {beat.line}
        </h1>
        {beat.note ? (
          <p className="mt-1.5 text-sm text-wn-ink/65 short:mt-1 short:text-xs md:mt-2 md:text-lg">
            {beat.note}
          </p>
        ) : null}
        <div className="mt-5 rounded-[1.5rem] bg-white p-3.5 shadow-[0_18px_48px_rgba(73,34,91,0.14)] ring-1 ring-wn-line short:mt-3 short:rounded-2xl short:p-2.5 md:mt-8 md:rounded-[1.75rem] md:p-7 md:short:mt-4 md:short:p-4">
          <img
            src={`${src}?v=2`}
            alt="QR code to open WorkNest"
            className="h-[min(36svh,280px)] w-[min(36svh,280px)] object-contain short:h-[min(28svh,200px)] short:w-[min(28svh,200px)] md:h-[min(42vh,320px)] md:w-[min(42vh,320px)] md:short:h-[min(30svh,220px)] md:short:w-[min(30svh,220px)]"
          />
        </div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-4 font-display text-sm font-semibold tracking-wide text-wn-primary underline-offset-4 transition hover:underline short:mt-2.5 short:text-xs md:mt-5 md:text-base"
        >
          {label}
        </a>
      </motion.div>
    </div>
  );
}

/** Closing slide — high-clarity tech board for presenting what was built. */
function ClosingBeat({ beat }: { beat: Beat }) {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#F6F0FA]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% -10%, rgba(165,106,189,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 100% 100%, rgba(20,184,166,0.1) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 flex h-full w-full flex-col px-4 py-3 short:px-3 short:py-2.5 md:px-8 md:py-6 md:short:py-3">
        <motion.header
          className="shrink-0 text-center"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <img
            src="/logo-clear.png"
            alt="WorkNest"
            className="mx-auto h-6 w-auto object-contain short:h-5 md:h-8"
          />
          <h1 className="mt-2 font-display text-[clamp(1.25rem,2.6vw,2.25rem)] font-bold text-wn-primary short:mt-1 short:text-[clamp(1.1rem,2.2vw,1.5rem)] md:mt-3">
            {beat.line}
          </h1>
          {beat.note ? (
            <p className="mx-auto mt-1 max-w-2xl text-xs text-wn-ink/65 short:mt-0.5 short:line-clamp-1 md:mt-1.5 md:text-base">
              {beat.note}
            </p>
          ) : null}
        </motion.header>

        <div className="mx-auto mt-3 grid min-h-0 w-full max-w-6xl flex-1 grid-cols-1 content-start gap-2 overflow-y-auto pb-14 short:mt-2 short:gap-1.5 short:pb-12 sm:grid-cols-2 sm:content-center md:mt-6 md:gap-4 md:short:mt-3 md:short:gap-2 md:short:pb-14">
          {closingDecisions.map((item, i) => (
            <motion.article
              key={item.title}
              className="flex gap-3 rounded-xl bg-white px-3.5 py-2.5 shadow-[0_10px_28px_rgba(73,34,91,0.08)] ring-1 ring-wn-line short:gap-2.5 short:rounded-lg short:px-3 short:py-2 md:gap-5 md:rounded-2xl md:px-6 md:py-5 md:short:gap-3 md:short:px-4 md:short:py-2.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 + i * 0.05, ease }}
            >
              <span className="shrink-0 font-display text-2xl font-bold leading-none text-wn-orange short:text-xl md:text-4xl md:short:text-2xl">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold leading-snug text-wn-primary short:text-sm md:text-xl md:short:text-base">
                  {item.title}
                </h2>
                <p className="mt-1 text-[13px] leading-snug text-wn-ink/75 short:mt-0.5 short:line-clamp-2 short:text-[12px] md:mt-2 md:text-base md:leading-relaxed md:short:line-clamp-3 md:short:text-[13px]">
                  {item.line}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

function CaptionBar({ beat }: { beat: Beat }) {
  return (
    <motion.div
      className="relative z-20 shrink-0 px-3 pb-1.5 pt-3 short:pb-1 short:pt-2 md:px-5 md:pt-5 md:short:pt-2.5"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
    >
      <div className="rounded-2xl bg-white px-3.5 py-2.5 shadow-card ring-1 ring-wn-line short:rounded-xl short:px-3 short:py-2 md:px-5 md:py-3.5">
        <div className="mb-1 flex flex-wrap items-center gap-2 short:mb-0.5">
          <UserPerspective perspective={beat.perspective} />
          {beat.step ? (
            <span className="rounded-full bg-wn-soft px-2.5 py-1 text-[11px] font-bold text-wn-orange ring-1 ring-wn-line short:px-2 short:py-0.5 short:text-[9px]">
              {beat.step}
            </span>
          ) : null}
        </div>
        <h1 className="font-display text-[1.2rem] font-bold leading-snug text-wn-primary short:text-[1.05rem] md:text-3xl md:short:text-xl">
          {beat.line}
        </h1>
        {beat.note ? (
          <p className="wn-caption-note mt-1 max-w-4xl text-[13px] leading-relaxed text-wn-ink/80 short:mt-0.5 short:text-[12px] md:mt-1.5 md:text-base">
            {beat.note}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}

function FullFrame({ src, alt, url }: { src: string; alt: string; url?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <motion.div
        className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-wn-line"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease }}
      >
        <BrowserChrome url={url} onExpand={() => setOpen(true)} />
        <button
          type="button"
          className="relative min-h-0 flex-1 cursor-zoom-in bg-wn-canvas"
          onClick={() => setOpen(true)}
        >
          <motion.img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain object-top"
            initial={{ scale: 1.04 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.1, ease }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '120%' }}
            transition={{ duration: 1.2, delay: 0.2, ease }}
          />
        </button>
      </motion.div>

      {open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-[200] flex items-center justify-center bg-wn-ink/80 p-4 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            >
              <button
                type="button"
                className="absolute right-5 top-5 rounded-full bg-wn-primary px-4 py-2 text-sm font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Close · Esc
              </button>
              <img
                src={src}
                alt={alt}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function BrowserChrome({
  url,
  onExpand,
}: {
  url?: string;
  onExpand?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-wn-line bg-wn-soft px-4 py-2.5">
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
      </div>
      <div className="flex-1 truncate rounded-full bg-white px-3 py-1 text-center text-[11px] font-medium text-wn-faint ring-1 ring-wn-line">
        {url ?? 'app.worknest.com'}
      </div>
      {onExpand ? (
        <button
          type="button"
          onClick={onExpand}
          className="rounded-full bg-wn-primary px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-wn-hover"
        >
          Expand
        </button>
      ) : null}
    </div>
  );
}
