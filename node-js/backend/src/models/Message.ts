import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  content?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  sender: mongoose.Types.ObjectId;
  channel: mongoose.Types.ObjectId;
  isEdited: boolean;
  editedAt?: Date;
  replyTo?: mongoose.Types.ObjectId;
  reactions: Array<{
    emoji: string;
    users: mongoose.Types.ObjectId[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    content: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    imageUrl: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    reactions: [{
      emoji: {
        type: String,
        required: true,
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
    }],
  },
  {
    timestamps: true,
  }
);

// Validate that message has either content or image/file
messageSchema.pre('save', function (next) {
  if (!this.content && !this.imageUrl && !this.fileUrl) {
    next(new Error('Message must have either content, image, or file'));
  } else {
    next();
  }
});

// Indexes for better performance
messageSchema.index({ channel: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
