import mongoose from 'mongoose';
import { z } from 'zod';
import { objectIdSchema, nonEmptyString } from './shared/zod';

const workspaceAttachmentZodSchema = z.object({
  jobId: objectIdSchema,
  uploadedBy: objectIdSchema,
  fileName: nonEmptyString('File name'),
  fileUrl: nonEmptyString('File URL'),
  mimeType: nonEmptyString('MIME type'),
  fileSize: z.number().int().positive(),
  caption: z.string().trim().max(200).optional(),
});

const workspaceAttachmentMongooseSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [1, 'File size must be positive'],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [200, 'Caption cannot exceed 200 characters'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

workspaceAttachmentMongooseSchema.index({ jobId: 1, createdAt: -1 });

const WorkspaceAttachment = mongoose.model('WorkspaceAttachment', workspaceAttachmentMongooseSchema);

export const workspaceAttachmentZodSchemas = {
  schema: workspaceAttachmentZodSchema,
};

export default WorkspaceAttachment;
