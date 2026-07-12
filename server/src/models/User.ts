import mongoose from 'mongoose';
import { z } from 'zod';
import {
  urlSchema,
  optionalE164PhoneSchema,
  nonEmptyString,
} from './shared/zod';

const ROLES = ['client', 'freelancer', 'admin'];

const userZodSchema = z.object({
  firstName: nonEmptyString('First name').max(50, 'First name cannot exceed 50 characters'),
  lastName: nonEmptyString('Last name').max(50, 'Last name cannot exceed 50 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  role: z.enum(ROLES, { message: 'Role must be client, freelancer, or admin' }),
  phone: optionalE164PhoneSchema,
  profileImage: urlSchema.optional().or(z.literal('')),
  bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional(),
  skills: z.array(z.string().trim().min(1)).optional().default([]),
  portfolioLink: urlSchema.optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
  emailVerified: z.boolean().optional().default(false),
});

const createUserZodSchema = userZodSchema;

// No .default() here — partial() + defaults would inject emailVerified:false / skills:[] on every PATCH.
const updateUserZodSchema = z
  .object({
    firstName: nonEmptyString('First name').max(50, 'First name cannot exceed 50 characters').optional(),
    lastName: nonEmptyString('Last name').max(50, 'Last name cannot exceed 50 characters').optional(),
    role: z.enum(ROLES, { message: 'Role must be client, freelancer, or admin' }).optional(),
    phone: optionalE164PhoneSchema,
    profileImage: urlSchema.optional().or(z.literal('')),
    bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional(),
    skills: z.array(z.string().trim().min(1)).optional(),
    portfolioLink: urlSchema.optional().or(z.literal('')),
    isActive: z.boolean().optional(),
    emailVerified: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

const userMongooseSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ROLES,
        message: 'Role must be client, freelancer, or admin',
      },
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format'],
    },
    profileImage: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    portfolioLink: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userMongooseSchema);


export { ROLES };

export const userZodSchemas = {
  schema: userZodSchema,
  create: createUserZodSchema,
  update: updateUserZodSchema,
}
export default User;
