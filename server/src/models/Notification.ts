import mongoose, { Document, Schema, Model } from 'mongoose';

export type NotificationType =
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_STATUS_UPDATED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_REMINDER'
  | 'FEEDBACK_RECEIVED';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedApplication?: mongoose.Types.ObjectId;
  relatedVacancy?: mongoose.Types.ObjectId;
  relatedInterview?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface INotificationModel extends Model<INotification> {
  findByRecipient(recipientId: string): mongoose.Query<INotification[], INotification>;
  findUnread(recipientId: string): mongoose.Query<INotification[], INotification>;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    type: {
      type: String,
      enum: [
        'APPLICATION_RECEIVED',
        'APPLICATION_STATUS_UPDATED',
        'INTERVIEW_SCHEDULED',
        'INTERVIEW_REMINDER',
        'FEEDBACK_RECEIVED',
      ],
      required: [true, 'Notification type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedApplication: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    relatedVacancy: {
      type: Schema.Types.ObjectId,
      ref: 'Vacancy',
    },
    relatedInterview: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

notificationSchema.statics.findByRecipient = function (recipientId: string) {
  return this.find({ recipient: recipientId, isDeleted: false }).sort({ createdAt: -1 });
};

notificationSchema.statics.findUnread = function (recipientId: string) {
  return this.find({ recipient: recipientId, read: false, isDeleted: false }).sort({ createdAt: -1 });
};

const Notification = mongoose.model<INotification, INotificationModel>(
  'Notification',
  notificationSchema
);

export default Notification;
