import mongoose, { Document, Schema, Model } from 'mongoose';

export type VacancyType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'REMOTE';
export type VacancyStatus = 'OPEN' | 'CLOSED' | 'DRAFT';

export interface ISalary {
  min: number;
  max: number;
  currency: string;
}

export interface IVacancy extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requirements: string[];
  salary: ISalary;
  location: string;
  type: VacancyType;
  status: VacancyStatus;
  createdBy: mongoose.Types.ObjectId;
  department: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IVacancyModel extends Model<IVacancy> {
  findActive(): mongoose.Query<IVacancy[], IVacancy>;
}

const salarySchema = new Schema(
  {
    min: {
      type: Number,
      required: true,
      min: 0,
    },
    max: {
      type: Number,
      required: true,
      validate: {
        validator: function (this: { min: number }, value: number): boolean {
          return value >= this.min;
        },
        message: 'Maximum salary must be greater than or equal to minimum salary',
      },
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
      maxlength: 3,
    },
  },
  { _id: false }
);

const vacancySchema = new Schema<IVacancy>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    requirements: {
      type: [String],
      required: [true, 'At least one requirement is needed'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one requirement is needed',
      },
    },
    salary: {
      type: salarySchema,
      required: [true, 'Salary information is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE'],
      required: [true, 'Job type is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'DRAFT'],
      default: 'DRAFT',
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
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

vacancySchema.statics.findActive = function () {
  return this.find({ isDeleted: false, status: 'OPEN' });
};

vacancySchema.index({ title: 'text', description: 'text', department: 'text' });
vacancySchema.index({ status: 1, isDeleted: 1, createdAt: -1 });

const Vacancy = mongoose.model<IVacancy, IVacancyModel>('Vacancy', vacancySchema);

export default Vacancy;
