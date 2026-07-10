"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError = require('../utils/AppError');
const { hashPassword } = require('../utils/bcrypt');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const userRepository = require('../repositories/user.repository');
const authRepository = require('../repositories/auth.repository');
const jobRepository = require('../repositories/job.repository');
const projectRepository = require('../repositories/project.repository');
const Payment = require('../models/Payment').default;
const assertNotSelf = (targetUserId, currentUserId, action) => {
    if (targetUserId === currentUserId) {
        throw new AppError(`You cannot ${action} your own account`, 400);
    }
};
const assertNotLastAdmin = async (user) => {
    if (user.role !== 'admin') {
        return;
    }
    const adminCount = await userRepository.countByRole('admin');
    if (adminCount <= 1) {
        throw new AppError('Cannot remove or demote the last admin account', 400);
    }
};
const listUsers = async (query = {}) => {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};
    if (query.role) {
        filter.role = query.role;
    }
    if (query.isActive !== undefined) {
        filter.isActive = query.isActive;
    }
    if (query.emailVerified !== undefined) {
        filter.emailVerified = query.emailVerified;
    }
    if (query.search) {
        const searchRegex = new RegExp(String(query.search), 'i');
        filter.$or = [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }];
    }
    const sortMap = {
        newest: { createdAt: -1 },
        name_asc: { firstName: 1, lastName: 1 },
        name_desc: { firstName: -1, lastName: -1 },
        role: { role: 1, firstName: 1 },
    };
    const sort = sortMap[String(query.sort)] || sortMap.newest;
    const [users, total] = await Promise.all([
        userRepository.findAll({
            filter,
            skip,
            limit,
            sort,
        }),
        userRepository.count(filter),
    ]);
    return {
        users,
        meta: buildPaginationMeta(total, page, limit),
    };
};
const getUserById = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
};
const createUser = async (data) => {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
        throw new AppError('Email already exists', 409);
    }
    const hashedPassword = await hashPassword(data.password);
    const user = await userRepository.create({
        ...data,
        email: data.email.trim().toLowerCase(),
        password: hashedPassword,
        emailVerified: true,
    });
    return authRepository.sanitizeUser(user);
};
const updateUser = async (id, data, currentUserId) => {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    if (data.isActive === false) {
        assertNotSelf(id, currentUserId, 'deactivate');
    }
    if (data.role && data.role !== user.role) {
        if (user.role === 'admin') {
            assertNotSelf(id, currentUserId, 'change the role of');
            await assertNotLastAdmin(user);
        }
    }
    const updated = await userRepository.updateById(id, data);
    if (!updated) {
        throw new AppError('User not found', 404);
    }
    return updated;
};
const deleteUser = async (id, currentUserId) => {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    assertNotSelf(id, currentUserId, 'deactivate');
    await assertNotLastAdmin(user);
    if (!user.isActive) {
        return user;
    }
    const [activeJobs, activeProjects, heldPayments] = await Promise.all([
        jobRepository.count({
            clientId: id,
            status: { $in: ['open', 'in_progress'] },
            ...jobRepository.NOT_DELETED_FILTER,
        }),
        projectRepository.count({
            $or: [{ clientId: id }, { freelancerId: id }],
            status: { $in: ['active', 'pending_review'] },
        }),
        Payment.countDocuments({
            $or: [{ clientId: id }, { freelancerId: id }],
            status: 'held',
        }),
    ]);
    if (activeJobs > 0) {
        throw new AppError('Cannot deactivate a user with open or in-progress jobs. Close or cancel them first.', 400);
    }
    if (activeProjects > 0) {
        throw new AppError('Cannot deactivate a user with active projects. Complete or cancel them first.', 400);
    }
    if (heldPayments > 0) {
        throw new AppError('Cannot deactivate a user while escrow funds are still held on active payments.', 400);
    }
    const updated = await userRepository.updateById(id, { isActive: false });
    if (!updated) {
        throw new AppError('User not found', 404);
    }
    return updated;
};
const getUserStats = async () => {
    const [total, active, clients, freelancers, admins] = await Promise.all([
        userRepository.count({}),
        userRepository.count({ isActive: true }),
        userRepository.count({ role: 'client' }),
        userRepository.count({ role: 'freelancer' }),
        userRepository.count({ role: 'admin' }),
    ]);
    return { total, active, clients, freelancers, admins };
};
module.exports = {
    listUsers,
    getUserStats,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
