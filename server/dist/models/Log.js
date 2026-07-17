"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_LEVELS = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const LOG_LEVELS = ['info', 'warning', 'error'];
exports.LOG_LEVELS = LOG_LEVELS;
const logMongooseSchema = new mongoose_1.default.Schema({
    level: {
        type: String,
        enum: {
            values: LOG_LEVELS,
            message: 'Level must be info, warning, or error',
        },
        required: true,
        index: true,
    },
    message: {
        type: String,
        required: [true, 'Log message is required'],
        trim: true,
        maxlength: [2000, 'Log message cannot exceed 2000 characters'],
    },
    source: {
        type: String,
        required: true,
        trim: true,
        default: 'system',
        index: true,
    },
    category: {
        type: String,
        trim: true,
        default: 'general',
        index: true,
    },
    statusCode: {
        type: Number,
        min: 100,
        max: 599,
    },
    method: {
        type: String,
        trim: true,
        uppercase: true,
    },
    path: {
        type: String,
        trim: true,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    actorEmail: {
        type: String,
        trim: true,
        lowercase: true,
    },
    ip: {
        type: String,
        trim: true,
    },
    meta: {
        type: mongoose_1.default.Schema.Types.Mixed,
        default: null,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
logMongooseSchema.index({ createdAt: -1 });
logMongooseSchema.index({ level: 1, createdAt: -1 });
logMongooseSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
const Log = mongoose_1.default.model('Log', logMongooseSchema);
exports.default = Log;
