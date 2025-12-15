import { PubSub } from 'graphql-subscriptions';
import { Application, Vacancy, Interview, Notification, User } from '../../models';
import { GraphQLContext } from '../../types/context';
import { requireAuth, requireHR, requireCandidate } from '../../middleware/auth';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors';
import {
  validate,
  applyToVacancySchema,
  updateApplicationSchema,
} from '../../utils/validators';

export const NOTIFICATION_RECEIVED = 'NOTIFICATION_RECEIVED';

export const pubsub = new PubSub();

export const APPLICATION_CREATED = 'APPLICATION_CREATED';
export const APPLICATION_STATUS_UPDATED = 'APPLICATION_STATUS_UPDATED';

export interface ApplicationFilters {
  vacancyId?: string;
  candidateId?: string;
  status?: string;
}

export const applicationResolvers = {
  Query: {
    applications: async (
      _: unknown,
      args: { filters?: ApplicationFilters; page?: number; limit?: number },
      context: GraphQLContext
    ) => {
      requireHR(context);
      const { filters = {}, page = 1, limit = 10 } = args;
      const skip = (page - 1) * limit;

      const query: Record<string, unknown> = { isDeleted: false };

      if (filters.vacancyId) {
        query.vacancy = filters.vacancyId;
      }

      if (filters.candidateId) {
        query.candidate = filters.candidateId;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const [applications, total] = await Promise.all([
        Application.find(query)
          .skip(skip)
          .limit(Math.min(limit, 50))
          .sort({ appliedAt: -1 }),
        Application.countDocuments(query),
      ]);

      return {
        applications,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },

    application: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const application = await Application.findOne({
        _id: args.id,
        isDeleted: false,
      });

      if (!application) {
        throw new NotFoundError('Application');
      }

      if (
        user.role === 'CANDIDATE' &&
        application.candidate.toString() !== user.id
      ) {
        throw new ForbiddenError('You can only view your own applications');
      }

      return application;
    },

    myApplications: async (
      _: unknown,
      args: { page?: number; limit?: number },
      context: GraphQLContext
    ) => {
      const user = requireCandidate(context);
      const { page = 1, limit = 10 } = args;
      const skip = (page - 1) * limit;

      const query = { candidate: user.id, isDeleted: false };

      const [applications, total] = await Promise.all([
        Application.find(query)
          .skip(skip)
          .limit(Math.min(limit, 50))
          .sort({ appliedAt: -1 }),
        Application.countDocuments(query),
      ]);

      return {
        applications,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },
  },

  Mutation: {
    applyToVacancy: async (
      _: unknown,
      args: { input: Record<string, unknown> },
      context: GraphQLContext
    ) => {
      const user = requireCandidate(context);
      const validatedInput = validate(applyToVacancySchema, args.input);

      const vacancy = await Vacancy.findOne({
        _id: validatedInput.vacancyId,
        isDeleted: false,
        status: 'OPEN',
      });

      if (!vacancy) {
        throw new NotFoundError('Vacancy');
      }

      const existingApplication = await Application.findOne({
        vacancy: validatedInput.vacancyId,
        candidate: user.id,
        isDeleted: false,
      });

      if (existingApplication) {
        throw new ConflictError('You have already applied to this vacancy');
      }

      const application = new Application({
        vacancy: validatedInput.vacancyId,
        candidate: user.id,
        coverLetter: validatedInput.coverLetter,
        resume: validatedInput.resume,
      });

      await application.save();

      pubsub.publish(APPLICATION_CREATED, {
        applicationCreated: application,
      });

      // Create notification for HR who posted the vacancy
      const hrUser = await User.findById(vacancy.createdBy);
      if (hrUser) {
        const candidateUser = await User.findById(user.id);
        const candidateName = candidateUser
          ? `${candidateUser.firstName} ${candidateUser.lastName}`
          : 'A candidate';
        const notification = new Notification({
          recipient: hrUser._id,
          type: 'APPLICATION_RECEIVED',
          title: 'New Application',
          message: `${candidateName} applied for ${vacancy.title}`,
          relatedApplication: application._id,
          relatedVacancy: vacancy._id,
        });
        await notification.save();
        pubsub.publish(NOTIFICATION_RECEIVED, {
          notificationReceived: notification,
        });
      }

      return application;
    },

    updateApplication: async (
      _: unknown,
      args: { id: string; input: Record<string, unknown> },
      context: GraphQLContext
    ) => {
      requireHR(context);
      const validatedInput = validate(updateApplicationSchema, args.input);

      const application = await Application.findOne({
        _id: args.id,
        isDeleted: false,
      });

      if (!application) {
        throw new NotFoundError('Application');
      }

      const previousStatus = application.status;
      Object.assign(application, validatedInput);
      await application.save();

      if (validatedInput.status && validatedInput.status !== previousStatus) {
        pubsub.publish(APPLICATION_STATUS_UPDATED, {
          applicationStatusUpdated: application,
        });

        // Create notification for candidate
        const vacancy = await Vacancy.findById(application.vacancy);
        const statusLabels: Record<string, string> = {
          PENDING: 'Pending',
          REVIEWING: 'Under Review',
          INTERVIEW: 'Interview Stage',
          OFFERED: 'Offer Extended',
          REJECTED: 'Not Selected',
          ACCEPTED: 'Accepted',
        };

        const notification = new Notification({
          recipient: application.candidate,
          type: 'APPLICATION_STATUS_UPDATED',
          title: 'Application Status Updated',
          message: `Your application for ${vacancy?.title || 'the position'} is now "${statusLabels[validatedInput.status] || validatedInput.status}"`,
          relatedApplication: application._id,
          relatedVacancy: application.vacancy,
        });
        await notification.save();
        pubsub.publish(NOTIFICATION_RECEIVED, {
          notificationReceived: notification,
        });
      }

      return application;
    },

    withdrawApplication: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const user = requireCandidate(context);

      const application = await Application.findOne({
        _id: args.id,
        isDeleted: false,
      });

      if (!application) {
        throw new NotFoundError('Application');
      }

      if (application.candidate.toString() !== user.id) {
        throw new ForbiddenError('You can only withdraw your own applications');
      }

      application.isDeleted = true;
      await application.save();

      return application;
    },
  },

  Subscription: {
    applicationCreated: {
      subscribe: (_: unknown, args: { vacancyId?: string }) => {
        if (args.vacancyId) {
          const iterator = pubsub.asyncIterator([APPLICATION_CREATED]);
          return {
            [Symbol.asyncIterator]: () => ({
              async next(): Promise<IteratorResult<unknown>> {
                const result = await iterator.next();

                if (result.value?.applicationCreated?.vacancy?.toString() === args.vacancyId) {
                  return result;
                }
                return this.next();
              },
              return(): Promise<IteratorResult<unknown>> {
                return Promise.resolve({ value: undefined, done: true });
              },
              throw(error: Error): Promise<never> {
                return Promise.reject(error);
              },
            }),
          };
        }
        return pubsub.asyncIterator([APPLICATION_CREATED]);
      },
    },

    applicationStatusUpdated: {
      subscribe: (_: unknown, args: { candidateId?: string }) => {
        if (args.candidateId) {
          const iterator = pubsub.asyncIterator([APPLICATION_STATUS_UPDATED]);
          return {
            [Symbol.asyncIterator]: () => ({
              async next(): Promise<IteratorResult<unknown>> {
                const result = await iterator.next();

                if (result.value?.applicationStatusUpdated?.candidate?.toString() === args.candidateId) {
                  return result;
                }
                return this.next();
              },
              return(): Promise<IteratorResult<unknown>> {
                return Promise.resolve({ value: undefined, done: true });
              },
              throw(error: Error): Promise<never> {
                return Promise.reject(error);
              },
            }),
          };
        }
        return pubsub.asyncIterator([APPLICATION_STATUS_UPDATED]);
      },
    },
  },

  Application: {
    id: (parent: { _id: { toString: () => string } }) => parent._id.toString(),

    vacancy: async (
      parent: { vacancy: { toString: () => string } },
      _: unknown,
      context: GraphQLContext
    ) => {
      return context.loaders.vacancyLoader.load(parent.vacancy.toString());
    },

    candidate: async (
      parent: { candidate: { toString: () => string } },
      _: unknown,
      context: GraphQLContext
    ) => {
      return context.loaders.userLoader.load(parent.candidate.toString());
    },

    interviews: async (parent: { _id: { toString: () => string } }) => {
      return Interview.find({
        application: parent._id.toString(),
        isDeleted: false,
      }).sort({ scheduledAt: 1 });
    },
  },
};
