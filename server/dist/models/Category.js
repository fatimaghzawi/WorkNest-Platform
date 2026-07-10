"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryZodSchemas = exports.slugify = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const slugify = (value) => value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
exports.slugify = slugify;
const slugSchema = zod_1.z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(120, 'Slug cannot exceed 120 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only');
const categoryZodSchema = zod_1.z.object({
    name: (0, zod_2.nonEmptyString)('Name').max(100, 'Name cannot exceed 100 characters'),
    slug: slugSchema.optional(),
    description: zod_1.z
        .string()
        .trim()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    isActive: zod_1.z.boolean().optional().default(true),
});
const createCategoryZodSchema = categoryZodSchema;
const updateCategoryZodSchema = categoryZodSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
const categoryMongooseSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
        index: true,
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        trim: true,
        unique: true,
        lowercase: true,
        maxlength: [120, 'Slug cannot exceed 120 characters'],
        match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'],
        index: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, {
    timestamps: true,
});
categoryMongooseSchema.pre('validate', function generateSlug() {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name);
    }
});
categoryMongooseSchema.index({ name: 1 }, { unique: true });
categoryMongooseSchema.index({ slug: 1 }, { unique: true });
categoryMongooseSchema.index({ isActive: 1, name: 1 });
const Category = mongoose_1.default.model('Category', categoryMongooseSchema);
exports.categoryZodSchemas = {
    schema: categoryZodSchema,
    create: createCategoryZodSchema,
    update: updateCategoryZodSchema,
};
exports.default = Category;
