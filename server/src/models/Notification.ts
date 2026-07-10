import mongoose from 'mongoose';
import { z } from 'zod';
import { objectIdSchema, nonEmptyString } from './shared/zod';

const notificationZodSchema = z.object({
  recipientId: objectIdSchema,
  type: nonEmptyString('Type'),
  title: nonEmptyString('Title'),
  message: nonEmptyString('Message'),
  isRead: z.boolean().optional().default(false),
  relatedJobId: objectIdSchema.optional(),
  relatedProposalId: objectIdSchema.optional(),
  relatedProjectId: objectIdSchema.optional(),
  relatedDeliverableId: objectIdSchema.optional(),
  relatedPaymentId: objectIdSchema.optional(),
});

const createNotificationZodSchema = notificationZodSchema.omit({ isRead: true });

const updateNotificationZodSchema = z
  .object({
    isRead: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

const notificationMongooseSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    relatedProposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
    },
    relatedProjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    relatedDeliverableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deliverable',
    },
    relatedPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

notificationMongooseSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationMongooseSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const Notification = mongoose.model('Notification', notificationMongooseSchema);

export const notificationZodSchemas = {
  schema: notificationZodSchema,
  create: createNotificationZodSchema,
  update: updateNotificationZodSchema,
}
export default Notification;
