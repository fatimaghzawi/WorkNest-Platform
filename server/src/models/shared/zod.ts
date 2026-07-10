import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

const objectIdArraySchema = z.array(objectIdSchema);

const urlSchema = z.string().url('Invalid URL format');

const e164PhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (+1234567890)');

const optionalE164PhoneSchema = e164PhoneSchema.optional().or(z.literal(''));

const progressSchema = z.number().min(0).max(100);

const futureDateSchema = z.coerce
  .date()
  .refine((date) => date > new Date(), { message: 'Date must be in the future' });

const nonEmptyString = (field) => z.string().trim().min(1, `${field} is required`);

export {
  objectIdSchema,
  objectIdArraySchema,
  urlSchema,
  e164PhoneSchema,
  optionalE164PhoneSchema,
  progressSchema,
  futureDateSchema,
  nonEmptyString,
};
