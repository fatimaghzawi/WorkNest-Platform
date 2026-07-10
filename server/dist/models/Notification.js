"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationZodSchemas = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const notificationZodSchema = zod_1.z.object({
    recipientId: zod_2.objectIdSchema,
    type: (0, zod_2.nonEmptyString)('Type'),
    title: (0, zod_2.nonEmptyString)('Title'),
    message: (0, zod_2.nonEmptyString)('Message'),
    isRead: zod_1.z.boolean().optional().default(false),
    relatedJobId: zod_2.objectIdSchema.optional(),
    relatedProposalId: zod_2.objectIdSchema.optional(),
    relatedProjectId: zod_2.objectIdSchema.optional(),
    relatedDeliverableId: zod_2.objectIdSchema.optional(),
    relatedPaymentId: zod_2.objectIdSchema.optional(),
});
const createNotificationZodSchema = notificationZodSchema.omit({ isRead: true });
const updateNotificationZodSchema = zod_1.z
    .object({
    isRead: zod_1.z.boolean().optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
const notificationMongooseSchema = new mongoose_1.default.Schema({
    recipientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient ID is required'],
        index: true,
    },
    type: {
        type: String,
        required: [true, 'Notification type is required'],
        trim: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true,
    },
    relatedJobId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Job',
    },
    relatedProposalId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Proposal',
    },
    relatedProjectId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Project',
    },
    relatedDeliverableId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Deliverable',
    },
    relatedPaymentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Payment',
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
notificationMongooseSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationMongooseSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
const Notification = mongoose_1.default.model('Notification', notificationMongooseSchema);
exports.notificationZodSchemas = {
    schema: notificationZodSchema,
    create: createNotificationZodSchema,
    update: updateNotificationZodSchema,
};
exports.default = Notification;
