"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceAttachmentZodSchemas = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const workspaceAttachmentZodSchema = zod_1.z.object({
    jobId: zod_2.objectIdSchema,
    taskId: zod_2.objectIdSchema.optional().nullable(),
    uploadedBy: zod_2.objectIdSchema,
    fileName: (0, zod_2.nonEmptyString)('File name'),
    fileUrl: (0, zod_2.nonEmptyString)('File URL'),
    mimeType: (0, zod_2.nonEmptyString)('MIME type'),
    fileSize: zod_1.z.number().int().positive(),
    caption: zod_1.z.string().trim().max(200).optional(),
});
const workspaceAttachmentMongooseSchema = new mongoose_1.default.Schema({
    jobId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Job',
        required: [true, 'Job ID is required'],
        index: true,
    },
    taskId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Task',
        default: null,
        index: true,
    },
    uploadedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
workspaceAttachmentMongooseSchema.index({ jobId: 1, createdAt: -1 });
workspaceAttachmentMongooseSchema.index({ jobId: 1, taskId: 1, createdAt: -1 });
const WorkspaceAttachment = mongoose_1.default.model('WorkspaceAttachment', workspaceAttachmentMongooseSchema);
exports.workspaceAttachmentZodSchemas = {
    schema: workspaceAttachmentZodSchema,
};
exports.default = WorkspaceAttachment;
