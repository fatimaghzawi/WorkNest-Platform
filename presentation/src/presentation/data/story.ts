export type MomentId =
  | 'hook'
  | 'client'
  | 'freelancer'
  | 'decision'
  | 'truth'
  | 'vault'
  | 'work'
  | 'completion'
  | 'release'
  | 'reveal'
  | 'engineering'
  | 'closing';

export const MOMENT_IDS: MomentId[] = [
  'hook',
  'client',
  'freelancer',
  'decision',
  'truth',
  'vault',
  'work',
  'completion',
  'release',
  'reveal',
  'engineering',
  'closing',
];

export const momentMeta: { id: MomentId; label: string }[] = [
  { id: 'hook', label: 'The Question' },
  { id: 'client', label: 'The Client' },
  { id: 'freelancer', label: 'Matching' },
  { id: 'decision', label: 'The Decision' },
  { id: 'truth', label: 'The Money' },
  { id: 'vault', label: 'The Vault' },
  { id: 'work', label: 'Workspace' },
  { id: 'completion', label: 'Completion' },
  { id: 'release', label: 'Release' },
  { id: 'reveal', label: 'The Reveal' },
  { id: 'engineering', label: 'Underneath' },
  { id: 'closing', label: 'WorkNest' },
];

/**
 * Prefer known-good authenticated captures.
 * Freelancer screens + create-job are verified real UI.
 * Client list pages that previously captured login are remapped.
 */
export const shots = {
  landing: '/screenshots/landing.png',
  createJob: '/screenshots/client-create-job.png',
  clientDash: '/screenshots/client-create-job.png', // real client chrome until dash recaptured
  clientJobs: '/screenshots/client-create-job.png',
  clientMatching: '/screenshots/freelancer-proposals.png',
  clientProjects: '/screenshots/freelancer-projects.png',
  clientPayments: '/screenshots/freelancer-wallet.png',
  clientKanban: '/screenshots/freelancer-kanban-board.png',
  clientWorkspace: '/screenshots/freelancer-workspace-overview.png',
  clientDeliverables: '/screenshots/freelancer-task-deliverables.png',
  clientProjectFiles: '/screenshots/freelancer-project-files.png',
  freelancerDash: '/screenshots/freelancer-dashboard.png',
  freelancerJobs: '/screenshots/freelancer-jobs.png',
  freelancerJobDetail: '/screenshots/freelancer-job-detail.png',
  freelancerProposals: '/screenshots/freelancer-proposals.png',
  freelancerProjects: '/screenshots/freelancer-projects.png',
  freelancerKanban: '/screenshots/freelancer-kanban.png',
  freelancerKanbanBoard: '/screenshots/freelancer-kanban-board.png',
  freelancerWorkspace: '/screenshots/freelancer-workspace-overview.png',
  freelancerDeliverables: '/screenshots/freelancer-task-deliverables.png',
  freelancerProjectFiles: '/screenshots/freelancer-project-files.png',
  freelancerTaskModal: '/screenshots/freelancer-task-modal.png',
  freelancerTaskAttachments: '/screenshots/freelancer-task-attachments.png',
  freelancerWallet: '/screenshots/freelancer-wallet.png',
  freelancerWalletDetail: '/screenshots/freelancer-wallet-detail.png',
} as const;

export const proposals = [
  {
    id: 'a',
    name: 'Maya Chen',
    role: 'Product Designer',
    bid: '$2,400',
    days: '18 days',
    rating: '4.9',
    blurb: 'Strong visual systems',
  },
  {
    id: 'b',
    name: 'Noah Rivera',
    role: 'Frontend Engineer',
    bid: '$2,800',
    days: '21 days',
    rating: '5.0',
    blurb: 'Clear plan · proven delivery',
  },
  {
    id: 'c',
    name: 'Sam Okonkwo',
    role: 'Full-stack Builder',
    bid: '$3,100',
    days: '14 days',
    rating: '4.7',
    blurb: 'Fast · broader scope',
  },
] as const;

export const PROJECT_AMOUNT = '$2,800';

/** Slim matching beats — no repeats */
export const matchingSteps = [
  {
    id: 'browse',
    badge: 'BROWSE',
    title: 'Find the opportunity',
    line: 'Open jobs matched to skills and budget.',
    src: shots.freelancerJobs,
    points: ['Real openings', 'Clear budgets', 'Filter to fit'],
  },
  {
    id: 'detail',
    badge: 'BRIEF',
    title: 'Read the brief once',
    line: 'Scope, timeline, expectations — before you propose.',
    src: shots.freelancerJobDetail,
    fallback: shots.freelancerJobs,
    points: ['Understand the ask', 'Decide if you fit', 'Propose with intent'],
  },
  {
    id: 'propose',
    badge: 'PROPOSAL',
    title: 'Send a serious proposal',
    line: 'Price, plan, proof — then wait for the match.',
    src: shots.freelancerProposals,
    points: ['Stand out clearly', 'Show your plan', 'Earn the trust'],
  },
] as const;

/** Workspace deep dive — unique steps only */
export const workspaceJourney = [
  {
    id: 'projects',
    badge: 'PROJECT',
    title: 'Hire becomes a project',
    line: 'After accept + deposit, both sides share one project home.',
    src: shots.freelancerProjects,
    points: ['Status visible', 'Same project ID', 'Ready to collaborate'],
  },
  {
    id: 'kanban',
    badge: 'KANBAN',
    title: 'The shared Kanban board',
    line: 'Todo → In progress → In review → Done. One board. Two people.',
    src: shots.freelancerKanbanBoard,
    points: ['Client structures work', 'Freelancer executes openly', 'No status-meeting theater'],
  },
  {
    id: 'task',
    badge: 'TASK',
    title: 'Open any card',
    line: 'Ownership, priority, and notes live on the task.',
    src: shots.freelancerTaskModal,
    points: ['Clear owners', 'Review-ready notes', 'Work stays structured'],
  },
  {
    id: 'attachments',
    badge: 'ATTACHMENTS',
    title: 'Files attach to the task',
    line: 'Deliverables sit on the Kanban card — not in a lost chat.',
    src: shots.freelancerTaskAttachments,
    fallback: shots.freelancerDeliverables,
    points: ['Upload where work happens', 'Client inspects instantly', 'Versions stay with the task'],
  },
  {
    id: 'deliverables',
    badge: 'LIBRARY',
    title: 'Task deliverables library',
    line: 'Every task file collected in one panel.',
    src: shots.freelancerDeliverables,
    points: ['Review without hunting', 'Tied to real tasks', 'Shared visibility'],
  },
  {
    id: 'project-files',
    badge: 'PROJECT FILES',
    title: 'Project-wide assets',
    line: 'Briefs, brand kits, references for the whole hire.',
    src: shots.freelancerProjectFiles,
    points: ['One source of truth', 'Assets stay with the project', 'Both sides aligned'],
  },
] as const;
