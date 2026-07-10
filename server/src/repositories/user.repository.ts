const User = require('../models/User').default;

const SAFE_USER_SELECT =
  '-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires';

const findById = (id: string) => User.findById(id).select(SAFE_USER_SELECT);

const findByEmail = (email: string) => User.findOne({ email: email.trim().toLowerCase() });

const findAll = ({ filter, skip, limit, sort }) =>
  User.find(filter).select(SAFE_USER_SELECT).sort(sort).skip(skip).limit(limit);

const count = (filter) => User.countDocuments(filter);

const countByRole = (role: string) => User.countDocuments({ role });

const create = (data) => User.create(data);

const updateById = (id: string, data) =>
  User.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).select(
    SAFE_USER_SELECT
  );

const deleteById = (id: string) => User.findByIdAndDelete(id);

module.exports = {
  findById,
  findByEmail,
  findAll,
  count,
  countByRole,
  create,
  updateById,
  deleteById,
};
