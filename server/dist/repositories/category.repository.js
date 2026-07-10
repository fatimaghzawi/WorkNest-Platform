"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Category = require('../models/Category').default;
const create = (data) => Category.create(data);
const findById = (id) => Category.findById(id);
const findByName = (name) => Category.findOne({ name: name.trim() });
const findBySlug = (slug) => Category.findOne({ slug: slug.trim().toLowerCase() });
const findActiveBySlugOrName = (value) => {
    const normalized = value.trim();
    return Category.findOne({
        isActive: true,
        $or: [{ slug: normalized.toLowerCase() }, { name: new RegExp(`^${normalized}$`, 'i') }],
    });
};
const findAll = ({ filter, skip, limit, sort }) => Category.find(filter).sort(sort).skip(skip).limit(limit);
const count = (filter) => Category.countDocuments(filter);
const updateById = (id, data) => Category.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
const deleteById = (id) => Category.findByIdAndDelete(id);
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
