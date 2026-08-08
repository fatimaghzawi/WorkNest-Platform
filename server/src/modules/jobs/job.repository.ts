const Job = require('./job.model').default;

const CLIENT_POPULATE = { path: 'clientId', select: 'firstName lastName email profileImage' };

const NOT_DELETED_FILTER = { deletedAt: null };

const create = (data) => Job.create(data);

const findById = (
  id: string,
  { populate = false, lean = false, populateSelect = undefined } = {}
) => {
  let query = Job.findById(id);
  if (populate) {
    query = query.populate(populateSelect || CLIENT_POPULATE);
  }
  if (lean) {
    query = query.lean();
  }
  return query;
};

const findAll = ({
  filter,
  skip,
  limit,
  sort,
  populate = false,
  lean = true,
  populateSelect = undefined,
}) => {
  let query = Job.find(filter).sort(sort).skip(skip).limit(limit);
  if (populate) {
    query = query.populate(populateSelect || CLIENT_POPULATE);
  }
  if (lean) {
    query = query.lean();
  }
  return query;
};

const count = (filter) => Job.countDocuments(filter);

const countByCategory = (category: string) =>
  Job.countDocuments({ category, ...NOT_DELETED_FILTER });

const updateById = (id: string, data) =>
  Job.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).populate(
    CLIENT_POPULATE
  );

const deleteById = (id: string) => Job.findByIdAndDelete(id);

const softDeleteById = (id: string) =>
  Job.findByIdAndUpdate(
    id,
    { deletedAt: new Date(), status: 'closed' },
    { returnDocument: 'after', runValidators: true }
  ).populate(CLIENT_POPULATE);

module.exports = {
  create,
  findById,
  findAll,
  count,
  countByCategory,
  updateById,
  deleteById,
  softDeleteById,
  NOT_DELETED_FILTER,
  CLIENT_POPULATE,
};
