import { Feedback, Interview } from '../../models';
import { GraphQLContext } from '../../types/context';
import { requireAuth, requireHR } from '../../middleware/auth';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors';
import { validate, submitFeedbackSchema } from '../../utils/validators';

export const feedbackResolvers = {
  Query: {
    feedbacks: async (
      _: unknown,
      args: { interviewId: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);

      return Feedback.find({
        interview: args.interviewId,
        isDeleted: false,
      }).sort({ createdAt: -1 });
    },

    feedback: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);

      const feedback = await Feedback.findOne({
        _id: args.id,
        isDeleted: false,
      });

      if (!feedback) {
        throw new NotFoundError('Feedback');
      }

      return feedback;
    },
  },

  Mutation: {
    submitFeedback: async (
      _: unknown,
      args: { input: Record<string, unknown> },
      context: GraphQLContext
    ) => {
      const user = requireHR(context);
      const validatedInput = validate(submitFeedbackSchema, args.input);

      const interview = await Interview.findOne({
        _id: validatedInput.interviewId,
        isDeleted: false,
      });

      if (!interview) {
        throw new NotFoundError('Interview');
      }

      const isInterviewer = interview.interviewers.some(
        (id) => id.toString() === user.id
      );

      if (!isInterviewer) {
        throw new ForbiddenError(
          'Only interviewers can submit feedback for this interview'
        );
      }

      const existingFeedback = await Feedback.findOne({
        interview: validatedInput.interviewId,
        author: user.id,
        isDeleted: false,
      });

      if (existingFeedback) {
        throw new ConflictError(
          'You have already submitted feedback for this interview'
        );
      }

      const feedback = new Feedback({
        interview: validatedInput.interviewId,
        author: user.id,
        rating: validatedInput.rating,
        technicalSkills: validatedInput.technicalSkills,
        communication: validatedInput.communication,
        cultureFit: validatedInput.cultureFit,
        comments: validatedInput.comments,
        recommendation: validatedInput.recommendation,
      });

      await feedback.save();

      return feedback;
    },

    updateFeedback: async (
      _: unknown,
      args: { id: string; input: Record<string, unknown> },
      context: GraphQLContext
    ) => {
      const user = requireHR(context);
      const validatedInput = validate(submitFeedbackSchema, args.input);

      const feedback = await Feedback.findOne({
        _id: args.id,
        isDeleted: false,
      });

      if (!feedback) {
        throw new NotFoundError('Feedback');
      }

      if (feedback.author.toString() !== user.id) {
        throw new ForbiddenError('You can only update your own feedback');
      }

      feedback.rating = validatedInput.rating;
      feedback.technicalSkills = validatedInput.technicalSkills;
      feedback.communication = validatedInput.communication;
      feedback.cultureFit = validatedInput.cultureFit;
      feedback.comments = validatedInput.comments;
      feedback.recommendation = validatedInput.recommendation;

      await feedback.save();

      return feedback;
    },

    deleteFeedback: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const user = requireHR(context);

      const feedback = await Feedback.findOne({
        _id: args.id,
        isDeleted: false,
      });

      if (!feedback) {
        throw new NotFoundError('Feedback');
      }

      if (feedback.author.toString() !== user.id) {
        throw new ForbiddenError('You can only delete your own feedback');
      }

      feedback.isDeleted = true;
      await feedback.save();

      return feedback;
    },
  },

  Feedback: {
    id: (parent: { _id: { toString: () => string } }) => parent._id.toString(),

    interview: async (
      parent: { interview: { toString: () => string } },
      _: unknown,
      context: GraphQLContext
    ) => {
      return context.loaders.interviewLoader.load(parent.interview.toString());
    },

    author: async (
      parent: { author: { toString: () => string } },
      _: unknown,
      context: GraphQLContext
    ) => {
      return context.loaders.userLoader.load(parent.author.toString());
    },
  },
};
