'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { VACANCY_QUERY, APPLICATIONS_QUERY } from '@/graphql/queries';
import { APPLY_TO_VACANCY_MUTATION, DELETE_VACANCY_MUTATION } from '@/graphql/mutations';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { Button, StatusBadge, Input } from '@/components/ui';
import Link from 'next/link';

export default function VacancyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const isHR = user?.role === 'HR';
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [resume, setResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const { data, loading } = useQuery(VACANCY_QUERY, {
    variables: { id: params.id },
  });

  const { data: applicationsData } = useQuery(APPLICATIONS_QUERY, {
    variables: { filters: { vacancyId: params.id }, page: 1, limit: 50 },
    skip: !isHR,
  });

  const [applyToVacancy, { loading: applying }] = useMutation(APPLY_TO_VACANCY_MUTATION, {
    onCompleted: () => {
      addNotification({ type: 'success', message: 'Application submitted successfully!' });
      setShowApplyForm(false);
      router.push('/applications');
    },
    onError: (error) => {
      addNotification({ type: 'error', message: error.message });
    },
  });

  const [deleteVacancy, { loading: deleting }] = useMutation(DELETE_VACANCY_MUTATION, {
    onCompleted: () => {
      addNotification({ type: 'success', message: 'Vacancy deleted' });
      router.push('/vacancies');
    },
    onError: (error) => {
      addNotification({ type: 'error', message: error.message });
    },
  });

  const vacancy = data?.vacancy;
  const applications = applicationsData?.applications?.applications || [];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading vacancy...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="empty-state">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Vacancy not found</h3>
            <p className="text-slate-500 mb-6">The vacancy you're looking for doesn't exist or has been removed.</p>
            <Link href="/vacancies">
              <Button>Back to Vacancies</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatSalary = (salary: any) => {
    if (!salary) return 'Not specified';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency || 'USD',
      maximumFractionDigits: 0,
    });
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  const handleApply = () => {
    applyToVacancy({
      variables: {
        input: {
          vacancyId: vacancy.id,
          resume,
          coverLetter,
        },
      },
    });
  };

  const isOwner = isHR && vacancy.createdBy?.id === user?.id;

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-3">
        <Link href="/vacancies" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <span className="text-slate-500">Back to vacancies</span>
      </div>

      {/* Main Card */}
      <div className="card overflow-hidden">
        {/* Header with gradient */}
        <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 -mx-6 -mt-6 mb-6 relative">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="vacancy-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#vacancy-pattern)" />
            </svg>
          </div>
        </div>

        {/* Company Logo & Title */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 -mt-16 mb-6 px-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white shadow-xl flex-shrink-0">
            {vacancy.createdBy?.company?.[0] || 'C'}
          </div>
          <div className="flex-1 pt-8 sm:pt-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{vacancy.title}</h1>
              <StatusBadge status={vacancy.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500">
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
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2 sm:pt-4">
              <Link href={`/vacancies/${vacancy.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                loading={deleting}
                onClick={() => {
                  if (confirm('Are you sure you want to delete this vacancy?')) {
                    deleteVacancy({ variables: { id: vacancy.id } });
                  }
                }}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-slate-500 uppercase font-medium">Salary</p>
            </div>
            <p className="font-semibold text-slate-900">{formatSalary(vacancy.salary)}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-xs text-slate-500 uppercase font-medium">Type</p>
            </div>
            <span className={`badge ring-1 ${getTypeColor(vacancy.type)}`}>
              {vacancy.type.replace('_', ' ')}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
              <p className="text-xs text-slate-500 uppercase font-medium">Department</p>
            </div>
            <p className="font-semibold text-slate-900">{vacancy.department}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-xs text-slate-500 uppercase font-medium">Applications</p>
            </div>
            <p className="font-semibold text-slate-900">{vacancy.applicationCount || 0}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Job Description
          </h2>
          <div className="text-slate-700 whitespace-pre-line leading-relaxed">{vacancy.description}</div>
        </div>

        {/* Requirements */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Requirements
          </h2>
          <ul className="space-y-2">
            {vacancy.requirements.map((req: string, index: number) => (
              <li key={index} className="flex items-start gap-3 text-slate-700">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Apply Section for Candidates */}
        {!isHR && vacancy.status === 'OPEN' && (
          <div className="border-t border-slate-200 pt-6">
            {showApplyForm ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Apply for this position</h3>
                    <p className="text-sm text-slate-500">Submit your application below</p>
                  </div>
                </div>
                <Input
                  label="Resume URL"
                  placeholder="https://example.com/your-resume.pdf"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                />
                <div>
                  <label className="label">Cover Letter (Optional)</label>
                  <textarea
                    className="input min-h-32 resize-none"
                    placeholder="Tell us why you're a great fit for this role..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleApply} loading={applying} disabled={!resume}>
                    Submit Application
                  </Button>
                  <Button variant="outline" onClick={() => setShowApplyForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setShowApplyForm(true)} className="w-full gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                Apply Now
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Applications Section for HR */}
      {isHR && applications.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Applications</h2>
              <p className="text-sm text-slate-500">{applications.length} candidate(s) applied</p>
            </div>
          </div>
          <div className="space-y-3">
            {applications.map((app: any) => (
              <Link key={app.id} href={`/applications/${app.id}`}>
                <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {app.candidate?.firstName?.[0]}{app.candidate?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{app.candidate.fullName}</p>
                      <p className="text-sm text-slate-500">{app.candidate.email}</p>
                    </div>
                    <StatusBadge status={app.status} />
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
