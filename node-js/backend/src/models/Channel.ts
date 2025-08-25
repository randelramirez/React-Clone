import mongoose from 'mongoose';

export interface IChannel extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isPrivate: boolean;
  isDirectMessage: boolean;
  members: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new mongoose.Schema<IChannel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isDirectMessage: {
      type: Boolean,
      default: false,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better performance
channelSchema.index({ members: 1 });
channelSchema.index({ createdBy: 1 });
channelSchema.index({ isDirectMessage: 1, members: 1 });

export const Channel = mongoose.model<IChannel>('Channel', channelSchema);
