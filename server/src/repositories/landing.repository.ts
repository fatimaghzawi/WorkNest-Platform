const Project = require('../models/Project').default;
const User = require('../models/User').default;

const findTopFreelancersByCompletedProjects = (limit: number) =>
  Project.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$freelancerId', completedProjects: { $sum: 1 } } },
    { $sort: { completedProjects: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'freelancer',
      },
    },
    { $unwind: '$freelancer' },
    {
      $project: {
        _id: 0,
        freelancerId: '$_id',
        completedProjects: 1,
        firstName: '$freelancer.firstName',
        lastName: '$freelancer.lastName',
        skills: '$freelancer.skills',
        profileImage: '$freelancer.profileImage',
      },
    },
  ]);

const findRecentFreelancers = (limit: number, excludeIds: unknown[] = []) =>
  User.find({ role: 'freelancer', _id: { $nin: excludeIds } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('firstName lastName skills profileImage')
    .lean();

const findAllFreelancers = async ({ page = 1, limit = 12 } = {}) => {
  const skip = (page - 1) * limit;

  const [freelancers, total] = await Promise.all([
    User.aggregate([
      { $match: { role: 'freelancer', isActive: true } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'projects',
          let: { freelancerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$freelancerId', '$$freelancerId'] },
                    { $eq: ['$status', 'completed'] },
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'completedProjectsAgg',
        },
      },
      {
        $project: {
          _id: 0,
          freelancerId: '$_id',
          firstName: 1,
          lastName: 1,
          skills: 1,
          profileImage: 1,
          bio: 1,
          completedProjects: { $ifNull: [{ $arrayElemAt: ['$completedProjectsAgg.count', 0] }, 0] },
        },
      },
    ]),
    User.countDocuments({ role: 'freelancer', isActive: true }),
  ]);

  return { freelancers, total };
};

module.exports = {
  findTopFreelancersByCompletedProjects,
  findRecentFreelancers,
  findAllFreelancers,
};