import { Request, Response } from 'express';
import DataLoader from 'dataloader';
import { IUser } from '../models/User';
import { IVacancy } from '../models/Vacancy';
import { IApplication } from '../models/Application';
import { IInterview } from '../models/Interview';
import { IFeedback } from '../models/Feedback';

export interface AuthUser {
  id: string;
  email: string;
  role: 'HR' | 'CANDIDATE';
}

export interface GraphQLContext {
  req: Request;
  res: Response;
  user: AuthUser | null;
  loaders: {
    userLoader: DataLoader<string, IUser | null>;
    vacancyLoader: DataLoader<string, IVacancy | null>;
    applicationLoader: DataLoader<string, IApplication | null>;
    interviewLoader: DataLoader<string, IInterview | null>;
    feedbackLoader: DataLoader<string, IFeedback | null>;
  };
}

export interface SubscriptionContext {
  user: AuthUser | null;
}
