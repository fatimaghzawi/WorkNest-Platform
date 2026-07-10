import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  DashboardChart,
  DashboardCustomer,
  DashboardOverview,
  DashboardRecentJob,
} from '../api/dashboard.api';

const BRAND = {
  primary: [73, 34, 91] as [number, number, number],
  secondary: [110, 52, 130] as [number, number, number],
  accent: [165, 106, 189] as [number, number, number],
  surface: [245, 235, 250] as [number, number, number],
  text: [45, 35, 55] as [number, number, number],
  muted: [110, 100, 120] as [number, number, number],
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export interface PlatformReportData {
  overview: DashboardOverview;
  chart: DashboardChart;
  recentJobs: DashboardRecentJob[];
  customers: DashboardCustomer[];
  generatedAt: Date;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatStatus = (status: string) =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const monthLabel = (year: number, month: number) => `${MONTHS[month - 1]} ${year}`;

const tableDefaults = {
  theme: 'striped' as const,
  styles: {
    fontSize: 9,
    cellPadding: 4,
    textColor: BRAND.text,
    lineColor: [230, 220, 238] as [number, number, number],
    lineWidth: 0.1,
  },
  headStyles: {
    fillColor: BRAND.primary,
    textColor: [255, 255, 255] as [number, number, number],
    fontStyle: 'bold' as const,
  },
  alternateRowStyles: {
    fillColor: BRAND.surface,
  },
  margin: { left: 14, right: 14 },
};

const drawHeader = (doc: jsPDF, title: string, subtitle: string) => {
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setFillColor(...BRAND.secondary);
  doc.circle(188, 12, 22, 'F');
  doc.setFillColor(...BRAND.accent);
  doc.circle(198, 24, 14, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('WorkNest', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Platform intelligence report', 14, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title, 14, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.muted);
  doc.text(subtitle, 14, 53);
};

const sectionTitle = (doc: jsPDF, y: number, title: string) => {
  doc.setFillColor(...BRAND.surface);
  doc.roundedRect(14, y, 182, 8, 2, 2, 'F');
  doc.setTextColor(...BRAND.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(title, 18, y + 5.5);
  return y + 14;
};

const addFooter = (doc: jsPDF) => {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...BRAND.accent);
    doc.setLineWidth(0.4);
    doc.line(14, 285, 196, 285);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text('WorkNest — Confidential platform report', 14, 290);
    doc.text(`Page ${i} of ${pages}`, 196, 290, { align: 'right' });
  }
};

export function generatePlatformReportPdf(data: PlatformReportData) {
  const { overview, chart, recentJobs, customers, generatedAt } = data;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  drawHeader(
    doc,
    'Executive summary',
    `Generated ${formatDate(generatedAt)} · Reporting period: ${overview.period}`
  );

  let y = 62;

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Metric', 'Value', 'Detail']],
    body: [
      ['Total users', String(overview.users.total), `${overview.users.active} active`],
      [
        'New users (month)',
        String(overview.users.thisMonth),
        `${overview.users.growthPct >= 0 ? '+' : ''}${overview.users.growthPct}% vs prior month`,
      ],
      ['Total jobs', String(overview.jobs.total), `${overview.jobs.open} open`],
      [
        'Job budget (platform)',
        formatCurrency(overview.financial.totalBudget),
        `${overview.jobs.inProgress} in progress`,
      ],
      [
        'Proposals',
        String(overview.proposals.total),
        `${overview.proposals.acceptanceRate}% acceptance rate`,
      ],
      [
        'Projects',
        String(overview.projects.total),
        `${overview.projects.completionRate}% completion rate`,
      ],
      ['Upcoming interviews', String(overview.interviews.upcoming), `${overview.categories} categories`],
    ],
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  y = sectionTitle(doc, y, 'Users & community');

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Segment', 'Count', 'Share']],
    body: [
      [
        'Clients',
        String(overview.users.clients),
        overview.users.total
          ? `${Math.round((overview.users.clients / overview.users.total) * 100)}%`
          : '—',
      ],
      [
        'Freelancers',
        String(overview.users.freelancers),
        overview.users.total
          ? `${Math.round((overview.users.freelancers / overview.users.total) * 100)}%`
          : '—',
      ],
      ['Active accounts', String(overview.users.active), 'Currently enabled'],
      ['Inactive accounts', String(overview.users.total - overview.users.active), 'Disabled or dormant'],
    ],
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  y = sectionTitle(doc, y, 'Jobs pipeline');

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Status', 'Jobs', 'Budget']],
    body: [
      ['Open', String(overview.jobs.open), formatCurrency(overview.financial.openBudget)],
      ['In progress', String(overview.jobs.inProgress), formatCurrency(overview.financial.inProgressBudget)],
      ['Closed', String(overview.jobs.closed), formatCurrency(overview.financial.closedBudget)],
      ['New this month', String(overview.jobs.thisMonth), `${overview.jobs.growthPct >= 0 ? '+' : ''}${overview.jobs.growthPct}% growth`],
    ],
  });

  doc.addPage();
  drawHeader(doc, 'Operations & finance', `Chart period: ${chart.period}`);

  y = 62;
  y = sectionTitle(doc, y, 'Proposals & projects');

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Area', 'Total', 'Breakdown']],
    body: [
      [
        'Proposals — pending',
        String(overview.proposals.pending),
        `${overview.proposals.thisMonth} submitted this month`,
      ],
      ['Proposals — accepted', String(overview.proposals.accepted), `${overview.proposals.acceptanceRate}% rate`],
      ['Proposals — rejected', String(overview.proposals.rejected), 'Declined submissions'],
      ['Projects — active', String(overview.projects.active), `${overview.projects.avgProgress}% avg progress`],
      ['Projects — completed', String(overview.projects.completed), `${overview.projects.completionRate}% completion`],
      ['Interviews scheduled', String(overview.interviews.upcoming), `${overview.interviews.total} total on record`],
    ],
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  y = sectionTitle(doc, y, 'Monthly activity');

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Month', 'Jobs posted', 'Proposals', 'Job budget']],
    body: chart.points.map((point) => [
      monthLabel(point.year, point.month),
      String(point.jobs),
      String(point.proposals),
      formatCurrency(point.budget),
    ]),
  });

  if (recentJobs.length > 0) {
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    if (y > 230) {
      doc.addPage();
      drawHeader(doc, 'Recent activity', `Generated ${formatDate(generatedAt)}`);
      y = 62;
    }

    y = sectionTitle(doc, y, 'Recent jobs');

    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Job', 'Client', 'Status', 'Budget', 'Posted']],
      body: recentJobs.map((job) => [
        job.title.length > 42 ? `${job.title.slice(0, 39)}...` : job.title,
        job.clientName,
        formatStatus(job.status),
        formatCurrency(job.budget),
        job.createdAt ? formatDate(job.createdAt) : '—',
      ]),
    });
  }

  if (customers.length > 0) {
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    if (y > 220) {
      doc.addPage();
      drawHeader(doc, 'Member snapshot', `Generated ${formatDate(generatedAt)}`);
      y = 62;
    }

    y = sectionTitle(doc, y, 'Latest members');

    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Name', 'Email', 'Role', 'Status', 'Joined']],
      body: customers.map((user) => [
        `${user.firstName} ${user.lastName}`.trim(),
        user.email.length > 34 ? `${user.email.slice(0, 31)}...` : user.email,
        formatStatus(user.role),
        user.isActive ? 'Active' : 'Inactive',
        user.createdAt ? formatDate(user.createdAt) : '—',
      ]),
    });
  }

  addFooter(doc);

  const stamp = generatedAt.toISOString().slice(0, 10);
  doc.save(`worknest-platform-report-${stamp}.pdf`);
}
