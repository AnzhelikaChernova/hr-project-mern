'use client';

import { useQuery, useSubscription } from '@apollo/client';
import Link from 'next/link';
import { DASHBOARD_STATS_QUERY, MY_APPLICATIONS_QUERY, MY_VACANCIES_QUERY } from '@/graphql/queries';
import { APPLICATION_CREATED_SUBSCRIPTION, APPLICATION_STATUS_UPDATED_SUBSCRIPTION } from '@/graphql/subscriptions';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { StatCard } from '@/components/ui/StatCard';
import { QuickActions } from '@/components/ui/QuickActions';
import { RecentApplications, RecentVacancies } from '@/components/ui/Recent';
import { Briefcase, CheckCircle, FileText, Calendar, Plus, Search, User, ArrowRight } from 'lucide-react';
// --- Главная страница ---
export default function DashboardPage() {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const isHR = user?.role === 'HR';

  const { data: statsData, loading: statsLoading } = useQuery(DASHBOARD_STATS_QUERY);
  const { data: vacanciesData } = useQuery(MY_VACANCIES_QUERY, { variables: { page: 1, limit: 5 }, skip: !isHR });
  const { data: applicationsData } = useQuery(MY_APPLICATIONS_QUERY, { variables: { page: 1, limit: 5 }, skip: isHR });

  useSubscription(APPLICATION_CREATED_SUBSCRIPTION, {
    skip: !isHR,
    onData: ({ data }) => {
      const app = data?.data?.applicationCreated;
      if (app) addNotification({ type: 'info', message: `Новая заявка от ${app.candidate.fullName} на позицию ${app.vacancy.title}` });
    },
  });

  useSubscription(APPLICATION_STATUS_UPDATED_SUBSCRIPTION, {
    variables: { candidateId: user?.id },
    skip: isHR,
    onData: ({ data }) => {
      const app = data?.data?.applicationStatusUpdated;
      if (app) addNotification({ type: 'info', message: `Статус вашей заявки на ${app.vacancy.title} изменен на ${app.status}` });
    },
  });

  const stats = statsData?.dashboardStats;

  return (
    <div className="space-y-8 animate-fade-in px-4 md:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Панель управления</h1>
        <p className="text-slate-500 mt-1">{isHR ? 'Обзор ваших рекрутинговых действий' : 'Отслеживание прогресса поиска работы'}</p>
      </div>
      {isHR && (
        <Link
          href="/vacancies/new"
          className="flex items-center px-5 py-2 text-blue-600 rounded-xl border border-blue-600 text-sm font-medium
                            transform hover:scale-105 hover:bg-blue-100 transition duration-500">
          <Plus className="w-5 h-5 mr-2" /> Новая вакансия
        </Link>
      )}
    </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Вакансии" value={stats?.totalVacancies ?? 0} Icon={Briefcase} loading={statsLoading} />
        <StatCard title="Позиции" value={stats?.openVacancies ?? 0} Icon={CheckCircle} loading={statsLoading} />
        <StatCard title="Отклики" value={stats?.totalApplications ?? 0} Icon={FileText} loading={statsLoading} />
        <StatCard title="Собеседования" value={stats?.scheduledInterviews ?? 0} Icon={Calendar} loading={statsLoading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isHR
            ? <RecentVacancies vacancies={vacanciesData?.myVacancies?.vacancies || []} />
            : <RecentApplications applications={applicationsData?.myApplications?.applications || []} />
          }
        </div>
        <div className="space-y-6">
          <QuickActions isHR={isHR} />
        </div>
      </div>
    </div>
  );
}


