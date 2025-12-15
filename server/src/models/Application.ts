import mongoose, { Document, Schema, Model } from 'mongoose';

export type ApplicationStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'REJECTED'
  | 'ACCEPTED';

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  vacancy: mongoose.Types.ObjectId;
  candidate: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  coverLetter: string;
  resume: string;
  appliedAt: Date;
  notes: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IApplicationModel extends Model<IApplication> {
  findByVacancy(vacancyId: string): mongoose.Query<IApplication[], IApplication>;
  findByCandidate(candidateId: string): mongoose.Query<IApplication[], IApplication>;
}

const applicationSchema = new Schema<IApplication>(
  {
    vacancy: {
      type: Schema.Types.ObjectId,
      ref: 'Vacancy',
      required: [true, 'Vacancy is required'],
      index: true,
    },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'REJECTED', 'ACCEPTED'],
      default: 'PENDING',
      index: true,
    },
    coverLetter: {
      type: String,
      maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
      default: '',
    },
    resume: {
      type: String,
      required: [true, 'Resume URL is required'],
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      index: true,
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

applicationSchema.index({ vacancy: 1, candidate: 1 }, { unique: true });

applicationSchema.statics.findByVacancy = function (vacancyId: string) {
  return this.find({ vacancy: vacancyId, isDeleted: false }).sort({ appliedAt: -1 });
};

applicationSchema.statics.findByCandidate = function (candidateId: string) {
  return this.find({ candidate: candidateId, isDeleted: false }).sort({ appliedAt: -1 });
};

applicationSchema.index({ status: 1, appliedAt: -1 });

const Application = mongoose.model<IApplication, IApplicationModel>(
  'Application',
  applicationSchema
);

export default Application;
