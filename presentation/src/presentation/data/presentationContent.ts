export type Perspective = 'client' | 'freelancer' | 'both' | 'system';

export const LIVE_APP_URL =
  (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_APP_URL ||
  'https://work-nest-platform-nu.vercel.app';

export const SCENE_IDS = [
  'hook',
  'problem',
  'product',
  'client',
  'freelancer',
  'decision',
  'trust',
  'workspace',
  'architecture',
  'closing',
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

export const scenesMeta: { id: SceneId; label: string }[] = [
  { id: 'hook', label: 'The Hook' },
  { id: 'problem', label: 'The Problem' },
  { id: 'product', label: 'Meet WorkNest' },
  { id: 'client', label: 'Client Story' },
  { id: 'freelancer', label: 'Freelancer Story' },
  { id: 'decision', label: 'The Decision' },
  { id: 'trust', label: 'Trust Moment' },
  { id: 'workspace', label: 'The Journey' },
  { id: 'architecture', label: 'Underneath' },
  { id: 'closing', label: 'Closing' },
];

/** Screenshot-led hire → pay story (advance with → inside this scene). */
export const journeyShots = [
  {
    id: 'post',
    role: 'client' as const,
    title: 'Client posts the project',
    line: 'One clear brief. Budget. Requirements. Published.',
    src: '/screenshots/client-create-job.png',
    badge: 'CLIENT VIEW',
  },
  {
    id: 'browse',
    role: 'freelancer' as const,
    title: 'Freelancer finds the opportunity',
    line: 'Open jobs, real requirements — decide if you’re the right fit.',
    src: '/screenshots/freelancer-jobs.png',
    badge: 'FREELANCER VIEW',
  },
  {
    id: 'propose',
    role: 'freelancer' as const,
    title: 'A serious proposal',
    line: 'Price, plan, and proof — not a vague “I can do it.”',
    src: '/screenshots/freelancer-proposals.png',
    badge: 'FREELANCER VIEW',
  },
  {
    id: 'review',
    role: 'client' as const,
    title: 'Client reviews who to trust',
    line: 'Compare proposals. Check the person. Choose carefully.',
    src: '/screenshots/client-jobs.png',
    badge: 'CLIENT VIEW',
  },
  {
    id: 'deposit',
    role: 'client' as const,
    title: 'Accept → deposit the full amount',
    line: 'Money is secured in WorkNest before work begins.',
    src: '/screenshots/client-payments.png',
    badge: 'CLIENT VIEW',
  },
  {
    id: 'project',
    role: 'both' as const,
    title: 'The project becomes real',
    line: 'Both sides see the same hire — protected and ready.',
    src: '/screenshots/client-projects.png',
    badge: 'SHARED',
  },
  {
    id: 'work',
    role: 'both' as const,
    title: 'They work in one place',
    line: 'Shared workspace. Visible progress. No parallel universes.',
    src: '/screenshots/client-workspace.png',
    badge: 'SHARED WORKSPACE',
  },
  {
    id: 'freelancer-work',
    role: 'freelancer' as const,
    title: 'Freelancer delivers in the open',
    line: 'Tasks and files land where the client can already see them.',
    src: '/screenshots/freelancer-workspace.png',
    badge: 'FREELANCER VIEW',
  },
  {
    id: 'done',
    role: 'client' as const,
    title: 'Client confirms completion',
    line: 'When the work is done, payment can be released.',
    src: '/screenshots/client-projects.png',
    badge: 'CLIENT VIEW',
  },
  {
    id: 'paid',
    role: 'freelancer' as const,
    title: 'Freelancer gets paid',
    line: 'Secured funds become earnings. The story ends clean.',
    src: '/screenshots/freelancer-wallet.png',
    badge: 'FREELANCER VIEW',
  },
] as const;

export const journey = [
  { key: 'find', title: 'Find', line: 'Who is the right person?' },
  { key: 'trust', title: 'Trust', line: 'Can I trust them with my project?' },
  { key: 'work', title: 'Work', line: 'How do we safely complete the project?' },
  { key: 'paid', title: 'Get Paid', line: 'How do we make sure the transaction is fair?' },
] as const;

export const productPillars = [
  {
    title: 'Find',
    line: 'Discover opportunities.',
    shot: '/screenshots/freelancer-jobs.png',
  },
  {
    title: 'Connect',
    line: 'Submit and review proposals.',
    shot: '/screenshots/client-jobs.png',
  },
  {
    title: 'Collaborate',
    line: 'Work together inside the platform.',
    shot: '/screenshots/client-workspace.png',
  },
  {
    title: 'Get Paid',
    line: 'Secure the transaction.',
    shot: '/screenshots/client-payments.png',
  },
] as const;

export const proposals = [
  {
    id: 'a',
    name: 'Maya Chen',
    title: 'Product Designer',
    bid: '$2,400',
    days: '18 days',
    rating: '4.9',
    note: 'Clean portfolio · SaaS dashboards',
    recommend: false,
  },
  {
    id: 'b',
    name: 'Noah Rivera',
    title: 'Frontend Engineer',
    bid: '$2,800',
    days: '21 days',
    rating: '5.0',
    note: 'Strong React work · clear plan',
    recommend: true,
  },
  {
    id: 'c',
    name: 'Sam Okonkwo',
    title: 'Full-stack Builder',
    bid: '$3,100',
    days: '14 days',
    rating: '4.7',
    note: 'Fast turnaround · broader scope',
    recommend: false,
  },
] as const;

export const paymentFlow = [
  { role: 'CLIENT', icon: 'deposit', title: 'Deposits the full project amount', detail: 'One secure deposit for the whole project' },
  { role: 'WORKNEST', icon: 'lock', title: 'Keeps the payment secured', detail: 'Funds stay protected while work happens' },
  { role: 'FREELANCER', icon: 'work', title: 'Works on the project', detail: 'Delivery happens inside the shared workspace' },
  { role: 'COMPLETED', icon: 'check', title: 'Project completed', detail: 'Client reviews and confirms the result' },
  { role: 'WORKNEST', icon: 'release', title: 'Releases the payment', detail: 'The freelancer gets paid' },
] as const;

export const architectureLayers = {
  people: ['Client', 'Freelancer', 'Admin'],
  platform: 'WorkNest Platform',
  modules: ['Auth', 'Jobs', 'Proposals', 'Projects', 'Payments', 'Communication'],
  data: 'Database',
  qualities: [
    { title: 'Security', line: 'Different users have different permissions.' },
    { title: 'Validation', line: 'Reliable information enters the system.' },
    { title: 'Architecture', line: 'Features are organized into clear modules.' },
    { title: 'Real-time', line: 'Important interactions can happen immediately.' },
  ],
} as const;
