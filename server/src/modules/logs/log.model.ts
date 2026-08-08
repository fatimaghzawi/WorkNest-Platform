import mongoose from 'mongoose';

const LOG_LEVELS = ['info', 'warning', 'error'] as const;

const logMongooseSchema = new mongoose.Schema(
  {
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
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

logMongooseSchema.index({ createdAt: -1 });
logMongooseSchema.index({ level: 1, createdAt: -1 });
logMongooseSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const Log = mongoose.model('Log', logMongooseSchema);

export { LOG_LEVELS };
export default Log;
