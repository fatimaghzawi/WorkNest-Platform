import api from './axios';
import type { ApiSuccessResponse } from '../types/api';

export interface DashboardOverview {
  users: {
    total: number;
    active: number;
    clients: number;
    freelancers: number;
    growthPct: number;
    thisMonth: number;
  };
  jobs: {
    total: number;
    open: number;
    inProgress: number;
    closed: number;
    growthPct: number;
    thisMonth: number;
  };
  proposals: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
    thisMonth: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    avgProgress: number;
    completionRate: number;
    thisMonth: number;
  };
  interviews: {
    total: number;
    upcoming: number;
  };
  financial: {
    totalBudget: number;
    openBudget: number;
    inProgressBudget: number;
    closedBudget: number;
  };
  categories: number;
  period: string;
}

export interface DashboardChartPoint {
  label: string;
  year: number;
  month: number;
  jobs: number;
  budget: number;
  proposals: number;
}

export interface DashboardChart {
  period: string;
  points: DashboardChartPoint[];
}

export interface DashboardCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage: string;
  createdAt?: string;
  isActive: boolean;
}

export interface DashboardRecentJob {
  id: string;
  title: string;
  status: string;
  budget: number;
  clientName: string;
  createdAt?: string;
}

export interface AdminDashboardPayload {
  overview: DashboardOverview;
  chart: DashboardChart;
  recentJobs: DashboardRecentJob[];
}

export interface PlatformReportPayload {
  overview: DashboardOverview;
  chart: DashboardChart;
  recentJobs: DashboardRecentJob[];
  customers: DashboardCustomer[];
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface RoleCount {
  role: string;
  count: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  budget: number;
}

export interface SkillStat {
  skill: string;
  count: number;
}

export interface StatisticsTimelinePoint extends DashboardChartPoint {
  signups: number;
  monthLabel: string;
}

export interface PlatformStatisticsPayload {
  overview: DashboardOverview;
  period: string;
  timeline: StatisticsTimelinePoint[];
  distributions: {
    jobs: StatusCount[];
    proposals: StatusCount[];
    projects: StatusCount[];
    interviews: StatusCount[];
    users: RoleCount[];
  };
  jobsByCategory: CategoryStat[];
  topSkills: SkillStat[];
}

export interface ClientDashboardOverview {
  jobs: {
    total: number;
    open: number;
    inProgress: number;
    closed: number;
    growthPct: number;
    thisMonth: number;
  };
  proposals: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
    thisMonth: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    avgProgress: number;
    completionRate: number;
  };
  interviews: {
    total: number;
    upcoming: number;
  };
  financial: {
    totalBudget: number;
    openBudget: number;
    inProgressBudget: number;
    closedBudget: number;
  };
  period: string;
}

export interface ClientDashboardRecentJob {
  id: string;
  title: string;
  status: string;
  budget: number;
  proposalCount: number;
  createdAt?: string;
}

export interface ClientDashboardPayload {
  overview: ClientDashboardOverview;
  chart: DashboardChart;
  recentJobs: ClientDashboardRecentJob[];
  distributions: {
    jobs: StatusCount[];
    proposals: StatusCount[];
  };
}

export interface FreelancerDashboardOverview {
  proposals: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
    growthPct: number;
    thisMonth: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    avgProgress: number;
    completionRate: number;
  };
  interviews: {
    total: number;
    upcoming: number;
  };
  financial: {
    totalProposed: number;
    pendingValue: number;
    activeEarnings: number;
    completedEarnings: number;
  };
  period: string;
}

export interface FreelancerDashboardPayload {
  overview: FreelancerDashboardOverview;
  chart: DashboardChart;
  distributions: {
    proposals: StatusCount[];
    projects: StatusCount[];
  };
}

export const dashboardApi = {
  getAdminDashboard: () =>
    api.get<ApiSuccessResponse<AdminDashboardPayload>>('/api/v1/dashboard'),

  getClientDashboard: () =>
    api.get<ApiSuccessResponse<ClientDashboardPayload>>('/api/v1/dashboard/client'),

  getFreelancerDashboard: () =>
    api.get<ApiSuccessResponse<FreelancerDashboardPayload>>('/api/v1/dashboard/freelancer'),

  getOverview: () =>
    api.get<ApiSuccessResponse<DashboardOverview>>('/api/v1/dashboard/stats'),

  getAnalyticsChart: (params?: { months?: number }) =>
    api.get<ApiSuccessResponse<DashboardChart>>('/api/v1/dashboard/analytics/chart', {
      params,
    }),

  getLatestCustomers: (params?: { limit?: number }) =>
    api.get<ApiSuccessResponse<DashboardCustomer[]>>('/api/v1/dashboard/customers/latest', {
      params,
    }),

  getRecentJobs: (params?: { limit?: number }) =>
    api.get<ApiSuccessResponse<DashboardRecentJob[]>>('/api/v1/dashboard/jobs/recent', {
      params,
    }),

  getStatistics: (params?: { months?: number }) =>
    api.get<ApiSuccessResponse<PlatformStatisticsPayload>>('/api/v1/dashboard/statistics', {
      params,
    }),

  getPlatformReport: async (): Promise<PlatformReportPayload> => {
    const [overviewRes, chartRes, jobsRes, customersRes] = await Promise.all([
      api.get<ApiSuccessResponse<DashboardOverview>>('/api/v1/dashboard/stats'),
      api.get<ApiSuccessResponse<DashboardChart>>('/api/v1/dashboard/analytics/chart', {
        params: { months: 12 },
      }),
      api.get<ApiSuccessResponse<DashboardRecentJob[]>>('/api/v1/dashboard/jobs/recent', {
        params: { limit: 10 },
      }),
      api.get<ApiSuccessResponse<DashboardCustomer[]>>('/api/v1/dashboard/customers/latest', {
        params: { limit: 10 },
      }),
    ]);

    return {
      overview: overviewRes.data.data,
      chart: chartRes.data.data,
      recentJobs: jobsRes.data.data,
      customers: customersRes.data.data,
    };
  },
};
