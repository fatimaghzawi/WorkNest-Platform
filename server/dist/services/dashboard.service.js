"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dashboardRepository = require('../repositories/dashboard.repository');
const paymentRepository = require('../repositories/payment.repository');
const pctChange = (current, previous) => {
    if (previous <= 0)
        return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
};
const getOverview = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const [totalUsers, activeUsers, clients, freelancers, totalJobs, openJobs, inProgressJobs, closedJobs, totalProposals, pendingProposals, acceptedProposals, rejectedProposals, totalProjects, activeProjects, completedProjects, totalInterviews, upcomingInterviews, categories, totalBudget, openBudget, inProgressBudget, avgProgress, usersThisMonth, usersPrevMonth, jobsThisMonth, jobsPrevMonth, proposalsThisMonth, projectsThisMonth, platformRevenue, platformRevenueThisMonth,] = await Promise.all([
        dashboardRepository.countUsers({}),
        dashboardRepository.countUsers({ isActive: true }),
        dashboardRepository.countUsers({ role: 'client' }),
        dashboardRepository.countUsers({ role: 'freelancer' }),
        dashboardRepository.countJobs({}),
        dashboardRepository.countJobs({ status: 'open' }),
        dashboardRepository.countJobs({ status: 'in_progress' }),
        dashboardRepository.countJobs({ status: 'closed' }),
        dashboardRepository.countProposals({}),
        dashboardRepository.countProposals({ status: 'pending' }),
        dashboardRepository.countProposals({ status: 'accepted' }),
        dashboardRepository.countProposals({ status: 'rejected' }),
        dashboardRepository.countProjects({}),
        dashboardRepository.countProjects({ status: 'active' }),
        dashboardRepository.countProjects({ status: 'completed' }),
        dashboardRepository.countInterviews({}),
        dashboardRepository.countInterviews({
            status: { $in: ['scheduled', 'confirmed'] },
            scheduledDate: { $gte: now },
        }),
        dashboardRepository.countCategories({}),
        dashboardRepository.sumJobBudgets({}),
        dashboardRepository.sumJobBudgets({ status: 'open' }),
        dashboardRepository.sumJobBudgets({ status: 'in_progress' }),
        dashboardRepository.averageProjectProgress({ status: 'active' }),
        dashboardRepository.countUsers({ createdAt: { $gte: startOfMonth } }),
        dashboardRepository.countUsers({
            createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        }),
        dashboardRepository.countJobs({ createdAt: { $gte: startOfMonth } }),
        dashboardRepository.countJobs({
            createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        }),
        dashboardRepository.countProposals({ createdAt: { $gte: startOfMonth } }),
        dashboardRepository.countProjects({ createdAt: { $gte: startOfMonth } }),
        paymentRepository.sumPlatformFees('released'),
        paymentRepository.sumPlatformFees('released', startOfMonth),
    ]);
    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    const acceptanceRate = totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;
    return {
        users: {
            total: totalUsers,
            active: activeUsers,
            clients,
            freelancers,
            growthPct: pctChange(usersThisMonth, usersPrevMonth),
            thisMonth: usersThisMonth,
        },
        jobs: {
            total: totalJobs,
            open: openJobs,
            inProgress: inProgressJobs,
            closed: closedJobs,
            growthPct: pctChange(jobsThisMonth, jobsPrevMonth),
            thisMonth: jobsThisMonth,
        },
        proposals: {
            total: totalProposals,
            pending: pendingProposals,
            accepted: acceptedProposals,
            rejected: rejectedProposals,
            acceptanceRate,
            thisMonth: proposalsThisMonth,
        },
        projects: {
            total: totalProjects,
            active: activeProjects,
            completed: completedProjects,
            avgProgress,
            completionRate,
            thisMonth: projectsThisMonth,
        },
        interviews: {
            total: totalInterviews,
            upcoming: upcomingInterviews,
        },
        financial: {
            totalBudget,
            openBudget,
            inProgressBudget,
            closedBudget: Math.max(totalBudget - openBudget - inProgressBudget, 0),
            platformRevenue,
            platformRevenueThisMonth,
        },
        categories,
        period: '1 Month',
    };
};
const getAnalyticsChart = async (query = {}) => {
    const months = Math.min(Math.max(Number(query.months) || 12, 3), 24);
    const points = await dashboardRepository.monthlyJobActivity(months - 1);
    return {
        period: `${months} Months`,
        points,
    };
};
const getLatestCustomers = async (query = {}) => {
    const limit = Math.min(Math.max(Number(query.limit) || 6, 1), 20);
    const users = await dashboardRepository.latestUsers(limit);
    return users;
};
const getRecentJobs = async (query = {}) => {
    const limit = Math.min(Math.max(Number(query.limit) || 5, 1), 20);
    return dashboardRepository.recentJobs(limit);
};
const getAdminDashboard = async () => {
    const [overview, chart, recentJobs] = await Promise.all([
        getOverview(),
        getAnalyticsChart({ months: 12 }),
        getRecentJobs({ limit: 5 }),
    ]);
    return {
        overview,
        chart,
        recentJobs,
    };
};
const getStatistics = async (query = {}) => {
    const months = Math.min(Math.max(Number(query.months) || 12, 3), 24);
    const [overview, activity, signups, jobsByCategory, topSkills, jobStatus, proposalStatus, projectStatus, interviewStatus, userRoles,] = await Promise.all([
        getOverview(),
        getAnalyticsChart({ months }),
        dashboardRepository.monthlyUserSignups(months - 1),
        dashboardRepository.jobsByCategory(8),
        dashboardRepository.topJobSkills(8),
        dashboardRepository.countByStatus(require('../models/Job').default, [
            'open',
            'in_progress',
            'closed',
        ]),
        dashboardRepository.countByStatus(require('../models/Proposal').default, [
            'pending',
            'accepted',
            'rejected',
        ]),
        dashboardRepository.countByStatus(require('../models/Project').default, [
            'active',
            'completed',
            'cancelled',
        ]),
        dashboardRepository.countByStatus(require('../models/Interview').default, [
            'scheduled',
            'confirmed',
            'completed',
            'cancelled',
            'declined',
        ]),
        dashboardRepository.countUsersByRole(),
    ]);
    const signupMap = new Map(signups.map((point) => [`${point.year}-${point.month}`, point.signups]));
    const timeline = activity.points.map((point) => ({
        ...point,
        signups: signupMap.get(`${point.year}-${point.month}`) || 0,
        monthLabel: `${point.label}/${String(point.year).slice(-2)}`,
    }));
    return {
        overview,
        period: `${months} Months`,
        timeline,
        distributions: {
            jobs: jobStatus,
            proposals: proposalStatus,
            projects: projectStatus,
            interviews: interviewStatus,
            users: userRoles,
        },
        jobsByCategory,
        topSkills,
    };
};
const getClientDashboard = async (clientId) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const jobFilter = { clientId };
    const projectFilter = { clientId };
    const interviewFilter = { clientId };
    const [jobPipeline, totalProposals, pendingProposals, acceptedProposals, rejectedProposals, totalProjects, activeProjects, pendingReviewProjects, completedProjects, totalInterviews, upcomingInterviews, avgProgress, jobsThisMonth, jobsPrevMonth, proposalsThisMonth, chartPoints, recentJobs, proposalStatus,] = await Promise.all([
        dashboardRepository.clientJobPipelineStats(clientId),
        dashboardRepository.countProposalsForClient(clientId, {}),
        dashboardRepository.countProposalsForClient(clientId, { status: 'pending' }),
        dashboardRepository.countProposalsForClient(clientId, { status: 'accepted' }),
        dashboardRepository.countProposalsForClient(clientId, { status: 'rejected' }),
        dashboardRepository.countProjects(projectFilter),
        dashboardRepository.countProjects({ ...projectFilter, status: 'active' }),
        dashboardRepository.countProjects({ ...projectFilter, status: 'pending_review' }),
        dashboardRepository.countProjects({ ...projectFilter, status: 'completed' }),
        dashboardRepository.countInterviews(interviewFilter),
        dashboardRepository.countInterviews({
            ...interviewFilter,
            status: { $in: ['scheduled', 'confirmed'] },
            scheduledDate: { $gte: now },
        }),
        dashboardRepository.averageProjectProgress({
            ...projectFilter,
            status: { $in: ['active', 'pending_review'] },
        }),
        dashboardRepository.countJobs({ ...jobFilter, createdAt: { $gte: startOfMonth } }),
        dashboardRepository.countJobs({
            ...jobFilter,
            createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        }),
        dashboardRepository.countProposalsForClient(clientId, { createdAt: { $gte: startOfMonth } }),
        dashboardRepository.monthlyClientActivity(clientId, 11),
        dashboardRepository.clientRecentJobs(clientId, 5),
        dashboardRepository.countClientProposalsByStatus(clientId, ['pending', 'accepted', 'rejected']),
    ]);
    const totalJobs = jobPipeline.counts.total;
    const openJobs = jobPipeline.counts.open;
    const inProgressJobs = jobPipeline.counts.inProgress;
    const closedJobs = jobPipeline.counts.closed;
    const totalBudget = jobPipeline.budgets.total;
    const openBudget = jobPipeline.budgets.open;
    const inProgressBudget = jobPipeline.budgets.inProgress;
    const jobStatus = jobPipeline.statusDistribution;
    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    const acceptanceRate = totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;
    return {
        overview: {
            jobs: {
                total: totalJobs,
                open: openJobs,
                inProgress: inProgressJobs,
                closed: closedJobs,
                growthPct: pctChange(jobsThisMonth, jobsPrevMonth),
                thisMonth: jobsThisMonth,
            },
            proposals: {
                total: totalProposals,
                pending: pendingProposals,
                accepted: acceptedProposals,
                rejected: rejectedProposals,
                acceptanceRate,
                thisMonth: proposalsThisMonth,
            },
            projects: {
                total: totalProjects,
                active: activeProjects + pendingReviewProjects,
                completed: completedProjects,
                avgProgress,
                completionRate,
            },
            interviews: {
                total: totalInterviews,
                upcoming: upcomingInterviews,
            },
            financial: {
                totalBudget,
                openBudget,
                inProgressBudget,
                closedBudget: jobPipeline.budgets.closed,
            },
            period: '1 Month',
        },
        chart: {
            period: '12 Months',
            points: chartPoints,
        },
        recentJobs,
        distributions: {
            jobs: jobStatus,
            proposals: proposalStatus,
        },
    };
};
const getFreelancerDashboard = async (freelancerId) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const proposalFilter = { freelancerId };
    const projectFilter = { freelancerId };
    const interviewFilter = { freelancerId };
    const [totalProposals, pendingProposals, acceptedProposals, rejectedProposals, totalProjects, activeProjects, completedProjects, totalInterviews, upcomingInterviews, totalProposed, pendingValue, activeEarnings, completedEarnings, avgProgress, proposalsThisMonth, proposalsPrevMonth, chartPoints, proposalStatus, projectStatus,] = await Promise.all([
        dashboardRepository.countProposals(proposalFilter),
        dashboardRepository.countProposals({ ...proposalFilter, status: 'pending' }),
        dashboardRepository.countProposals({ ...proposalFilter, status: 'accepted' }),
        dashboardRepository.countProposals({ ...proposalFilter, status: 'rejected' }),
        dashboardRepository.countProjects(projectFilter),
        dashboardRepository.countProjects({ ...projectFilter, status: 'active' }),
        dashboardRepository.countProjects({ ...projectFilter, status: 'completed' }),
        dashboardRepository.countInterviews(interviewFilter),
        dashboardRepository.countInterviews({
            ...interviewFilter,
            status: { $in: ['scheduled', 'confirmed'] },
            scheduledDate: { $gte: now },
        }),
        dashboardRepository.sumFreelancerProposalPrices(freelancerId, {}),
        dashboardRepository.sumFreelancerProposalPrices(freelancerId, { status: 'pending' }),
        dashboardRepository.sumFreelancerAcceptedEarnings(freelancerId, 'active'),
        dashboardRepository.sumFreelancerAcceptedEarnings(freelancerId, 'completed'),
        dashboardRepository.averageProjectProgress({ ...projectFilter, status: 'active' }),
        dashboardRepository.countProposals({ ...proposalFilter, createdAt: { $gte: startOfMonth } }),
        dashboardRepository.countProposals({
            ...proposalFilter,
            createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        }),
        dashboardRepository.monthlyFreelancerActivity(freelancerId, 11),
        dashboardRepository.countFreelancerProposalsByStatus(freelancerId, [
            'pending',
            'accepted',
            'rejected',
        ]),
        dashboardRepository.countFreelancerProjectsByStatus(freelancerId, [
            'active',
            'completed',
            'cancelled',
        ]),
    ]);
    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    const acceptanceRate = totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;
    return {
        overview: {
            proposals: {
                total: totalProposals,
                pending: pendingProposals,
                accepted: acceptedProposals,
                rejected: rejectedProposals,
                acceptanceRate,
                growthPct: pctChange(proposalsThisMonth, proposalsPrevMonth),
                thisMonth: proposalsThisMonth,
            },
            projects: {
                total: totalProjects,
                active: activeProjects,
                completed: completedProjects,
                avgProgress,
                completionRate,
            },
            interviews: {
                total: totalInterviews,
                upcoming: upcomingInterviews,
            },
            financial: {
                totalProposed,
                pendingValue,
                activeEarnings,
                completedEarnings,
            },
            period: '1 Month',
        },
        chart: {
            period: '12 Months',
            points: chartPoints,
        },
        distributions: {
            proposals: proposalStatus,
            projects: projectStatus,
        },
    };
};
module.exports = {
    getOverview,
    getAnalyticsChart,
    getLatestCustomers,
    getRecentJobs,
    getAdminDashboard,
    getStatistics,
    getClientDashboard,
    getFreelancerDashboard,
};
