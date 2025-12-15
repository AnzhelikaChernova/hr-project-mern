import mongoose, { Document, Schema, Model } from 'mongoose';

export type Recommendation = 'HIRE' | 'NO_HIRE' | 'MAYBE';

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId;
  interview: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  rating: number;
  technicalSkills: number;
  communication: number;
  cultureFit: number;
  comments: string;
  recommendation: Recommendation;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IFeedbackModel extends Model<IFeedback> {
  findByInterview(interviewId: string): mongoose.Query<IFeedback[], IFeedback>;
  getAverageRating(interviewId: string): Promise<number>;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    interview: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: [true, 'Interview is required'],
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be at least 1'] as [number, string],
      max: [5, 'Rating cannot exceed 5'] as [number, string],
    },
    technicalSkills: {
      type: Number,
      required: [true, 'Technical skills rating is required'],
      min: [1, 'Rating must be at least 1'] as [number, string],
      max: [5, 'Rating cannot exceed 5'] as [number, string],
    },
    communication: {
      type: Number,
      required: [true, 'Communication rating is required'],
      min: [1, 'Rating must be at least 1'] as [number, string],
      max: [5, 'Rating cannot exceed 5'] as [number, string],
    },
    cultureFit: {
      type: Number,
      required: [true, 'Culture fit rating is required'],
      min: [1, 'Rating must be at least 1'] as [number, string],
      max: [5, 'Rating cannot exceed 5'] as [number, string],
    },
    comments: {
      type: String,
      required: [true, 'Comments are required'],
      minlength: [10, 'Comments must be at least 10 characters'],
      maxlength: [5000, 'Comments cannot exceed 5000 characters'],
    },
    recommendation: {
      type: String,
      enum: ['HIRE', 'NO_HIRE', 'MAYBE'],
      required: [true, 'Recommendation is required'],
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

feedbackSchema.index({ interview: 1, author: 1 }, { unique: true });

feedbackSchema.statics.findByInterview = function (interviewId: string) {
  return this.find({ interview: interviewId, isDeleted: false }).sort({ createdAt: -1 });
};

feedbackSchema.statics.getAverageRating = async function (interviewId: string): Promise<number> {
  const result = await this.aggregate([
    {
      $match: {
        interview: new mongoose.Types.ObjectId(interviewId),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  return result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
};

const Feedback = mongoose.model<IFeedback, IFeedbackModel>('Feedback', feedbackSchema);

export default Feedback;
