'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { VACANCIES_QUERY } from '@/graphql/queries';
import { useAuthStore } from '@/lib/stores/auth';
import { Button, Input, Select, StatusBadge } from '@/components/ui';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'REMOTE', label: 'Remote' },
];

export default function VacanciesPage() {
  const { user } = useAuthStore();
  const isHR = user?.role === 'HR';
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading } = useQuery(VACANCIES_QUERY, {
    variables: {
      filters: {
        status: 'OPEN',
        ...(search && { search }),
        ...(type && { type }),
      },
      page,
      limit: 10,
    },
  });

  const vacancies = data?.vacancies?.vacancies || [];
  const totalPages = data?.vacancies?.totalPages || 1;
  const total = data?.vacancies?.total || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isHR ? 'Vacancies' : 'Browse Jobs'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isHR ? 'Manage your job postings' : 'Find your next opportunity'}
          </p>
        </div>
        {isHR && (
          <Link href="/vacancies/new">
            <Button className="gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Post New Vacancy
            </Button>
          </Link>
        )}
      </div>

      {/* Search & Filter Card */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              className="input pl-12"
              placeholder="Search by job title, company, or keywords..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex gap-3">
            <div className="w-48">
              <Select
                options={typeOptions}
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{vacancies.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{total}</span> vacancies
          </p>
          {(search || type) && (
            <button
              onClick={() => {
                setSearch('');
                setType('');
                setPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Vacancies List */}
      {loading ? (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading vacancies...</p>
          </div>
        </div>
      ) : vacancies.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No vacancies found</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              {search || type
                ? "Try adjusting your search filters to find more results"
                : isHR
                ? "You haven't posted any vacancies yet. Create your first job posting!"
                : "No open positions at the moment. Check back later!"}
            </p>
            {isHR && !search && !type && (
              <Link href="/vacancies/new">
                <Button>Post Your First Vacancy</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {vacancies.map((vacancy: any) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} isHR={isHR} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VacancyCard({ vacancy, isHR }: { vacancy: any; isHR: boolean }) {
  const formatSalary = (salary: any) => {
    if (!salary) return 'Salary not specified';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency || 'USD',
      maximumFractionDigits: 0,
    });
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FULL_TIME':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/10';
      case 'PART_TIME':
        return 'bg-amber-50 text-amber-700 ring-amber-600/10';
      case 'CONTRACT':
        return 'bg-purple-50 text-purple-700 ring-purple-600/10';
      case 'REMOTE':
        return 'bg-cyan-50 text-cyan-700 ring-cyan-600/10';
      default:
        return 'bg-slate-100 text-slate-600 ring-slate-500/10';
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Posted today';
    if (days === 1) return 'Posted yesterday';
    if (days < 7) return `Posted ${days} days ago`;
    if (days < 30) return `Posted ${Math.floor(days / 7)} weeks ago`;
    return `Posted ${Math.floor(days / 30)} months ago`;
  };

  return (
    <Link href={`/vacancies/${vacancy.id}`}>
      <div className="card-interactive group">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Company Logo Placeholder */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {vacancy.createdBy?.company?.[0] || 'C'}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {vacancy.title}
              </h3>
              <StatusBadge status={vacancy.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
                {vacancy.createdBy?.company || 'Company'}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {vacancy.location}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(vacancy.createdAt)}
              </span>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
              {vacancy.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge ring-1 ${getTypeColor(vacancy.type)}`}>
                {vacancy.type.replace('_', ' ')}
              </span>
              <span className="badge bg-slate-100 text-slate-600 ring-1 ring-slate-500/10">
                {vacancy.department}
              </span>
              <span className="badge bg-blue-50 text-blue-700 ring-1 ring-blue-600/10 font-semibold">
                {formatSalary(vacancy.salary)}
              </span>
            </div>
          </div>

          {/* Right Side - Application Count for HR */}
          {isHR && (
            <div className="lg:text-right flex lg:flex-col items-center lg:items-end gap-2 lg:gap-1">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <span className="text-xl font-bold text-blue-600">{vacancy.applicationCount || 0}</span>
              </div>
              <p className="text-xs text-slate-500">applications</p>
            </div>
          )}

          {/* Arrow Icon */}
          <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors">
            <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
