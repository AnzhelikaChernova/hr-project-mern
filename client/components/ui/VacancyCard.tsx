import Link from "next/link";
import { StatusBadge } from "./Badge";

export function VacancyCard({ vacancy, isHR }: { vacancy: any; isHR: boolean }) {
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