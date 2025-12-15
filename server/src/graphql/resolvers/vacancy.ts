import { Vacancy, Application } from '../../models';
import { GraphQLContext } from '../../types/context';
import { requireAuth, requireHR } from '../../middleware/auth';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import {
  validate,
  createVacancySchema,
  updateVacancySchema,
} from '../../utils/validators';

export interface VacancyFilters {
  status?: string;
  type?: string;
  search?: string;
  department?: string;
}

export const vacancyResolvers = {
  Query: {
    vacancies: async (
      _: unknown,
      args: { filters?: VacancyFilters; page?: number; limit?: number }
    ) => {
      const { filters = {}, page = 1, limit = 10 } = args;
      const skip = (page - 1) * limit;

      const query: Record<string, unknown> = { isDeleted: false };

      if (filters.status) {
        query.status = filters.status;
      } else {
        query.status = 'OPEN';
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.department) {
        query.department = filters.department;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      const [vacancies, total] = await Promise.all([
        Vacancy.find(query)
          .skip(skip)
          .limit(Math.min(limit, 50))
          .sort({ createdAt: -1 }),
        Vacancy.countDocuments(query),
      ]);

      return {
        vacancies,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },

    vacancy: async (_: unknown, args: { id: string }) => {
      const vacancy = await Vacancy.findOne({ _id: args.id, isDeleted: false });
      if (!vacancy) {
        throw new NotFoundError('Vacancy');
      }
      return vacancy;
    },

    myVacancies: async (
      _: unknown,
      args: { page?: number; limit?: number },
      context: GraphQLContext
    ) => {
      const user = requireHR(context);
      const { page = 1, limit = 10 } = args;
      const skip = (page - 1) * limit;

      const query = { createdBy: user.id, isDeleted: false };

      const [vacancies, total] = await Promise.all([
        Vacancy.find(query)
          .skip(skip)
          .limit(Math.min(limit, 50))
          .sort({ createdAt: -1 }),
        Vacancy.countDocuments(query),
      ]);

      return {
        vacancies,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },
  },

  Mutation: {
    createVacancy: async (
      _: unknown,
      args: { input: Record<string, unknown> },
      context: GraphQLContext
    ) => {
      const user = requireHR(context);
      const validatedInput = validate(createVacancySchema, args.input);

      const vacancy = new Vacancy({
        ...validatedInput,
        createdBy: user.id,
      });

      await vacancy.save();
      return vacancy;
    },

    updateVacancy: async (
      _: unknown,
      args: { id: string; input: Record<string, unknown> },
      context: GraphQLContext
    ) => {
      const user = requireHR(context);
      const validatedInput = validate(updateVacancySchema, args.input);

      const vacancy = await Vacancy.findOne({ _id: args.id, isDeleted: false });

      if (!vacancy) {
        throw new NotFoundError('Vacancy');
      }

      if (vacancy.createdBy.toString() !== user.id) {
        throw new ForbiddenError('You can only update your own vacancies');
      }

      Object.assign(vacancy, validatedInput);
      await vacancy.save();

      return vacancy;
    },

    deleteVacancy: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const user = requireHR(context);

      const vacancy = await Vacancy.findOne({ _id: args.id, isDeleted: false });

      if (!vacancy) {
        throw new NotFoundError('Vacancy');
      }

      if (vacancy.createdBy.toString() !== user.id) {
        throw new ForbiddenError('You can only delete your own vacancies');
      }

      vacancy.isDeleted = true;
      await vacancy.save();

      return vacancy;
    },
  },

  Vacancy: {
    id: (parent: { _id: { toString: () => string } }) => parent._id.toString(),

    createdBy: async (
      parent: { createdBy: { toString: () => string } },
      _: unknown,
      context: GraphQLContext
    ) => {
      return context.loaders.userLoader.load(parent.createdBy.toString());
    },

    applicationCount: async (parent: { _id: { toString: () => string } }) => {
      return Application.countDocuments({
        vacancy: parent._id.toString(),
        isDeleted: false,
      });
    },
  },
};
