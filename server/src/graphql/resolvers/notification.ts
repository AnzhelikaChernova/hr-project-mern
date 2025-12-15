import { Notification, User, Application, Vacancy, Interview } from '../../models';
import { GraphQLContext } from '../../types/context';
import { requireAuth } from '../../middleware/auth';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { pubsub } from './application';

export const NOTIFICATION_RECEIVED = 'NOTIFICATION_RECEIVED';

export const notificationResolvers = {
  Query: {
    notifications: async (
      _: unknown,
      args: { limit?: number; offset?: number; unreadOnly?: boolean },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      const { limit = 20, offset = 0, unreadOnly = false } = args;

      const query: Record<string, unknown> = {
        recipient: user.id,
        isDeleted: false,
      };

      if (unreadOnly) {
        query.read = false;
      }

      const notifications = await Notification.find(query)
        .skip(offset)
        .limit(Math.min(limit, 50))
        .sort({ createdAt: -1 });

      return notifications;
    },

    notificationCount: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const [total, unread] = await Promise.all([
        Notification.countDocuments({ recipient: user.id, isDeleted: false }),
        Notification.countDocuments({ recipient: user.id, read: false, isDeleted: false }),
      ]);

      return { total, unread };
    },
  },

  Mutation: {
    markNotificationAsRead: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const notification = await Notification.findOne({
        _id: args.id,
        isDeleted: false,
      });

      if (!notification) {
        throw new NotFoundError('Notification');
      }

      if (notification.recipient.toString() !== user.id) {
        throw new ForbiddenError('You can only modify your own notifications');
      }

      notification.read = true;
      await notification.save();

      return notification;
    },

    markAllNotificationsAsRead: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const result = await Notification.updateMany(
        { recipient: user.id, read: false, isDeleted: false },
        { read: true }
      );

      return result.modifiedCount;
    },

    deleteNotification: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);

      const notification = await Notification.findOne({
        _id: args.id,
        isDeleted: false,
      });

      if (!notification) {
        throw new NotFoundError('Notification');
      }

      if (notification.recipient.toString() !== user.id) {
        throw new ForbiddenError('You can only delete your own notifications');
      }

      notification.isDeleted = true;
      await notification.save();

      return notification;
    },
  },

  Subscription: {
    notificationReceived: {
      subscribe: (_: unknown, args: { recipientId: string }) => {
        const iterator = pubsub.asyncIterator([NOTIFICATION_RECEIVED]);
        return {
          [Symbol.asyncIterator]: () => ({
            async next(): Promise<IteratorResult<unknown>> {
              const result = await iterator.next();

              if (result.value?.notificationReceived?.recipient?.toString() === args.recipientId) {
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
      },
    },
  },

  Notification: {
    id: (parent: { _id: { toString: () => string } }) => parent._id.toString(),

    recipient: async (
      parent: { recipient: { toString: () => string } },
      _: unknown,
      context: GraphQLContext
    ) => {
      return context.loaders.userLoader.load(parent.recipient.toString());
    },

    relatedApplication: async (
      parent: { relatedApplication?: { toString: () => string } }
    ) => {
      if (!parent.relatedApplication) return null;
      return Application.findById(parent.relatedApplication.toString());
    },

    relatedVacancy: async (
      parent: { relatedVacancy?: { toString: () => string } }
    ) => {
      if (!parent.relatedVacancy) return null;
      return Vacancy.findById(parent.relatedVacancy.toString());
    },

    relatedInterview: async (
      parent: { relatedInterview?: { toString: () => string } }
    ) => {
      if (!parent.relatedInterview) return null;
      return Interview.findById(parent.relatedInterview.toString());
    },
  },
};

// Helper function to create notifications
export async function createNotification(data: {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  relatedApplicationId?: string;
  relatedVacancyId?: string;
  relatedInterviewId?: string;
}) {
  const notification = new Notification({
    recipient: data.recipientId,
    type: data.type,
    title: data.title,
    message: data.message,
    relatedApplication: data.relatedApplicationId,
    relatedVacancy: data.relatedVacancyId,
    relatedInterview: data.relatedInterviewId,
  });

  await notification.save();

  // Publish to subscription
  pubsub.publish(NOTIFICATION_RECEIVED, {
    notificationReceived: notification,
  });

  return notification;
}
