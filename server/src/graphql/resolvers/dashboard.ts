import { Vacancy, Application, Interview } from '../../models';
import { GraphQLContext } from '../../types/context';
import { requireAuth } from '../../middleware/auth';

export const dashboardResolvers = {
  Query: {
    dashboardStats: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const user = requireAuth(context);

      if (user.role === 'HR') {
        const [
          totalVacancies,
          openVacancies,
          totalApplications,
          pendingApplications,
          scheduledInterviews,
        ] = await Promise.all([
          Vacancy.countDocuments({ createdBy: user.id, isDeleted: false }),
          Vacancy.countDocuments({
            createdBy: user.id,
            isDeleted: false,
            status: 'OPEN',
          }),
          Application.countDocuments({ isDeleted: false }),
          Application.countDocuments({ isDeleted: false, status: 'PENDING' }),
          Interview.countDocuments({
            interviewers: user.id,
            isDeleted: false,
            status: 'SCHEDULED',
            scheduledAt: { $gte: new Date() },
          }),
        ]);

        return {
          totalVacancies,
          openVacancies,
          totalApplications,
          pendingApplications,
          scheduledInterviews,
        };
      }

      const applications = await Application.find({
        candidate: user.id,
        isDeleted: false,
      }).select('_id status');

      const applicationIds = applications.map((app) => app._id);
      const pendingCount = applications.filter(
        (app) => app.status === 'PENDING'
      ).length;

      const [openVacancies, scheduledInterviews] = await Promise.all([
        Vacancy.countDocuments({ isDeleted: false, status: 'OPEN' }),
        Interview.countDocuments({
          application: { $in: applicationIds },
          isDeleted: false,
          status: 'SCHEDULED',
          scheduledAt: { $gte: new Date() },
        }),
      ]);

      return {
        totalVacancies: openVacancies,
        openVacancies,
        totalApplications: applications.length,
        pendingApplications: pendingCount,
        scheduledInterviews,
      };
    },
  },
};
