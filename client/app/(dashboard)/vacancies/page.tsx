'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { VACANCIES_QUERY } from '@/graphql/queries';
import { useAuthStore } from '@/lib/stores/auth';
import { Button, Input, Select, StatusBadge } from '@/components/ui';
import {Plus } from 'lucide-react'
import { VacancyCard } from '@/components/ui/VacancyCard';
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
            {'Вакансии'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isHR ? 'Управляйте вашими вакансиями' : 'Find your next opportunity'}
          </p>
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

      {/* Search & Filter Card */}
      <div className="">
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


