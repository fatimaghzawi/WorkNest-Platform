const Category = require('../models/Category').default;

const create = (data) => Category.create(data);

const findById = (id: string) => Category.findById(id);

const findByName = (name: string) => Category.findOne({ name: name.trim() });

const findBySlug = (slug: string) => Category.findOne({ slug: slug.trim().toLowerCase() });

const findActiveBySlugOrName = (value: string) => {
  const normalized = value.trim();
  return Category.findOne({
    isActive: true,
    $or: [{ slug: normalized.toLowerCase() }, { name: new RegExp(`^${normalized}$`, 'i') }],
  });
};

const findAll = ({ filter, skip, limit, sort }) =>
  Category.find(filter).sort(sort).skip(skip).limit(limit);

const count = (filter) => Category.countDocuments(filter);

const updateById = (id: string, data) =>
  Category.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });

const deleteById = (id: string) => Category.findByIdAndDelete(id);

module.exports = {
  create,
  findById,
  findByName,
  findBySlug,
  findActiveBySlugOrName,
  findAll,
  count,
  updateById,
  deleteById,
};
