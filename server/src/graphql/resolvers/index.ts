import { userResolvers } from './user';
import { vacancyResolvers } from './vacancy';
import { applicationResolvers } from './application';
import { interviewResolvers } from './interview';
import { feedbackResolvers } from './feedback';
import { dashboardResolvers } from './dashboard';
import { notificationResolvers } from './notification';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...vacancyResolvers.Query,
    ...applicationResolvers.Query,
    ...interviewResolvers.Query,
    ...feedbackResolvers.Query,
    ...dashboardResolvers.Query,
    ...notificationResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...vacancyResolvers.Mutation,
    ...applicationResolvers.Mutation,
    ...interviewResolvers.Mutation,
    ...feedbackResolvers.Mutation,
    ...notificationResolvers.Mutation,
  },
  Subscription: {
    ...applicationResolvers.Subscription,
    ...interviewResolvers.Subscription,
    ...notificationResolvers.Subscription,
  },
  User: userResolvers.User,
  Vacancy: vacancyResolvers.Vacancy,
  Application: applicationResolvers.Application,
  Interview: interviewResolvers.Interview,
  Feedback: feedbackResolvers.Feedback,
  Notification: notificationResolvers.Notification,
};

export { pubsub } from './application';
export { createNotification } from './notification';
