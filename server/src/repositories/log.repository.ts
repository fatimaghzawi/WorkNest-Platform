const Log = require('../models/Log').default;

const create = (data) => Log.create(data);

const findAll = ({ filter, skip, limit, sort }) => Log.find(filter).sort(sort).skip(skip).limit(limit).lean();

const count = (filter) => Log.countDocuments(filter);

const countByLevel = async () => {
  const rows = await Log.aggregate([{ $group: { _id: '$level', count: { $sum: 1 } } }]);
  const map = new Map(rows.map((row) => [row._id, row.count]));

  return {
    info: map.get('info') || 0,
    warning: map.get('warning') || 0,
    error: map.get('error') || 0,
    total: rows.reduce((sum, row) => sum + row.count, 0),
  };
};

const countRecent = async (hours = 24) => {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const [total, warning, error] = await Promise.all([
    Log.countDocuments({ createdAt: { $gte: since } }),
    Log.countDocuments({ level: 'warning', createdAt: { $gte: since } }),
    Log.countDocuments({ level: 'error', createdAt: { $gte: since } }),
  ]);

  return { total, warning, error };
};

module.exports = {
  create,
  findAll,
  count,
  countByLevel,
  countRecent,
};
