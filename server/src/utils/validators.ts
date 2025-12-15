import { z } from 'zod';
import { ValidationError } from './errors';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['HR', 'CANDIDATE']),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  company: z.string().optional(),
  position: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  company: z.string().optional(),
  position: z.string().optional(),
});

export const salarySchema = z.object({
  min: z.number().min(0, 'Minimum salary cannot be negative'),
  max: z.number().min(0, 'Maximum salary cannot be negative'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
}).refine(data => data.max >= data.min, {
  message: 'Maximum salary must be greater than or equal to minimum',
});

export const createVacancySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(10000),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  salary: salarySchema,
  location: z.string().min(1, 'Location is required').max(200),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE']),
  department: z.string().min(1, 'Department is required').max(100),
  status: z.enum(['OPEN', 'CLOSED', 'DRAFT']).optional(),
});

export const updateVacancySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(10000).optional(),
  requirements: z.array(z.string()).min(1).optional(),
  salary: salarySchema.optional(),
  location: z.string().min(1).max(200).optional(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE']).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'DRAFT']).optional(),
  department: z.string().min(1).max(100).optional(),
});

export const applyToVacancySchema = z.object({
  vacancyId: z.string().min(1, 'Vacancy ID is required'),
  coverLetter: z.string().max(5000).optional(),
  resume: z.string().min(1, 'Resume URL is required'),
});

export const updateApplicationSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'REJECTED', 'ACCEPTED']).optional(),
  notes: z.string().max(2000).optional(),
});

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  scheduledAt: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480),
  type: z.enum(['PHONE', 'VIDEO', 'ONSITE']),
  location: z.string().min(1, 'Location is required').max(500),
  interviewerIds: z.array(z.string()).min(1, 'At least one interviewer is required'),
  notes: z.string().max(2000).optional(),
});

export const updateInterviewSchema = z.object({
  scheduledAt: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
  duration: z.number().min(15).max(480).optional(),
  type: z.enum(['PHONE', 'VIDEO', 'ONSITE']).optional(),
  location: z.string().min(1).max(500).optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  interviewerIds: z.array(z.string()).min(1).optional(),
  notes: z.string().max(2000).optional(),
});

export const submitFeedbackSchema = z.object({
  interviewId: z.string().min(1, 'Interview ID is required'),
  rating: z.number().min(1).max(5),
  technicalSkills: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  cultureFit: z.number().min(1).max(5),
  comments: z.string().min(10, 'Comments must be at least 10 characters').max(5000),
  recommendation: z.enum(['HIRE', 'NO_HIRE', 'MAYBE']),
});

export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.errors.map(e => e.message).join(', ');
    throw new ValidationError(errorMessages);
  }

  return result.data;
};
