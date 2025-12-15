import { PubSub } from 'graphql-subscriptions';
import { Interview, Application, Feedback, Notification, Vacancy } from '../../models';
import { GraphQLContext } from '../../types/context';
import { requireAuth, requireHR } from '../../middleware/auth';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import {
  validate,
  scheduleInterviewSchema,
  updateInterviewSchema,
} from '../../utils/validators';

export const pubsub = new PubSub();
export const INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED';
export const NOTIFICATION_RECEIVED = 'NOTIFICATION_RECEIVED';

export const interviewResolvers = {
  Query: {
    interviews: async (
      _: unknown,
      args: { applicationId?: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);

      const query: Record<string, unknown> = { isDeleted: false };

      if (args.applicationId) {
        query.application = args.applicationId;
      }

      return Interview.find(query).sort({ scheduledAt: 1 });
    },

    interview: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);

      const interview = await Interview.findOne({
        _id: args.id,
        isDeleted: false,
      });

      if (!interview) {
        throw new NotFoundError('Interview');
      }

      return interview;
    },

    myInterviews: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const user = requireAuth(context);

      if (user.role === 'HR') {
        return Interview.find({
          interviewers: user.id,
          isDeleted: false,
          status: 'SCHEDULED',
        }).sort({ scheduledAt: 1 });
      }

      const applications = await Application.find({
        candidate: user.id,
        isDeleted: false,
      }).select('_id');

      const applicationIds = applications.map((app) => app._id);

      return Interview.find({
        application: { $in: applicationIds },
        isDeleted: false,
      }).sort({ scheduledAt: 1 });
    },
  },

  Mutation: {
    scheduleInterview: async (
      _: unknown,
      args: { input: Record<string, unknown> },
      context: GraphQLContext
    ) => {
      requireHR(context);
      const validatedInput = validate(scheduleInterviewSchema, args.input);

      const application = await Application.findOne({
        _id: validatedInput.applicationId,
        isDeleted: false,
      });

      if (!application) {
        throw new NotFoundError('Application');
      }

      application.status = 'INTERVIEW';
      await application.save();

      const interview = new Interview({
        application: validatedInput.applicationId,
        scheduledAt: new Date(validatedInput.scheduledAt),
        duration: validatedInput.duration,
        type: validatedInput.type,
        location: validatedInput.location,
        interviewers: validatedInput.interviewerIds,
        notes: validatedInput.notes,
      });

      await interview.save();

      pubsub.publish(INTERVIEW_SCHEDULED, {
        interviewScheduled: interview,
      });

      // Create notification for candidate
      const vacancy = await Vacancy.findById(application.vacancy);
      const interviewDate = new Date(validatedInput.scheduledAt);
      const dateStr = interviewDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const notification = new Notification({
        recipient: application.candidate,
        type: 'INTERVIEW_SCHEDULED',
        title: 'Interview Scheduled',
        message: `Interview for ${vacancy?.title || 'your application'} scheduled for ${dateStr}`,
        relatedApplication: application._id,
        relatedVacancy: application.vacancy,
        relatedInterview: interview._id,
      });
      await notification.save();
      pubsub.publish(NOTIFICATION_RECEIVED, {
        notificationReceived: notification,
      });

      return interview;
    },

    updateInterview: async (
      _: unknown,
      args: { id: string; input: Record<string, unknown> },
      context: GraphQLContext
    ) => {
      requireHR(context);
      const validatedInput = validate(updateInterviewSchema, args.input);

      const interview = await Interview.findOne({
        _id: args.id,
        isDeleted: false,
      });

      if (!interview) {
        throw new NotFoundError('Interview');
      }

      if (validatedInput.scheduledAt) {
        interview.scheduledAt = new Date(validatedInput.scheduledAt);
      }
      if (validatedInput.duration) {
        interview.duration = validatedInput.duration;
      }
      if (validatedInput.type) {
        interview.type = validatedInput.type;
      }
      if (validatedInput.location) {
        interview.location = validatedInput.location;
      }
      if (validatedInput.status) {
        interview.status = validatedInput.status;
      }
      if (validatedInput.interviewerIds) {
        interview.interviewers = validatedInput.interviewerIds.map(
          (id: string) => id as unknown as typeof interview.interviewers[0]
        );
      }
      if (validatedInput.notes !== undefined) {
        interview.notes = validatedInput.notes;
      }

      await interview.save();

      return interview;
    },

    cancelInterview: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      requireHR(context);

      const interview = await Interview.findOne({
        _id: args.id,
        isDeleted: false,
      });

      if (!interview) {
        throw new NotFoundError('Interview');
      }

      interview.status = 'CANCELLED';
      await interview.save();

      return interview;
    },
  },

  Subscription: {
    interviewScheduled: {
      subscribe: (_: unknown, args: { applicationId?: string }) => {
        if (args.applicationId) {
          const iterator = pubsub.asyncIterator([INTERVIEW_SCHEDULED]);
          return {
            [Symbol.asyncIterator]: () => ({
              async next(): Promise<IteratorResult<unknown>> {
                const result = await iterator.next();

                if (
                  result.value?.interviewScheduled?.application?.toString() ===
                  args.applicationId
                ) {
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
        return pubsub.asyncIterator([INTERVIEW_SCHEDULED]);
      },
    },
  },

  Interview: {
    id: (parent: { _id: { toString: () => string } }) => parent._id.toString(),

    application: async (
      parent: { application: { toString: () => string } },
      _: unknown,
      context: GraphQLContext
    ) => {
      return context.loaders.applicationLoader.load(
        parent.application.toString()
      );
    },

    interviewers: async (
      parent: { interviewers: Array<{ toString: () => string }> },
      _: unknown,
      context: GraphQLContext
    ) => {
      const interviewerIds = parent.interviewers.map((id) => id.toString());
      const users = await Promise.all(
        interviewerIds.map((id) => context.loaders.userLoader.load(id))
      );
      return users.filter(Boolean);
    },

    feedbacks: async (parent: { _id: { toString: () => string } }) => {
      return Feedback.find({
        interview: parent._id.toString(),
        isDeleted: false,
      });
    },
  },
};
