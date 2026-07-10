const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const interviewRepository = require('../repositories/interview.repository');
const proposalRepository = require('../repositories/proposal.repository');
const jobRepository = require('../repositories/job.repository');
const notificationTriggers = require('./notificationTriggers');

const getId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value._id) return value._id.toString();
  return value.toString();
};

const displayName = (user) => {
  if (!user || typeof user === 'string') return 'User';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
};

const toClientInterview = (interview) => {
  const plain = interview.toObject ? interview.toObject() : interview;
  const job = plain.jobId && typeof plain.jobId === 'object' ? plain.jobId : null;
  const client = plain.clientId && typeof plain.clientId === 'object' ? plain.clientId : null;
  const freelancer =
    plain.freelancerId && typeof plain.freelancerId === 'object' ? plain.freelancerId : null;

  return {
    id: plain._id.toString(),
    _id: plain._id.toString(),
    jobId: getId(plain.jobId),
    jobTitle: job?.title || 'Untitled job',
    proposalId: getId(plain.proposalId),
    clientId: getId(plain.clientId),
    freelancerId: getId(plain.freelancerId),
    clientName: displayName(client),
    freelancerName: displayName(freelancer),
    scheduledDate: new Date(plain.scheduledDate).toISOString(),
    duration: plain.duration,
    meetingLink: plain.meetingLink,
    meetingPassword: plain.meetingPassword || undefined,
    notes: plain.notes || undefined,
    status: plain.status,
    createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : undefined,
    updatedAt: plain.updatedAt ? new Date(plain.updatedAt).toISOString() : undefined,
  };
};

const buildDateFilter = (query: Record<string, unknown> = {}) => {
  if (query.year === undefined || query.month === undefined) return {};

  const year = Number(query.year);
  const month = Number(query.month);
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);

  return {
    scheduledDate: {
      $gte: start,
      $lt: end,
    },
  };
};

const assertInterviewAccess = (interview, userId: string, userRole: string) => {
  const isClient = getId(interview.clientId) === userId;
  const isFreelancer = getId(interview.freelancerId) === userId;

  if (userRole === 'admin' || isClient || isFreelancer) return;

  throw new AppError('You do not have access to this interview', 403);
};

const listMyInterviews = async (userId: string, userRole: string, query: Record<string, unknown> = {}) => {
  const { page, limit, skip } = parsePagination({
    ...query,
    limit: query.limit || 100,
  });

  const baseFilter: Record<string, unknown> = {
    ...buildDateFilter(query),
  };

  if (query.status) {
    baseFilter.status = query.status;
  }

  if (userRole === 'client') {
    baseFilter.clientId = userId;
  } else if (userRole === 'freelancer') {
    baseFilter.freelancerId = userId;
  }

  const [interviews, total] = await Promise.all([
    interviewRepository.findAll({
      filter: baseFilter,
      skip,
      limit,
      sort: { scheduledDate: 1 },
    }),
    interviewRepository.count(baseFilter),
  ]);

  return {
    interviews: interviews.map(toClientInterview),
    meta: buildPaginationMeta(total, page, limit),
  };
};

const getInterview = async (id: string, userId: string, userRole: string) => {
  const interview = await interviewRepository.findById(id);
  if (!interview) {
    throw new AppError('Interview not found', 404);
  }

  assertInterviewAccess(interview, userId, userRole);
  return toClientInterview(interview);
};

const createInterview = async (actorId: string, actorRole: string, data) => {
  const proposal = await proposalRepository.findById(data.proposalId);
  if (!proposal) {
    throw new AppError('Proposal not found', 404);
  }

  const job = await jobRepository.findById(data.jobId || getId(proposal.jobId));
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const clientId = getId(job.clientId);
  if (actorRole !== 'admin' && clientId !== actorId) {
    throw new AppError('You can only schedule interviews for your own jobs', 403);
  }

  if (getId(proposal.jobId) !== getId(job._id)) {
    throw new AppError('Proposal does not belong to this job', 400);
  }

  const freelancerId = data.freelancerId
    ? getId(data.freelancerId)
    : getId(proposal.freelancerId);

  if (getId(proposal.freelancerId) !== freelancerId) {
    throw new AppError('Freelancer does not match the selected proposal', 400);
  }

  if (!['pending', 'accepted'].includes(proposal.status)) {
    throw new AppError('Interviews can only be scheduled for pending or accepted proposals', 400);
  }

  if (proposal.status === 'pending' && job.status !== 'open') {
    throw new AppError('Interviews for pending proposals require an open job', 400);
  }

  const scheduledDate = new Date(data.scheduledDate);
  if (Number.isNaN(scheduledDate.getTime())) {
    throw new AppError('Invalid scheduled date', 400);
  }

  const created = await interviewRepository.create({
    jobId: getId(job._id),
    proposalId: getId(proposal._id),
    clientId,
    freelancerId,
    scheduledDate,
    duration: data.duration,
    meetingLink: data.meetingLink,
    meetingPassword: data.meetingPassword || undefined,
    notes: data.notes || undefined,
    status: 'scheduled',
  });

  const interview = await interviewRepository.findById(created._id.toString());
  await notificationTriggers.interviewScheduled(interview);
  return toClientInterview(interview);
};

const updateInterview = async (id: string, userId: string, userRole: string, data) => {
  const interview = await interviewRepository.findById(id);
  if (!interview) {
    throw new AppError('Interview not found', 404);
  }

  assertInterviewAccess(interview, userId, userRole);

  if (interview.status !== 'scheduled' && interview.status !== 'confirmed') {
    throw new AppError('Only scheduled or confirmed interviews can be updated', 400);
  }

  const isClient = getId(interview.clientId) === userId || userRole === 'admin';
  if (!isClient && data.status === undefined) {
    throw new AppError('Only the client can edit interview details', 403);
  }

  const updated = await interviewRepository.updateById(id, data);
  if (!updated) {
    throw new AppError('Interview not found', 404);
  }

  if (data.status === undefined) {
    await notificationTriggers.interviewUpdated(updated, userId);
  }

  return toClientInterview(updated);
};

const updateInterviewStatus = async (
  id: string,
  userId: string,
  userRole: string,
  status: string
) => {
  const interview = await interviewRepository.findById(id);
  if (!interview) {
    throw new AppError('Interview not found', 404);
  }

  assertInterviewAccess(interview, userId, userRole);

  const isClient = getId(interview.clientId) === userId || userRole === 'admin';
  const isFreelancer = getId(interview.freelancerId) === userId;

  if (status === 'confirmed') {
    if (interview.status !== 'scheduled') {
      throw new AppError('Only scheduled interviews can be confirmed', 400);
    }
    if (!isFreelancer && userRole !== 'admin') {
      throw new AppError('Only the freelancer can confirm an interview', 403);
    }
  } else if (status === 'cancelled') {
    if (!['scheduled', 'confirmed'].includes(interview.status)) {
      throw new AppError('Only active interviews can be cancelled', 400);
    }
    if (!isClient && userRole !== 'admin') {
      throw new AppError('Only the client can cancel an interview', 403);
    }
  } else if (status === 'completed') {
    if (!['scheduled', 'confirmed'].includes(interview.status)) {
      throw new AppError('Only active interviews can be completed', 400);
    }
    if (!isClient && !isFreelancer && userRole !== 'admin') {
      throw new AppError('Only participants can mark an interview as completed', 403);
    }
  } else if (status === 'declined') {
    if (interview.status !== 'scheduled') {
      throw new AppError('Only scheduled interviews can be declined', 400);
    }
    if (!isFreelancer && userRole !== 'admin') {
      throw new AppError('Only the freelancer can decline an interview', 403);
    }
  } else {
    throw new AppError('Invalid interview status', 400);
  }

  const updated = await interviewRepository.updateById(id, { status });
  await notificationTriggers.interviewStatusChanged(updated, status, userId);
  return toClientInterview(updated);
};

module.exports = {
  listMyInterviews,
  getInterview,
  createInterview,
  updateInterview,
  updateInterviewStatus,
};
