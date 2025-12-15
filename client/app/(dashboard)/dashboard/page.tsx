'use client';

import { useQuery, useSubscription } from '@apollo/client';
import Link from 'next/link';
import { DASHBOARD_STATS_QUERY, MY_APPLICATIONS_QUERY, MY_VACANCIES_QUERY } from '@/graphql/queries';
import { APPLICATION_CREATED_SUBSCRIPTION, APPLICATION_STATUS_UPDATED_SUBSCRIPTION } from '@/graphql/subscriptions';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { StatusBadge, Button } from '@/components/ui';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const isHR = user?.role === 'HR';

  const { data: statsData, loading: statsLoading } = useQuery(DASHBOARD_STATS_QUERY);

  const { data: vacanciesData } = useQuery(MY_VACANCIES_QUERY, {
    variables: { page: 1, limit: 5 },
    skip: !isHR,
  });

  const { data: applicationsData } = useQuery(MY_APPLICATIONS_QUERY, {
    variables: { page: 1, limit: 5 },
    skip: isHR,
  });

  useSubscription(APPLICATION_CREATED_SUBSCRIPTION, {
    skip: !isHR,
    onData: ({ data }) => {
      if (data?.data?.applicationCreated) {
        const app = data.data.applicationCreated;
        addNotification({
          type: 'info',
          message: `New application from ${app.candidate.fullName} for ${app.vacancy.title}`,
        });
      }
    },
  });

  useSubscription(APPLICATION_STATUS_UPDATED_SUBSCRIPTION, {
    variables: { candidateId: user?.id },
    skip: isHR,
    onData: ({ data }) => {
      if (data?.data?.applicationStatusUpdated) {
        const app = data.data.applicationStatusUpdated;
        addNotification({
          type: 'info',
          message: `Your application for ${app.vacancy.title} status changed to ${app.status}`,
        });
      }
    },
  });

  const stats = statsData?.dashboardStats;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            {isHR ? 'Overview of your recruitment activities' : 'Track your job search progress'}
          </p>
        </div>
        {isHR && (
          <Link href="/vacancies/new">
            <Button className="w-full sm:w-auto">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Post New Vacancy
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={isHR ? 'Total Vacancies' : 'Available Jobs'}
          value={stats?.totalVacancies ?? 0}
          icon={<BriefcaseIcon />}
          gradient="from-blue-500 to-blue-600"
          loading={statsLoading}
        />
        <StatCard
          title="Open Positions"
          value={stats?.openVacancies ?? 0}
          icon={<CheckIcon />}
          gradient="from-emerald-500 to-teal-500"
          loading={statsLoading}
        />
        <StatCard
          title={isHR ? 'Total Applications' : 'My Applications'}
          value={stats?.totalApplications ?? 0}
          icon={<DocumentIcon />}
          gradient="from-violet-500 to-purple-500"
          loading={statsLoading}
        />
        <StatCard
          title="Upcoming Interviews"
          value={stats?.scheduledInterviews ?? 0}
          icon={<CalendarIcon />}
          gradient="from-amber-500 to-orange-500"
          loading={statsLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Section - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {isHR ? (
            <RecentVacancies vacancies={vacanciesData?.myVacancies?.vacancies || []} />
          ) : (
            <RecentApplications applications={applicationsData?.myApplications?.applications || []} />
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          <QuickActions isHR={isHR} />
          <ActivityFeed isHR={isHR} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  loading: boolean;
}) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? (
              <span className="inline-block w-12 h-8 skeleton rounded" />
            ) : (
              value.toLocaleString()
            )}
          </p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center text-sm">
          <span className="text-emerald-600 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +12%
          </span>
          <span className="text-slate-400 ml-2">from last month</span>
        </div>
      </div>
    </div>
  );
}

function RecentVacancies({ vacancies }: { vacancies: any[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Recent Vacancies</h2>
          <p className="text-sm text-slate-500">Your latest job postings</p>
        </div>
        <Link href="/vacancies" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          View all
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {vacancies.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BriefcaseIcon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-900 font-medium">No vacancies yet</p>
          <p className="text-slate-500 text-sm mt-1 mb-4">Create your first job posting</p>
          <Link href="/vacancies/new">
            <Button size="sm">Post Vacancy</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vacancies.map((vacancy: any) => (
            <Link key={vacancy.id} href={`/vacancies/${vacancy.id}`}>
              <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {vacancy.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        {vacancy.applicationCount} applicants
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={vacancy.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentApplications({ applications }: { applications: any[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Applications</h2>
          <p className="text-sm text-slate-500">Track your application progress</p>
        </div>
        <Link href="/applications" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          View all
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <DocumentIcon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-900 font-medium">No applications yet</p>
          <p className="text-slate-500 text-sm mt-1 mb-4">Start applying to jobs today</p>
          <Link href="/vacancies">
            <Button size="sm">Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any) => (
            <Link key={app.id} href={`/applications/${app.id}`}>
              <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {app.vacancy.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {app.vacancy.createdBy?.company || 'Company'}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickActions({ isHR }: { isHR: boolean }) {
  const actions = isHR
    ? [
        { href: '/vacancies/new', icon: <PlusIcon />, label: 'Post Vacancy', desc: 'Create new job' },
        { href: '/applications', icon: <DocumentIcon />, label: 'Applications', desc: 'Review candidates' },
        { href: '/interviews', icon: <CalendarIcon />, label: 'Interviews', desc: 'Manage schedule' },
      ]
    : [
        { href: '/vacancies', icon: <SearchIconSmall />, label: 'Find Jobs', desc: 'Browse openings' },
        { href: '/profile', icon: <UserIcon />, label: 'My Profile', desc: 'Update info' },
        { href: '/applications', icon: <DocumentIcon />, label: 'Applications', desc: 'Track status' },
      ];

  return (
    <div className="card">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
      <div className="space-y-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                {action.icon}
              </div>
              <div>
                <p className="font-medium text-slate-900">{action.label}</p>
                <p className="text-xs text-slate-500">{action.desc}</p>
              </div>
              <svg className="w-5 h-5 text-slate-300 ml-auto group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed({ isHR }: { isHR: boolean }) {
  return (
    <div className="card">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
          <div>
            <p className="text-sm text-slate-700">
              {isHR ? 'New application received' : 'Application submitted'}
            </p>
            <p className="text-xs text-slate-400">2 hours ago</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
          <div>
            <p className="text-sm text-slate-700">
              {isHR ? 'Interview scheduled' : 'Profile updated'}
            </p>
            <p className="text-xs text-slate-400">Yesterday</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
          <div>
            <p className="text-sm text-slate-700">
              {isHR ? 'Vacancy status changed' : 'New job matches found'}
            </p>
            <p className="text-xs text-slate-400">2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function BriefcaseIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DocumentIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function CalendarIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function SearchIconSmall() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}
