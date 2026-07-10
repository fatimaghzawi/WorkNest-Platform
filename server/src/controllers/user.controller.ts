const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

const listUsers = async (req, res) => {
  const result = await userService.listUsers(req.query);
  return sendSuccess(res, {
    message: 'Users retrieved successfully',
    data: result.users,
    meta: result.meta,
  });
};

const getUser = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, {
    message: 'User retrieved successfully',
    data: user,
  });
};

const createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'User created successfully',
    data: user,
  });
};

const updateUser = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user.id);
  return sendSuccess(res, {
    message: 'User updated successfully',
    data: user,
  });
};

const deleteUser = async (req, res) => {
  await userService.deleteUser(req.params.id, req.user.id);
  return sendSuccess(res, {
    message: 'User deactivated successfully',
  });
};

const getUserStats = async (req, res) => {
  const stats = await userService.getUserStats();
  return sendSuccess(res, {
    message: 'User statistics retrieved successfully',
    data: stats,
  });
};

module.exports = {
  listUsers,
  getUserStats,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
