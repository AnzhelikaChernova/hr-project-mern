import mongoose, { Document, Schema, Model } from 'mongoose';

export type InterviewType = 'PHONE' | 'VIDEO' | 'ONSITE';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface IInterview extends Document {
  _id: mongoose.Types.ObjectId;
  application: mongoose.Types.ObjectId;
  scheduledAt: Date;
  duration: number;
  type: InterviewType;
  location: string;
  status: InterviewStatus;
  interviewers: mongoose.Types.ObjectId[];
  notes: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IInterviewModel extends Model<IInterview> {
  findByApplication(applicationId: string): mongoose.Query<IInterview[], IInterview>;
  findUpcoming(): mongoose.Query<IInterview[], IInterview>;
}

const interviewSchema = new Schema<IInterview>(
  {
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application is required'],
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
      default: 60,
    },
    type: {
      type: String,
      enum: ['PHONE', 'VIDEO', 'ONSITE'],
      required: [true, 'Interview type is required'],
    },
    location: {
      type: String,
      required: [true, 'Location/link is required'],
      trim: true,
      maxlength: [500, 'Location cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    interviewers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      validate: {
        validator: (v: mongoose.Types.ObjectId[]) => v.length > 0,
        message: 'At least one interviewer is required',
      },
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
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

interviewSchema.statics.findByApplication = function (applicationId: string) {
  return this.find({ application: applicationId, isDeleted: false }).sort({ scheduledAt: 1 });
};

interviewSchema.statics.findUpcoming = function () {
  return this.find({
    scheduledAt: { $gte: new Date() },
    status: 'SCHEDULED',
    isDeleted: false,
  }).sort({ scheduledAt: 1 });
};

interviewSchema.index({ status: 1, scheduledAt: 1 });

const Interview = mongoose.model<IInterview, IInterviewModel>('Interview', interviewSchema);

export default Interview;
