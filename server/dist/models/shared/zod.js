"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonEmptyString = exports.futureDateSchema = exports.progressSchema = exports.optionalE164PhoneSchema = exports.e164PhoneSchema = exports.urlSchema = exports.objectIdArraySchema = exports.objectIdSchema = void 0;
const zod_1 = require("zod");
const objectIdSchema = zod_1.z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');
exports.objectIdSchema = objectIdSchema;
const objectIdArraySchema = zod_1.z.array(objectIdSchema);
exports.objectIdArraySchema = objectIdArraySchema;
const urlSchema = zod_1.z.string().url('Invalid URL format');
exports.urlSchema = urlSchema;
const e164PhoneSchema = zod_1.z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (+1234567890)');
exports.e164PhoneSchema = e164PhoneSchema;
const optionalE164PhoneSchema = e164PhoneSchema.optional().or(zod_1.z.literal(''));
exports.optionalE164PhoneSchema = optionalE164PhoneSchema;
const progressSchema = zod_1.z.number().min(0).max(100);
exports.progressSchema = progressSchema;
const futureDateSchema = zod_1.z.coerce
    .date()
    .refine((date) => date > new Date(), { message: 'Date must be in the future' });
exports.futureDateSchema = futureDateSchema;
const nonEmptyString = (field) => zod_1.z.string().trim().min(1, `${field} is required`);
exports.nonEmptyString = nonEmptyString;
