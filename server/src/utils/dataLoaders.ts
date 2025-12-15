import DataLoader from 'dataloader';
import { User, Vacancy, Application, Interview, Feedback } from '../models';
import { IUser } from '../models/User';
import { IVacancy } from '../models/Vacancy';
import { IApplication } from '../models/Application';
import { IInterview } from '../models/Interview';
import { IFeedback } from '../models/Feedback';

const batchUsers = async (ids: readonly string[]): Promise<(IUser | null)[]> => {
  const users = await User.find({ _id: { $in: ids }, isDeleted: false });
  const userMap = new Map(users.map(user => [user._id.toString(), user]));
  return ids.map(id => userMap.get(id) || null);
};

const batchVacancies = async (ids: readonly string[]): Promise<(IVacancy | null)[]> => {
  const vacancies = await Vacancy.find({ _id: { $in: ids }, isDeleted: false });
  const vacancyMap = new Map(vacancies.map(vacancy => [vacancy._id.toString(), vacancy]));
  return ids.map(id => vacancyMap.get(id) || null);
};

const batchApplications = async (ids: readonly string[]): Promise<(IApplication | null)[]> => {
  const applications = await Application.find({ _id: { $in: ids }, isDeleted: false });
  const applicationMap = new Map(applications.map(app => [app._id.toString(), app]));
  return ids.map(id => applicationMap.get(id) || null);
};

const batchInterviews = async (ids: readonly string[]): Promise<(IInterview | null)[]> => {
  const interviews = await Interview.find({ _id: { $in: ids }, isDeleted: false });
  const interviewMap = new Map(interviews.map(interview => [interview._id.toString(), interview]));
  return ids.map(id => interviewMap.get(id) || null);
};

const batchFeedbacks = async (ids: readonly string[]): Promise<(IFeedback | null)[]> => {
  const feedbacks = await Feedback.find({ _id: { $in: ids }, isDeleted: false });
  const feedbackMap = new Map(feedbacks.map(feedback => [feedback._id.toString(), feedback]));
  return ids.map(id => feedbackMap.get(id) || null);
};

export const createLoaders = () => ({
  userLoader: new DataLoader(batchUsers),
  vacancyLoader: new DataLoader(batchVacancies),
  applicationLoader: new DataLoader(batchApplications),
  interviewLoader: new DataLoader(batchInterviews),
  feedbackLoader: new DataLoader(batchFeedbacks),
});

export type Loaders = ReturnType<typeof createLoaders>;
