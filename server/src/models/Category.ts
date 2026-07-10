import mongoose from 'mongoose';
import { z } from 'zod';
import { nonEmptyString } from './shared/zod';

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(120, 'Slug cannot exceed 120 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only');

const categoryZodSchema = z.object({
  name: nonEmptyString('Name').max(100, 'Name cannot exceed 100 characters'),
  slug: slugSchema.optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  isActive: z.boolean().optional().default(true),
});

const createCategoryZodSchema = categoryZodSchema;

const updateCategoryZodSchema = categoryZodSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

const categoryMongooseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
      maxlength: [120, 'Slug cannot exceed 120 characters'],
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'],
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
  },
  {
    timestamps: true,
  }
);

categoryMongooseSchema.pre('validate', function generateSlug() {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
});

categoryMongooseSchema.index({ isActive: 1, name: 1 });

const Category = mongoose.model('Category', categoryMongooseSchema);


export { slugify };

export const categoryZodSchemas = {
  schema: categoryZodSchema,
  create: createCategoryZodSchema,
  update: updateCategoryZodSchema,
}
export default Category;
