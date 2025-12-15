'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { MY_INTERVIEWS_QUERY } from '@/graphql/queries';
import { useAuthStore } from '@/lib/stores/auth';
import { StatusBadge } from '@/components/ui';

export default function InterviewsPage() {
  const { user } = useAuthStore();
  const isHR = user?.role === 'HR';

  const { data, loading } = useQuery(MY_INTERVIEWS_QUERY);

  const interviews = data?.myInterviews || [];

  const upcomingInterviews = interviews.filter(
    (i: any) => i.status === 'SCHEDULED' && new Date(i.scheduledAt) >= new Date()
  );
  const pastInterviews = interviews.filter(
    (i: any) => i.status !== 'SCHEDULED' || new Date(i.scheduledAt) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isHR ? 'Interviews' : 'My Interviews'}
        </h1>
        <p className="text-slate-500 mt-1">
          {isHR
            ? 'Schedule and manage candidate interviews'
            : 'View your upcoming and past interviews'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{upcomingInterviews.length}</p>
            <p className="text-xs text-slate-500">Upcoming</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {pastInterviews.filter((i: any) => i.status === 'COMPLETED').length}
            </p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{interviews.length}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Upcoming Interviews</h2>
              <p className="text-sm text-slate-500">{upcomingInterviews.length} scheduled</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading interviews...</p>
          </div>
        ) : upcomingInterviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
              </svg>
            </div>
            <h3 className="text-slate-900 font-medium mb-1">No upcoming interviews</h3>
            <p className="text-sm text-slate-500">Your scheduled interviews will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingInterviews.map((interview: any) => (
              <InterviewCard key={interview.id} interview={interview} isHR={isHR} isUpcoming />
            ))}
          </div>
        )}
      </div>

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Past Interviews</h2>
              <p className="text-sm text-slate-500">{pastInterviews.length} completed</p>
            </div>
          </div>
          <div className="space-y-4">
            {pastInterviews.map((interview: any) => (
              <InterviewCard key={interview.id} interview={interview} isHR={isHR} isUpcoming={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewCard({
  interview,
  isHR,
  isUpcoming,
}: {
  interview: any;
  isHR: boolean;
  isUpcoming: boolean;
}) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        );
      case 'PHONE':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        );
      case 'ONSITE':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'bg-purple-50 text-purple-700 ring-purple-600/10';
      case 'PHONE':
        return 'bg-blue-50 text-blue-700 ring-blue-600/10';
      case 'ONSITE':
        return 'bg-amber-50 text-amber-700 ring-amber-600/10';
      default:
        return 'bg-slate-100 text-slate-600 ring-slate-500/10';
    }
  };

  return (
    <Link href={`/applications/${interview.application.id}`}>
      <div className={`group p-4 rounded-xl border-2 transition-all hover:shadow-md ${
        isUpcoming
          ? 'border-blue-200 bg-blue-50/30 hover:border-blue-300'
          : 'border-slate-200 hover:border-slate-300'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Date/Time Block */}
          <div className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
            isUpcoming ? 'bg-blue-100' : 'bg-slate-100'
          }`}>
            <span className={`text-2xl font-bold ${isUpcoming ? 'text-blue-600' : 'text-slate-600'}`}>
              {new Date(interview.scheduledAt).getDate()}
            </span>
            <span className={`text-xs font-medium uppercase ${isUpcoming ? 'text-blue-500' : 'text-slate-500'}`}>
              {new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}
            </span>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {interview.application.vacancy.title}
              </h3>
              <StatusBadge status={interview.status} />
            </div>

            {isHR && (
              <p className="text-sm text-slate-600 mb-2">
                Candidate: <span className="font-medium">{interview.application.candidate.fullName}</span>
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(interview.scheduledAt)} ({interview.duration} min)
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {interview.location}
              </span>
            </div>
          </div>

          {/* Type Badge & Arrow */}
          <div className="flex items-center gap-3">
            <span className={`badge ring-1 flex items-center gap-1.5 ${getTypeColor(interview.type)}`}>
              {getTypeIcon(interview.type)}
              {interview.type}
            </span>
            <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
