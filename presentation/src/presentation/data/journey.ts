export type Perspective = 'client' | 'freelancer' | 'both' | 'system';

export type SpotlightFocus = {
  id: string;
  label: string;
  note: string;
  /** Detail / cropped shot (shown during result beat) */
  src: string;
  /** Region of interest on the full page, as % */
  focus: { x: number; y: number; w: number; h: number };
  /** Zoom factor into the focus region */
  scale?: number;
  /** The one action to highlight */
  action?: string;
  /** The animated outcome after the action */
  result?: string;
};

export type Beat = {
  id: string;
  perspective: Perspective;
  line: string;
  note?: string;
  src?: string;
  /** Extra images for collage / multi beats */
  gallery?: string[];
  url?: string;
  layout?:
    | 'cover'
    | 'hook'
    | 'problems'
    | 'screen'
    | 'dual'
    | 'radar'
    | 'match'
    | 'money'
    | 'spotlight'
    | 'arc'
    | 'closing';
  step?: string;
  /** Story chapter for the progress ribbon */
  chapter?: 'GAP' | 'FIND' | 'SPARK' | 'MEET' | 'MATCH' | 'FUND' | 'WORK' | 'PAY' | 'ARC';
  /** Line spoken during the cinematic handoff into this beat */
  handoff?: string;
  /** Labels for dual-pane screens */
  paneLabels?: [string, string];
  /** Optional second URL for dual layout */
  urlB?: string;
  /** Short problem labels for the problems layout */
  points?: string[];
  /** Dual-perspective problems (client ↔ freelancer) — legacy bridge copy */
  problems?: { theme: string; client: string; freelancer: string }[];
  /** Dual problem checklists for the problems layout */
  checklists?: {
    client: { name: string; role: string; avatar: string; items: string[] };
    freelancer: { name: string; role: string; avatar: string; items: string[] };
  };
  /** Money movement phase for the escrow line animation */
  moneyPhase?: 'deposit' | 'release';
  /** Zoom/highlight tour regions for spotlight layout */
  spotlights?: SpotlightFocus[];
};

/** Real product screenshots provided for this presentation. */
export const SHOTS = {
  clientHq: '/screenshots/user-client-hq.png',
  clientJobs: '/screenshots/user-client-jobs.png',
  freelancerHq: '/screenshots/user-freelancer-hq.png',
  browse: '/screenshots/user-browse-jobs.png',
  proposals: '/screenshots/client-matching-proposals.png',
  profile: '/screenshots/client-freelancer-profile.png',
  clientInterviews: '/screenshots/client-interviews.png',
  interviews: '/screenshots/user-interviews.png',
  matchedA: '/screenshots/user-matched-a.png',
  matchedB: '/screenshots/user-matched-b.png',
  matchedC: '/screenshots/user-matched-c.png',
  payments: '/screenshots/client-payments.png',
  deposit: '/screenshots/client-deposit.png',
  workspace: '/screenshots/user-workspace.png',
  workspaceOverview: '/screenshots/workspace-spotlight-overview.png',
  workspaceTasks: '/screenshots/workspace-spotlight-tasks.png',
  workspaceFilters: '/screenshots/workspace-spotlight-filters.png',
  workspaceAttachments: '/screenshots/workspace-spotlight-attachments.png',
  workspaceComplete: '/screenshots/workspace-spotlight-complete.png',
  wallet: '/screenshots/user-wallet.png',
} as const;

export const ALL_SHOTS = Object.values(SHOTS);

export const STORY_CHAPTERS = ['FIND', 'SPARK', 'MEET', 'MATCH', 'FUND', 'WORK', 'PAY'] as const;

/** Kept for PaymentVault / legacy moment slides. */
export type MoneyState = 'none' | 'ask' | 'deposit' | 'secured' | 'working' | 'release' | 'paid';
export const PROJECT_AMOUNT = '$1,950';

/**
 * One project. Two people. One trusted path.
 * Sarah (client) needs an inventory dashboard.
 * Jack (freelancer) can build it.
 * WorkNest is the bridge between them.
 */
export const journey: Beat[] = [
  {
    id: 'cover',
    perspective: 'both',
    chapter: 'GAP',
    line: 'Talent exists. Opportunities exist.',
    note: 'What’s missing is a trusted way to find each other — and work together. WorkNest builds the bridge.',
    handoff: 'This is the gap every freelance market feels…',
    layout: 'hook',
    gallery: [SHOTS.clientHq, SHOTS.freelancerHq, SHOTS.workspace],
  },
  {
    id: 'problems',
    perspective: 'both',
    chapter: 'GAP',
    step: 'THE GAP',
    line: 'Both sides carry a silent checklist.',
    note: 'Until those boxes clear, trust never starts — and good work never begins.',
    handoff: 'Before the bridge — the problems everyone already knows.',
    layout: 'problems',
    gallery: [SHOTS.freelancerHq, SHOTS.clientHq],
    checklists: {
      client: {
        name: 'Sarah',
        role: 'Client',
        avatar: '/avatars/client.jpg',
        items: [
          'Will they actually deliver?',
          'How do I find someone who fits?',
          'Where does my money go while they work?',
          'Can I see real progress — not just promises?',
        ],
      },
      freelancer: {
        name: 'Jack',
        role: 'Freelancer',
        avatar: '/avatars/freelancer.jpg',
        items: [
          'Will I get paid when I’m done?',
          'Which jobs are real — not endless noise?',
          'Will the scope change after I start?',
          'Will the client disappear mid-project?',
        ],
      },
    },
  },
  {
    id: 'client-hq',
    perspective: 'client',
    chapter: 'FIND',
    step: '01 · SARAH NEEDS HELP',
    line: 'Sarah opens her hiring HQ.',
    note: 'She needs a full-stack inventory dashboard — and a place to run the hire.',
    handoff: 'Meet Sarah. She has a project that can’t wait.',
    src: SHOTS.clientHq,
    gallery: [SHOTS.clientHq, SHOTS.clientJobs],
    paneLabels: ['Her dashboard', 'Her jobs'],
    url: 'app.worknest.com/client/dashboard',
    urlB: 'app.worknest.com/client/jobs',
    layout: 'dual',
  },
  {
    id: 'freelancer-hq',
    perspective: 'freelancer',
    chapter: 'FIND',
    step: '02 · JACK IS LOOKING',
    line: 'Jack opens his freelance HQ.',
    note: 'Same platform. Opposite seat. He’s scanning for the right project.',
    handoff: 'Across the bridge — Jack is ready to work.',
    src: SHOTS.freelancerHq,
    gallery: [SHOTS.freelancerHq, SHOTS.browse],
    paneLabels: ['His dashboard', 'Open jobs'],
    url: 'app.worknest.com/freelancer/dashboard',
    urlB: 'app.worknest.com/freelancer/jobs',
    layout: 'dual',
  },
  {
    id: 'smart-match',
    perspective: 'both',
    chapter: 'SPARK',
    step: '03 · SMART MATCHING',
    line: 'Smart matching finds the good fits.',
    note: 'WorkNest suggests jobs for Jack and freelancers for Sarah. People still choose — nothing starts automatically.',
    handoff: 'Next: smart matching — helpful suggestions, not auto-hire.',
    src: SHOTS.browse,
    gallery: [SHOTS.browse, SHOTS.proposals],
    layout: 'radar',
    points: [
      'It checks skills on both sides',
      'Jack gets job ideas that fit him',
      'Sarah gets people who fit the job',
      'No hire happens until someone clicks Accept',
    ],
  },
  {
    id: 'profile',
    perspective: 'client',
    chapter: 'MEET',
    step: '04 · SARAH CHECKS JACK',
    line: 'She looks past the bid.',
    note: 'Sarah opens Jack’s profile — skills, portfolio, proof — before she books time.',
    handoff: 'A bid is only a start. Now she gets to know Jack.',
    src: SHOTS.profile,
    gallery: [SHOTS.proposals, SHOTS.profile],
    paneLabels: ['Proposals inbox', 'Jack’s profile'],
    url: 'app.worknest.com/client/proposals',
    urlB: 'app.worknest.com/client/freelancers',
    layout: 'dual',
  },
  {
    id: 'interviews',
    perspective: 'both',
    chapter: 'MEET',
    step: '05 · THEY MEET',
    line: 'Same interview. Two calendars.',
    note: 'Sarah schedules. Jack confirms. Trust starts with a real conversation.',
    handoff: 'They don’t chat in the dark — they meet on the calendar.',
    src: SHOTS.clientInterviews,
    gallery: [SHOTS.clientInterviews, SHOTS.interviews],
    paneLabels: ['Sarah’s calendar', 'Jack’s calendar'],
    url: 'app.worknest.com/client/interviews',
    urlB: 'app.worknest.com/freelancer/interviews',
    layout: 'dual',
  },
  {
    id: 'matched',
    perspective: 'both',
    chapter: 'MATCH',
    step: '06 · SARAH CHOOSES JACK',
    line: 'Accepted. Matched. Connected.',
    note: 'The hire is real — because Sarah said yes. Smart matching never skipped that step.',
    handoff: 'The interview worked. Sarah hits Accept.',
    src: SHOTS.matchedB,
    gallery: [SHOTS.matchedB],
    url: 'app.worknest.com/freelancer/proposals',
    layout: 'match',
  },
  {
    id: 'deposit',
    perspective: 'client',
    chapter: 'FUND',
    step: '07 · SARAH FUNDS THE WORK',
    line: 'She deposits the full amount.',
    note: `${PROJECT_AMOUNT} moves Sarah → WorkNest and stays locked until delivery.`,
    handoff: 'Before Jack builds — Sarah locks the budget in escrow.',
    src: SHOTS.deposit,
    gallery: [SHOTS.payments, SHOTS.deposit],
    url: 'app.worknest.com/client/payments',
    layout: 'money',
    moneyPhase: 'deposit',
  },
  {
    id: 'workspace',
    perspective: 'both',
    chapter: 'WORK',
    step: '08 · THEY BUILD TOGETHER',
    line: 'One board. Two seats. Live progress.',
    note: 'Jack moves tasks. Sarah sees status, files, and completion — same truth.',
    handoff: 'Funds are safe. Now the work begins — in one shared nest.',
    src: SHOTS.workspaceOverview,
    gallery: [
      SHOTS.workspaceOverview,
      SHOTS.workspaceTasks,
      SHOTS.workspaceFilters,
      SHOTS.workspaceAttachments,
      SHOTS.workspaceComplete,
    ],
    url: 'app.worknest.com/workspace',
    layout: 'spotlight',
    spotlights: [
      {
        id: 'overview',
        label: 'Home',
        note: 'Sarah and Jack land in the same project home.',
        src: SHOTS.workspaceOverview,
        // WORKSPACE hero + title (verified on 1600×1000)
        focus: { x: 2, y: 6, w: 96, h: 32 },
        scale: 1.12,
        action: 'Open the shared workspace',
        result: 'One source of truth for the whole project',
      },
      {
        id: 'tasks',
        label: 'Board',
        note: 'Todo → In progress → In review → Done.',
        src: SHOTS.workspaceTasks,
        // Kanban columns only (verified)
        focus: { x: 0.5, y: 34, w: 85, h: 64 },
        scale: 1.08,
        action: 'Jack moves a task across the board',
        result: 'Sarah sees the status change live',
      },
      {
        id: 'filters',
        label: 'Focus',
        note: 'Cut through noise when the board gets busy.',
        src: SHOTS.workspaceFilters,
        // SHOW / PRIORITY / SORT / ORDER row (verified)
        focus: { x: 1, y: 36, w: 82, h: 22 },
        scale: 1.2,
        action: 'Filter by priority or sort',
        result: 'Only the work that matters right now',
      },
      {
        id: 'attachments',
        label: 'Files',
        note: 'Deliverables stay on the task — not lost in chat.',
        src: SHOTS.workspaceAttachments,
        // Task deliverables panel (verified)
        focus: { x: 48, y: 32, w: 50, h: 64 },
        scale: 1.12,
        action: 'Attach a deliverable to a task',
        result: 'Proof of work lives with the work',
      },
      {
        id: 'complete',
        label: 'Handoff',
        note: 'When every task is done, Complete unlocks payment.',
        src: SHOTS.workspaceComplete,
        // ACTIVE + Complete project bar (verified at y≈34)
        focus: { x: 2, y: 24, w: 78, h: 22 },
        scale: 1.22,
        action: 'Mark the project complete',
        result: 'Handoff ready — Sarah can approve and release',
      },
    ],
  },
  {
    id: 'wallet',
    perspective: 'freelancer',
    chapter: 'PAY',
    step: '09 · JACK GETS PAID',
    line: 'Escrow unlocks. Jack is paid.',
    note: `After Sarah approves, ${PROJECT_AMOUNT} moves WorkNest → Jack.`,
    handoff: 'Delivery accepted. The vault opens.',
    src: SHOTS.wallet,
    url: 'app.worknest.com/freelancer/wallet',
    layout: 'money',
    moneyPhase: 'release',
  },
  {
    id: 'arc',
    perspective: 'system',
    chapter: 'ARC',
    line: 'Their story, in three posters.',
    note: 'Click a poster to look closer — Find, Choose, Deliver.',
    handoff: 'Here’s the whole story at a glance.',
    layout: 'arc',
    gallery: [
      SHOTS.browse,
      SHOTS.clientInterviews,
      SHOTS.workspace,
    ],
  },
  {
    id: 'end',
    perspective: 'system',
    chapter: 'ARC',
    line: 'Built on clear technical choices.',
    note: 'Sarah approved. Jack got paid. Trust held — because the platform was designed for it.',
    handoff: 'That’s the bridge.',
    layout: 'closing',
    gallery: [SHOTS.workspace, SHOTS.wallet],
  },
];

/** Closing slide — plain-language technical decisions for a mixed audience. */
export const closingDecisions = [
  {
    title: 'Security by design',
    line: 'Protected sign-in, encrypted credentials, and role-based access so each person only reaches what they should.',
  },
  {
    title: 'Trusted payments',
    line: 'Project funds stay held in escrow with a modern payment partner — released only after delivery is approved.',
  },
  {
    title: 'Modern web stack',
    line: 'A typed React experience and a structured API, built for speed, reliability, and growth.',
  },
  {
    title: 'Live collaboration',
    line: 'Shared workspace updates arrive in real time, so client and freelancer always see the same truth.',
  },
  {
    title: 'Validated & modular',
    line: 'Inputs are checked before they enter the system, and features live in clear modules that stay easy to extend.',
  },
  {
    title: 'Smart matching, human choice',
    line: 'Suggestions surface strong fits — people still decide who to hire, and nothing starts automatically.',
  },
] as const;

export const journeySteps = [
  'CLIENT',
  'POST',
  'DISCOVER',
  'APPLY',
  'MATCH',
  'MEET',
  'WORK',
  'PAY',
] as const;
