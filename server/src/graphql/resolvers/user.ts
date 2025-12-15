import { User } from '../../models';
import { GraphQLContext } from '../../types/context';
import { generateToken, requireAuth } from '../../middleware/auth';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '../../utils/errors';
import {
  validate,
  registerSchema,
  loginSchema,
  updateUserSchema,
} from '../../utils/validators';

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const authUser = requireAuth(context);
      const user = await User.findById(authUser.id);
      if (!user || user.isDeleted) {
        throw new NotFoundError('User');
      }
      return user;
    },

    users: async (
      _: unknown,
      args: { role?: string; search?: string; limit?: number; offset?: number },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      const { role, search, limit = 20, offset = 0 } = args;

      const filter: Record<string, unknown> = { isDeleted: false };

      if (role) {
        filter.role = role;
      }

      if (search) {
        filter.$text = { $search: search };
      }

      return User.find(filter)
        .skip(offset)
        .limit(Math.min(limit, 100))
        .sort({ createdAt: -1 });
    },

    user: async (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireAuth(context);
      const user = await User.findOne({ _id: args.id, isDeleted: false });
      if (!user) {
        throw new NotFoundError('User');
      }
      return user;
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      args: { input: Record<string, unknown> }
    ) => {
      const validatedInput = validate(registerSchema, args.input);

      const existingUser = await User.findOne({
        email: validatedInput.email.toLowerCase(),
      });

      if (existingUser) {
        throw new ConflictError('Email already registered');
      }

      const user = new User(validatedInput);
      await user.save();

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return { token, user };
    },

    login: async (_: unknown, args: { input: Record<string, unknown> }) => {
      const validatedInput = validate(loginSchema, args.input);

      const user = await User.findByEmail(validatedInput.email);

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      const isValidPassword = await user.comparePassword(validatedInput.password);

      if (!isValidPassword) {
        throw new AuthenticationError('Invalid email or password');
      }

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return { token, user };
    },

    updateUser: async (
      _: unknown,
      args: { input: Record<string, unknown> },
      context: GraphQLContext
    ) => {
      const authUser = requireAuth(context);
      const validatedInput = validate(updateUserSchema, args.input);

      const user = await User.findByIdAndUpdate(
        authUser.id,
        { $set: validatedInput },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new NotFoundError('User');
      }

      return user;
    },

    deleteUser: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const authUser = requireAuth(context);

      const user = await User.findByIdAndUpdate(
        authUser.id,
        { $set: { isDeleted: true } },
        { new: true }
      );

      if (!user) {
        throw new NotFoundError('User');
      }

      return user;
    },
  },

  User: {
    id: (parent: { _id: { toString: () => string } }) => parent._id.toString(),
    fullName: (parent: { firstName: string; lastName: string }) =>
      `${parent.firstName} ${parent.lastName}`,
  },
};
