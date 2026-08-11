const fs = require('fs');
const path = 'src/presentation/components/JourneyExperience.tsx';
let s = fs.readFileSync(path, 'utf8');

const pairs = [
  [
    'className="mt-5 font-display text-4xl font-bold leading-tight text-white md:text-6xl"',
    'className="mt-5 font-display text-4xl font-bold leading-tight text-wn-primary md:text-6xl"',
  ],
  [
    'className="mt-2 font-display text-3xl font-bold tracking-tight text-white md:text-5xl"',
    'className="mt-2 font-display text-3xl font-bold tracking-tight text-wn-primary md:text-5xl"',
  ],
  [
    'className="font-display text-3xl font-bold text-white md:text-5xl"',
    'className="font-display text-3xl font-bold text-wn-primary md:text-5xl"',
  ],
  [
    'className="mt-6 font-display text-6xl font-extrabold tracking-tight text-white md:text-8xl"',
    'className="mt-6 font-display text-6xl font-extrabold tracking-tight text-wn-primary md:text-8xl"',
  ],
  [
    'className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-[2.1rem]"',
    'className="font-display text-2xl font-bold tracking-tight text-wn-ink md:text-3xl lg:text-[2.1rem]"',
  ],
  [
    'className="mt-5 text-center font-display text-base font-semibold text-white md:text-lg"',
    'className="mt-5 text-center font-display text-base font-semibold text-wn-ink md:text-lg"',
  ],
  [
    'radial-gradient(circle at 50% 42%, #1E0F2E 0%, #07030C 62%)',
    'radial-gradient(circle at 50% 40%, #FFFFFF 0%, #F6F1FB 55%, #EDE4F5 100%)',
  ],
  [
    'radial-gradient(ellipse at 14% 60%, #F9731630 0%, transparent 38%)',
    'radial-gradient(ellipse at 14% 60%, rgba(249,115,22,0.14) 0%, transparent 42%)',
  ],
  [
    'radial-gradient(ellipse at 86% 60%, #49225B40 0%, transparent 38%)',
    'radial-gradient(ellipse at 86% 60%, rgba(73,34,91,0.12) 0%, transparent 42%)',
  ],
  ['from-transparent via-white/15 to-transparent', 'from-transparent via-wn-accent/30 to-transparent'],
  [
    'text-[11px] font-bold tracking-[0.24em] text-[#A56ABD]',
    'text-[11px] font-bold tracking-[0.24em] text-wn-accent',
  ],
  [
    'className="mt-4 max-w-[160px] text-center text-[11px] leading-snug text-white/50"',
    'className="mt-4 max-w-[160px] text-center text-[11px] leading-snug text-wn-muted"',
  ],
  ['#22C55E', '#14B8A6'],
  ['#4ADE80', '#14B8A6'],
  ['#16A34A', '#14B8A6'],
  [
    'rounded-2xl border border-wn-line bg-white/[0.04] px-4 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm md:px-8 md:py-6',
    'rounded-2xl border border-wn-line bg-wn-surface px-4 py-5 shadow-card md:px-8 md:py-6',
  ],
  ['bg-[#F7F2FC]', 'bg-wn-soft'],
  ['border-black/5', 'border-wn-line'],
  ['bg-black/40 text-wn-faint', 'bg-wn-soft text-wn-faint'],
  [
    'className="absolute right-5 top-5 rounded-full bg-wn-canvas px-4 py-2 text-sm font-semibold text-white"',
    'className="absolute right-5 top-5 rounded-full bg-wn-primary px-4 py-2 text-sm font-semibold text-white"',
  ],
  [
    'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-3',
    'absolute inset-x-0 bottom-0 bg-gradient-to-t from-wn-primary/90 to-transparent px-3 py-3',
  ],
  [
    'bg-[#14B8A6] text-[#0A0410]',
    'bg-wn-teal text-white',
  ],
  ['bg-[#A56ABD] text-white', 'bg-wn-accent text-white'],
  ['text-[#0A0410]', 'text-wn-ink'],
  ['bg-black/25', 'bg-wn-line'],
  ['bg-black/90', 'bg-wn-ink/80'],
  ['bg-black/92', 'bg-wn-ink/85'],
];

let n = 0;
for (const [a, b] of pairs) {
  if (s.includes(a)) {
    s = s.split(a).join(b);
    n++;
  }
}

// Action card text on light surface during highlight should be ink
s = s.replace(
  /ACTION<\/p>\s*<p className="mt-1 font-display text-sm font-semibold text-white md:text-base">/,
  'ACTION</p>\n                    <p className="mt-1 font-display text-sm font-semibold text-wn-ink md:text-base">',
);

fs.writeFileSync(path, s);
console.log('applied', n, 'replacements');
