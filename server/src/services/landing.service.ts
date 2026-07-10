const landingRepository = require('../repositories/landing.repository');

const TOP_FREELANCERS_LIMIT = 4;

const getTopFreelancers = async () => {
  const ranked = await landingRepository.findTopFreelancersByCompletedProjects(TOP_FREELANCERS_LIMIT);

  if (ranked.length >= TOP_FREELANCERS_LIMIT) {
    return ranked;
  }

  // Not every freelancer has a completed project yet — pad the list with the
  // most recently joined freelancers so the section isn't empty, without
  // duplicating anyone already ranked.
  const excludeIds = ranked.map((entry) => entry.freelancerId);
  const fillCount = TOP_FREELANCERS_LIMIT - ranked.length;

  const fillers = await landingRepository.findRecentFreelancers(fillCount, excludeIds);

  const fillerEntries = fillers.map((user) => ({
    freelancerId: user._id,
    completedProjects: 0,
    firstName: user.firstName,
    lastName: user.lastName,
    skills: user.skills,
    profileImage: user.profileImage,
  }));

  return [...ranked, ...fillerEntries];
};

const FREELANCERS_PAGE_SIZE = 12;

const listFreelancers = async ({ page = 1, limit = FREELANCERS_PAGE_SIZE } = {}) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));

  const { freelancers, total } = await landingRepository.findAllFreelancers({
    page: safePage,
    limit: safeLimit,
  });

  return {
    freelancers,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

module.exports = {
  getTopFreelancers,
  listFreelancers,
};