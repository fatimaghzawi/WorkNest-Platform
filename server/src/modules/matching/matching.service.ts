/**
 * Smart matching — read-only suggestions.
 * Does NOT create proposals, projects, payments, or change job status.
 */
const AppError = require('../../common/errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../common/utils/pagination');
const jobRepository = require('../jobs/job.repository');
const userRepository = require('../users/user.repository');
const proposalRepository = require('../proposals/proposal.repository');
const { scoreFreelancerForJob } = require('./matching.score');

const { NOT_DELETED_FILTER } = jobRepository;

const PUBLIC_CLIENT_POPULATE = {
  path: 'clientId',
  select: 'firstName lastName profileImage',
};

const MIN_SCORE = 15;
const CANDIDATE_CAP = 80;

const toPlainJob = (job: Record<string, unknown>) => {
  const id = job._id != null ? String(job._id) : undefined;
  return { ...job, _id: id };
};

const toPlainUser = (user: Record<string, unknown>) => {
  const id = user._id != null ? String(user._id) : undefined;
  return {
    _id: id,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImage: user.profileImage,
    skills: user.skills || [],
    bio: user.bio || '',
    portfolioLink: user.portfolioLink || '',
  };
};

/**
 * Suggest open jobs for the logged-in freelancer (ranked).
 * Excludes jobs they already proposed on. Suggestions only.
 */
const suggestJobsForFreelancer = async (
  freelancerId: string,
  query: Record<string, unknown> = {}
) => {
  const freelancer = await userRepository.findById(freelancerId);
  if (!freelancer || freelancer.role !== 'freelancer') {
    throw new AppError('Only freelancers can view job suggestions', 403);
  }

  const { page, limit, skip } = parsePagination(query);
  const skills = Array.isArray(freelancer.skills) ? freelancer.skills : [];

  if (skills.length === 0) {
    return {
      suggestions: [],
      meta: {
        ...buildPaginationMeta(0, page, limit),
        hint: 'Add skills to your profile to unlock smarter job suggestions.',
      },
    };
  }

  let candidates = await jobRepository.findAll({
    filter: {
      status: 'open',
      ...NOT_DELETED_FILTER,
      skills: { $in: skills },
    },
    skip: 0,
    limit: CANDIDATE_CAP,
    sort: { createdAt: -1 },
    populate: true,
    populateSelect: PUBLIC_CLIENT_POPULATE,
    lean: true,
  });

  if (candidates.length < 8) {
    const extra = await jobRepository.findAll({
      filter: { status: 'open', ...NOT_DELETED_FILTER },
      skip: 0,
      limit: CANDIDATE_CAP,
      sort: { createdAt: -1 },
      populate: true,
      populateSelect: PUBLIC_CLIENT_POPULATE,
      lean: true,
    });
    const seen = new Set(candidates.map((j) => String(j._id)));
    for (const job of extra) {
      if (!seen.has(String(job._id))) candidates.push(job);
    }
  }

  let proposedJobIds = new Set<string>();
  try {
    const ids = await proposalRepository.findJobIdsByFreelancer(freelancerId);
    proposedJobIds = new Set(ids.map(String));
  } catch {
    proposedJobIds = new Set();
  }

  const freelProfile = {
    skills: freelancer.skills || [],
    bio: freelancer.bio || '',
  };

  const ranked = candidates
    .filter((job) => !proposedJobIds.has(String(job._id)))
    .map((job) => {
      const { score, breakdown } = scoreFreelancerForJob(job, freelProfile);
      return {
        job: toPlainJob(job),
        score,
        breakdown,
        reason:
          breakdown.overlapCount > 0
            ? `${breakdown.overlapCount} of ${breakdown.jobSkillCount} required skills match`
            : 'Related opportunity based on your profile',
      };
    })
    .filter((row) => row.score >= MIN_SCORE)
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(b.job.createdAt || '').localeCompare(String(a.job.createdAt || ''))
    );

  const total = ranked.length;
  const slice = ranked.slice(skip, skip + limit);

  return {
    suggestions: slice,
    meta: {
      ...buildPaginationMeta(total, page, limit),
      hint: 'Suggestions only — apply with a proposal as usual. Matching never starts a project.',
    },
  };
};

/**
 * Suggest freelancers for a client's job (ranked).
 * Does not invite, hire, or create proposals.
 */
const suggestFreelancersForJob = async (
  clientId: string,
  jobId: string,
  query: Record<string, unknown> = {}
) => {
  const job = await jobRepository.findById(jobId, { lean: true });
  if (!job || job.deletedAt) {
    throw new AppError('Job not found', 404);
  }
  if (String(job.clientId) !== String(clientId)) {
    throw new AppError('You can only view suggestions for your own jobs', 403);
  }

  const { page, limit, skip } = parsePagination(query);
  const jobSkills = Array.isArray(job.skills) ? job.skills : [];

  if (jobSkills.length === 0) {
    return {
      suggestions: [],
      meta: {
        ...buildPaginationMeta(0, page, limit),
        hint: 'Add skills to this job to get freelancer suggestions.',
      },
    };
  }

  let freelancers = await userRepository.findAll({
    filter: {
      role: 'freelancer',
      isActive: true,
      skills: { $in: jobSkills },
    },
    skip: 0,
    limit: CANDIDATE_CAP,
    sort: { updatedAt: -1 },
  });

  freelancers = freelancers.map((u) => (typeof u.toObject === 'function' ? u.toObject() : u));

  if (freelancers.length < 8) {
    const extra = await userRepository.findAll({
      filter: { role: 'freelancer', isActive: true, skills: { $exists: true, $ne: [] } },
      skip: 0,
      limit: CANDIDATE_CAP,
      sort: { updatedAt: -1 },
    });
    const seen = new Set(freelancers.map((u) => String(u._id)));
    for (const u of extra) {
      const plain = typeof u.toObject === 'function' ? u.toObject() : u;
      if (!seen.has(String(plain._id))) freelancers.push(plain);
    }
  }

  const ranked = freelancers
    .map((user) => {
      const { score, breakdown } = scoreFreelancerForJob(job, user);
      return {
        freelancer: toPlainUser(user),
        score,
        breakdown,
        reason:
          breakdown.overlapCount > 0
            ? `${breakdown.overlapCount} of ${breakdown.jobSkillCount} job skills match`
            : 'Possible fit from related skills',
      };
    })
    .filter((row) => row.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score);

  const total = ranked.length;
  const slice = ranked.slice(skip, skip + limit);

  return {
    suggestions: slice,
    job: {
      _id: String(job._id),
      title: job.title,
      skills: job.skills,
      category: job.category,
    },
    meta: {
      ...buildPaginationMeta(total, page, limit),
      hint: 'Suggestions only — freelancers still apply with a proposal. Matching never hires or starts a project.',
    },
  };
};

module.exports = {
  suggestJobsForFreelancer,
  suggestFreelancersForJob,
};
