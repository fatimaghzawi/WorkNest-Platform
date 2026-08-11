/** Opening cover — cinematic near-miss → keystone. */
export const WN = {
  purple: '#49225B',
  purpleSoft: '#A56ABD',
  orange: '#F97316',
  teal: '#14B8A6',
  /** Positive / secure — same as teal for WorkNest consistency */
  green: '#14B8A6',
  ink: '#1A1224',
  muted: '#5B5268',
  soft: '#8B8298',
  line: '#E8E0F0',
  bg: '#F3ECF8',
  surface: '#FFFFFF',
} as const;

export const INTRO_ASSETS = {
  logo: '/logo-clear.png',
  clientAvatar: '/avatars/client.jpg',
  freelancerAvatar: '/avatars/freelancer.jpg',
  clientDash: '/screenshots/user-client-hq.png',
  freelancerDash: '/screenshots/user-freelancer-hq.png',
  jobs: '/screenshots/user-client-jobs.png',
  browse: '/screenshots/user-browse-jobs.png',
  proposals: '/screenshots/user-matched-b.png',
  wallet: '/screenshots/user-wallet.png',
  payments: '/screenshots/client-payments.png',
  workspace: '/screenshots/user-workspace.png',
} as const;

export const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * ~18s — one clear cinematic idea:
 * They almost meet. The gap reveals what’s missing.
 * WorkNest becomes the keystone. They connect.
 */
export const T = {
  enter: 0,
  reach: 2_800,
  gapFocus: 5_200,
  ghosts: 6_400,
  keystone: 11_200,
  connect: 13_800,
  resolve: 15_800,
  hold: 18_200,
  end: 19_500,
} as const;

export const GHOSTS = [
  { id: 'trust', label: 'Trust', color: WN.purple, x: -72, y: -56 },
  { id: 'reqs', label: 'Clear requirements', color: WN.orange, x: 68, y: -48 },
  { id: 'collab', label: 'Organized collaboration', color: WN.teal, x: -64, y: 52 },
  { id: 'pay', label: 'Secure payment', color: WN.teal, x: 74, y: 46 },
] as const;
