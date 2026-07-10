"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError = require('../utils/AppError');
const authRepository = require('../repositories/auth.repository');
const profileRepository = require('../repositories/profile.repository');
const proposalRepository = require('../repositories/proposal.repository');
const projectRepository = require('../repositories/project.repository');
const jobRepository = require('../repositories/job.repository');
const { normalizeStoredFileUrl } = require('../utils/upload.util');
const ensureUserExists = async (userId) => {
    const user = await profileRepository.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    if (!user.isActive) {
        throw new AppError('Your account has been deactivated', 403);
    }
    return user;
};
const getMyProfile = async (userId) => {
    const user = await ensureUserExists(userId);
    return authRepository.sanitizeUser(user);
};
const updateMyProfile = async (userId, data) => {
    await ensureUserExists(userId);
    const updated = await profileRepository.updateProfile(userId, data);
    if (!updated) {
        throw new AppError('User not found', 404);
    }
    return authRepository.sanitizeUser(updated);
};
const uploadAvatar = async (userId, profileImage) => {
    await ensureUserExists(userId);
    const updated = await profileRepository.updateAvatar(userId, profileImage);
    if (!updated) {
        throw new AppError('User not found', 404);
    }
    return authRepository.sanitizeUser(updated);
};
const toPublicFreelancerProfile = (user) => ({
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    role: 'freelancer',
    profileImage: normalizeStoredFileUrl(user.profileImage) || undefined,
    bio: user.bio || undefined,
    skills: user.skills || [],
    portfolioLink: user.portfolioLink || undefined,
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.createdAt,
});
const getPublicFreelancerProfile = async (freelancerId) => {
    const user = await profileRepository.findPublicFreelancerById(freelancerId);
    if (!user || user.role !== 'freelancer') {
        throw new AppError('Freelancer not found', 404);
    }
    if (!user.isActive) {
        throw new AppError('This freelancer profile is not available', 404);
    }
    const [proposalsTotal, proposalsAccepted, proposalsPending, projectsActive, projectsCompleted, recentCompleted,] = await Promise.all([
        proposalRepository.count({ freelancerId }),
        proposalRepository.count({ freelancerId, status: 'accepted' }),
        proposalRepository.count({ freelancerId, status: 'pending' }),
        projectRepository.count({ freelancerId, status: 'active' }),
        projectRepository.count({ freelancerId, status: 'completed' }),
        projectRepository.findAll({
            filter: { freelancerId, status: 'completed' },
            skip: 0,
            limit: 5,
            sort: { updatedAt: -1 },
        }),
    ]);
    const winRate = proposalsTotal > 0 ? Math.round((proposalsAccepted / proposalsTotal) * 100) : 0;
    const recentProjects = recentCompleted.map((project) => {
        const plain = project.toObject ? project.toObject() : project;
        const job = plain.jobId && typeof plain.jobId === 'object' ? plain.jobId : null;
        return {
            id: plain._id.toString(),
            title: plain.title || job?.title || 'Project',
            category: job?.category,
            completedAt: plain.updatedAt || plain.createdAt,
        };
    });
    return {
        profile: toPublicFreelancerProfile(user),
        stats: {
            proposalsTotal,
            proposalsAccepted,
            proposalsPending,
            winRate,
            projectsActive,
            projectsCompleted,
        },
        recentProjects,
    };
};
const toPublicClientProfile = (user) => ({
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    role: 'client',
    profileImage: normalizeStoredFileUrl(user.profileImage) || undefined,
    bio: user.bio || undefined,
    emailVerified: Boolean(user.emailVerified),
    createdAt: user.createdAt,
});
const assertCanViewClientProfile = async (clientId, requesterId, requesterRole) => {
    if (requesterRole === 'admin')
        return;
    if (requesterRole !== 'freelancer') {
        throw new AppError('Forbidden', 403);
    }
    const sharedProjects = await projectRepository.count({
        clientId,
        freelancerId: requesterId,
    });
    if (sharedProjects > 0)
        return;
    const hasAcceptedProposal = await proposalRepository.hasAcceptedWithClient(clientId, requesterId);
    if (!hasAcceptedProposal) {
        throw new AppError('You can only view profiles of clients you are engaged with', 403);
    }
};
const getPublicClientProfile = async (clientId, requesterId, requesterRole) => {
    await assertCanViewClientProfile(clientId, requesterId, requesterRole);
    const user = await profileRepository.findPublicClientById(clientId);
    if (!user || user.role !== 'client') {
        throw new AppError('Client not found', 404);
    }
    if (!user.isActive) {
        throw new AppError('This client profile is not available', 404);
    }
    const [jobsPosted, projectsActive, projectsCompleted] = await Promise.all([
        jobRepository.count({ clientId, ...jobRepository.NOT_DELETED_FILTER }),
        projectRepository.count({ clientId, status: 'active' }),
        projectRepository.count({ clientId, status: 'completed' }),
    ]);
    return {
        profile: toPublicClientProfile(user),
        stats: {
            jobsPosted,
            projectsActive,
            projectsCompleted,
        },
    };
};
module.exports = {
    getMyProfile,
    updateMyProfile,
    uploadAvatar,
    getPublicFreelancerProfile,
    getPublicClientProfile,
};
