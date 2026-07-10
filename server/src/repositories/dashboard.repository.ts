const mongoose = require('mongoose');
const Job = require('../models/Job').default;
const User = require('../models/User').default;
const Proposal = require('../models/Proposal').default;
const Project = require('../models/Project').default;
const Interview = require('../models/Interview').default;
const Category = require('../models/Category').default;

const toClientObjectId = (clientId) => new mongoose.Types.ObjectId(String(clientId));
const toFreelancerObjectId = (freelancerId) => new mongoose.Types.ObjectId(String(freelancerId));

const getClientJobIds = async (clientId) =>
  Job.find({ clientId: toClientObjectId(clientId), deletedAt: null }).distinct('_id');

const monthBounds = (monthsBack = 11) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end.getFullYear(), end.getMonth() - monthsBack, 1);
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

const countUsers = (filter = {}) => User.countDocuments(filter);
const countJobs = (filter = {}) => Job.countDocuments(filter);
const countProposals = (filter = {}) => Proposal.countDocuments(filter);
const countProjects = (filter = {}) => Project.countDocuments(filter);
const countInterviews = (filter = {}) => Interview.countDocuments(filter);
const countCategories = (filter = {}) => Category.countDocuments(filter);

const sumJobBudgets = async (filter = {}) => {
  const result = await Job.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$budget' } } },
  ]);
  return result[0]?.total || 0;
};

const averageProjectProgress = async (filter = {}) => {
  const result = await Project.aggregate([
    { $match: filter },
    { $group: { _id: null, avg: { $avg: '$progress' } } },
  ]);
  return Math.round(result[0]?.avg || 0);
};

const monthlyJobActivity = async (monthsBack = 11) => {
  const { start } = monthBounds(monthsBack);

  const [jobsByMonth, proposalsByMonth] = await Promise.all([
    Job.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          jobs: { $sum: 1 },
          budget: { $sum: '$budget' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Proposal.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          proposals: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const proposalMap = new Map(
    proposalsByMonth.map((row) => [`${row._id.year}-${row._id.month}`, row.proposals])
  );

  const points = [];
  const cursor = new Date(start);
  const now = new Date();

  while (
    cursor.getFullYear() < now.getFullYear() ||
    (cursor.getFullYear() === now.getFullYear() && cursor.getMonth() <= now.getMonth())
  ) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    const key = `${year}-${month}`;
    const jobRow = jobsByMonth.find((row) => row._id.year === year && row._id.month === month);

    points.push({
      label: String(month).padStart(2, '0'),
      year,
      month,
      jobs: jobRow?.jobs || 0,
      budget: jobRow?.budget || 0,
      proposals: proposalMap.get(key) || 0,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return points;
};

const latestUsers = async (limit = 6) => {
  const users = await User.find({ role: { $in: ['client', 'freelancer'] } })
    .select('firstName lastName email role profileImage createdAt isActive')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return users.map((user) => ({
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage || '',
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
    isActive: Boolean(user.isActive),
  }));
};

const recentJobs = async (limit = 5) => {
  const jobs = await Job.find({ deletedAt: null })
    .select('title status budget createdAt clientId')
    .populate({ path: 'clientId', select: 'firstName lastName' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return jobs.map((job) => ({
    id: job._id.toString(),
    title: job.title,
    status: job.status,
    budget: job.budget,
    clientName:
      job.clientId && typeof job.clientId === 'object'
        ? `${job.clientId.firstName || ''} ${job.clientId.lastName || ''}`.trim()
        : 'Client',
    createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
  }));
};

const countByStatus = async (Model, statuses = []) => {
  const rows = await Model.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const map = new Map(rows.map((row) => [row._id, row.count]));

  if (statuses.length > 0) {
    return statuses.map((status) => ({
      status,
      count: map.get(status) || 0,
    }));
  }

  return rows.map((row) => ({
    status: row._id || 'unknown',
    count: row.count,
  }));
};

const countUsersByRole = async () => {
  const rows = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  const map = new Map(rows.map((row) => [row._id, row.count]));

  return ['client', 'freelancer', 'admin'].map((role) => ({
    role,
    count: map.get(role) || 0,
  }));
};

const jobsByCategory = async (limit = 8) => {
  const rows = await Job.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, budget: { $sum: '$budget' } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return rows.map((row) => ({
    category: row._id || 'Uncategorized',
    count: row.count,
    budget: row.budget,
  }));
};

const topJobSkills = async (limit = 8) => {
  const rows = await Job.aggregate([
    { $unwind: '$skills' },
    { $group: { _id: '$skills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return rows.map((row) => ({
    skill: row._id,
    count: row.count,
  }));
};

const countProposalsForClient = async (clientId, extraFilter = {}) => {
  const jobIds = await getClientJobIds(clientId);
  if (!jobIds.length) return 0;
  return Proposal.countDocuments({ jobId: { $in: jobIds }, ...extraFilter });
};

const monthlyClientActivity = async (clientId, monthsBack = 11) => {
  const { start } = monthBounds(monthsBack);
  const clientObjectId = toClientObjectId(clientId);
  const jobIds = await getClientJobIds(clientId);

  const [jobsByMonth, proposalsByMonth] = await Promise.all([
    Job.aggregate([
      { $match: { clientId: clientObjectId, createdAt: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          jobs: { $sum: 1 },
          budget: { $sum: '$budget' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    jobIds.length
      ? Proposal.aggregate([
          { $match: { jobId: { $in: jobIds }, createdAt: { $gte: start } } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              proposals: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ])
      : Promise.resolve([]),
  ]);

  const proposalMap = new Map(
    proposalsByMonth.map((row) => [`${row._id.year}-${row._id.month}`, row.proposals])
  );

  const points = [];
  const cursor = new Date(start);
  const now = new Date();

  while (
    cursor.getFullYear() < now.getFullYear() ||
    (cursor.getFullYear() === now.getFullYear() && cursor.getMonth() <= now.getMonth())
  ) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    const key = `${year}-${month}`;
    const jobRow = jobsByMonth.find((row) => row._id.year === year && row._id.month === month);

    points.push({
      label: String(month).padStart(2, '0'),
      year,
      month,
      jobs: jobRow?.jobs || 0,
      budget: jobRow?.budget || 0,
      proposals: proposalMap.get(key) || 0,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return points;
};

const clientRecentJobs = async (clientId, limit = 5) => {
  const jobs = await Job.find({ clientId: toClientObjectId(clientId), deletedAt: null })
    .select('title status budget createdAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  if (!jobs.length) return [];

  const jobIds = jobs.map((job) => job._id);
  const proposalCounts = await Proposal.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$jobId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(proposalCounts.map((row) => [row._id.toString(), row.count]));

  return jobs.map((job) => ({
    id: job._id.toString(),
    title: job.title,
    status: job.status,
    budget: job.budget,
    proposalCount: countMap.get(job._id.toString()) || 0,
    createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
  }));
};

const countClientJobsByStatus = async (clientId, statuses = []) => {
  const pipeline = await clientJobPipelineStats(clientId);
  const map = new Map(pipeline.statusDistribution.map((row) => [row.status, row.count]));

  return statuses.map((status) => ({
    status,
    count: map.get(status) || 0,
  }));
};

const clientJobPipelineStats = async (clientId) => {
  const clientObjectId = toClientObjectId(clientId);

  const rows = await Job.aggregate([
    { $match: { clientId: clientObjectId } },
    {
      $lookup: {
        from: 'projects',
        localField: '_id',
        foreignField: 'jobId',
        as: 'project',
      },
    },
    {
      $addFields: {
        effectiveStatus: {
          $cond: [
            {
              $and: [
                { $eq: ['$status', 'in_progress'] },
                { $gt: [{ $size: '$project' }, 0] },
                { $eq: [{ $arrayElemAt: ['$project.status', 0] }, 'completed'] },
              ],
            },
            'closed',
            '$status',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$effectiveStatus',
        count: { $sum: 1 },
        budget: { $sum: '$budget' },
      },
    },
  ]);

  const countMap = new Map<string, number>(
    rows.map((row: { _id: string; count: number }) => [row._id, row.count])
  );
  const budgetMap = new Map<string, number>(
    rows.map((row: { _id: string; budget: number }) => [row._id, row.budget])
  );

  const open = countMap.get('open') ?? 0;
  const inProgress = countMap.get('in_progress') ?? 0;
  const closed = countMap.get('closed') ?? 0;

  return {
    counts: {
      total: open + inProgress + closed,
      open,
      inProgress,
      closed,
    },
    budgets: {
      total:
        (budgetMap.get('open') ?? 0) +
        (budgetMap.get('in_progress') ?? 0) +
        (budgetMap.get('closed') ?? 0),
      open: budgetMap.get('open') ?? 0,
      inProgress: budgetMap.get('in_progress') ?? 0,
      closed: budgetMap.get('closed') ?? 0,
    },
    statusDistribution: ['open', 'in_progress', 'closed'].map((status) => ({
      status,
      count: countMap.get(status) || 0,
    })),
  };
};

const countClientProposalsByStatus = async (clientId, statuses = []) => {
  const jobIds = await getClientJobIds(clientId);
  if (!jobIds.length) {
    return statuses.map((status) => ({ status, count: 0 }));
  }

  const rows = await Proposal.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const map = new Map(rows.map((row) => [row._id, row.count]));

  return statuses.map((status) => ({
    status,
    count: map.get(status) || 0,
  }));
};

const sumFreelancerProposalPrices = async (freelancerId, extraFilter = {}) => {
  const result = await Proposal.aggregate([
    { $match: { freelancerId: toFreelancerObjectId(freelancerId), ...extraFilter } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);
  return result[0]?.total || 0;
};

const sumFreelancerAcceptedEarnings = async (freelancerId, projectStatus) => {
  const result = await Proposal.aggregate([
    {
      $match: {
        freelancerId: toFreelancerObjectId(freelancerId),
        status: 'accepted',
      },
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'jobId',
        foreignField: 'jobId',
        as: 'project',
      },
    },
    { $unwind: '$project' },
    {
      $match: {
        'project.status': projectStatus,
        'project.freelancerId': toFreelancerObjectId(freelancerId),
      },
    },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);
  return result[0]?.total || 0;
};

const monthlyFreelancerActivity = async (freelancerId, monthsBack = 11) => {
  const { start } = monthBounds(monthsBack);
  const freelancerObjectId = toFreelancerObjectId(freelancerId);

  const [sentByMonth, acceptedByMonth] = await Promise.all([
    Proposal.aggregate([
      { $match: { freelancerId: freelancerObjectId, createdAt: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          proposals: { $sum: 1 },
          budget: { $sum: '$price' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Proposal.aggregate([
      {
        $match: {
          freelancerId: freelancerObjectId,
          status: 'accepted',
          updatedAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
          },
          accepted: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const acceptedMap = new Map(
    acceptedByMonth.map((row) => [`${row._id.year}-${row._id.month}`, row.accepted])
  );

  const points = [];
  const cursor = new Date(start);
  const now = new Date();

  while (
    cursor.getFullYear() < now.getFullYear() ||
    (cursor.getFullYear() === now.getFullYear() && cursor.getMonth() <= now.getMonth())
  ) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    const key = `${year}-${month}`;
    const sentRow = sentByMonth.find((row) => row._id.year === year && row._id.month === month);

    points.push({
      label: String(month).padStart(2, '0'),
      year,
      month,
      jobs: sentRow?.proposals || 0,
      budget: sentRow?.budget || 0,
      proposals: acceptedMap.get(key) || 0,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return points;
};

const countFreelancerProposalsByStatus = async (freelancerId, statuses = []) => {
  const rows = await Proposal.aggregate([
    { $match: { freelancerId: toFreelancerObjectId(freelancerId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const map = new Map(rows.map((row) => [row._id, row.count]));

  return statuses.map((status) => ({
    status,
    count: map.get(status) || 0,
  }));
};

const countFreelancerProjectsByStatus = async (freelancerId, statuses = []) => {
  const rows = await Project.aggregate([
    { $match: { freelancerId: toFreelancerObjectId(freelancerId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const map = new Map(rows.map((row) => [row._id, row.count]));

  return statuses.map((status) => ({
    status,
    count: map.get(status) || 0,
  }));
};

const monthlyUserSignups = async (monthsBack = 11) => {
  const { start } = monthBounds(monthsBack);

  const signupsByMonth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: start },
        role: { $in: ['client', 'freelancer'] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        signups: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const signupMap = new Map(
    signupsByMonth.map((row) => [`${row._id.year}-${row._id.month}`, row.signups])
  );

  const points = [];
  const cursor = new Date(start);
  const now = new Date();

  while (
    cursor.getFullYear() < now.getFullYear() ||
    (cursor.getFullYear() === now.getFullYear() && cursor.getMonth() <= now.getMonth())
  ) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    const key = `${year}-${month}`;

    points.push({
      label: String(month).padStart(2, '0'),
      year,
      month,
      signups: signupMap.get(key) || 0,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return points;
};

module.exports = {
  countUsers,
  countJobs,
  countProposals,
  countProjects,
  countInterviews,
  countCategories,
  sumJobBudgets,
  averageProjectProgress,
  monthlyJobActivity,
  monthlyClientActivity,
  monthlyUserSignups,
  latestUsers,
  recentJobs,
  clientRecentJobs,
  countByStatus,
  countClientJobsByStatus,
  clientJobPipelineStats,
  countClientProposalsByStatus,
  countProposalsForClient,
  sumFreelancerProposalPrices,
  sumFreelancerAcceptedEarnings,
  monthlyFreelancerActivity,
  countFreelancerProposalsByStatus,
  countFreelancerProjectsByStatus,
  countUsersByRole,
  jobsByCategory,
  topJobSkills,
};
