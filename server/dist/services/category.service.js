"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const categoryRepository = require('../repositories/category.repository');
const listCategories = async (query = {}) => {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};
    if (query.isActive !== undefined) {
        filter.isActive = query.isActive;
    }
    if (query.search) {
        const searchRegex = new RegExp(String(query.search), 'i');
        filter.$or = [{ name: searchRegex }, { slug: searchRegex }, { description: searchRegex }];
    }
    const [categories, total] = await Promise.all([
        categoryRepository.findAll({
            filter,
            skip,
            limit,
            sort: { name: 1 },
        }),
        categoryRepository.count(filter),
    ]);
    return {
        categories,
        meta: buildPaginationMeta(total, page, limit),
    };
};
const getCategoryById = async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    return category;
};
const createCategory = async (data) => {
    const existingByName = await categoryRepository.findByName(data.name);
    if (existingByName) {
        throw new AppError('Category name already exists', 409);
    }
    if (data.slug) {
        const existingBySlug = await categoryRepository.findBySlug(data.slug);
        if (existingBySlug) {
            throw new AppError('Category slug already exists', 409);
        }
    }
    return categoryRepository.create(data);
};
const updateCategory = async (id, data) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    if (data.name && data.name !== category.name) {
        const existingByName = await categoryRepository.findByName(data.name);
        if (existingByName && existingByName._id.toString() !== id) {
            throw new AppError('Category name already exists', 409);
        }
    }
    if (data.slug && data.slug !== category.slug) {
        const existingBySlug = await categoryRepository.findBySlug(data.slug);
        if (existingBySlug && existingBySlug._id.toString() !== id) {
            throw new AppError('Category slug already exists', 409);
        }
    }
    const updated = await categoryRepository.updateById(id, data);
    if (!updated) {
        throw new AppError('Category not found', 404);
    }
    return updated;
};
const deleteCategory = async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    if (!category.isActive) {
        return category;
    }
    const updated = await categoryRepository.updateById(id, { isActive: false });
    if (!updated) {
        throw new AppError('Category not found', 404);
    }
    return updated;
};
const resolveActiveCategory = async (value) => {
    const category = await categoryRepository.findActiveBySlugOrName(value);
    if (!category) {
        throw new AppError('Invalid or inactive category', 400);
    }
    return category;
};
module.exports = {
    listCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    resolveActiveCategory,
};
