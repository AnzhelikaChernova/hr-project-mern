import Link from "next/link";
import { StatusBadge } from "./Badge";
import { ArrowRight } from 'lucide-react';
export function RecentVacancies({ vacancies }: { vacancies: any[] }) {
  return (
    <div className="p-5 bg-white/80 rounded-xl ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-900">Недавние вакансии</h2>
        <Link href="/vacancies" className="text-blue-600 text-sm flex items-center gap-1">
          Смотреть все <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      {vacancies.length === 0 ? (
        <div className="text-slate-500 text-center py-6">Вакансий пока нет</div>
      ) : (
        <div className="space-y-3">
          {vacancies.map(v => (
            <Link key={v.id} href={`/vacancies/${v.id}`}>
              <div className="p-3 border border-slate-200 m-3 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition flex justify-between items-center">
                <div className="truncate">
                  <p className="font-semibold text-slate-900 truncate">{v.title}</p>
                  <p className="text-sm text-slate-500">{v.applicationCount} откликов</p>
                </div>
                <StatusBadge status={v.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecentApplications({ applications }: { applications: any[] }) {
  return (
    <div className="p-5 bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-900">Мои отклики</h2>
        <Link href="/applications" className="text-blue-600 text-sm flex items-center gap-1">
          Смотреть все <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      {applications.length === 0 ? (
        <div className="text-slate-500 text-center py-6">Пока нет откликов</div>
      ) : (
        <div className="space-y-3">
          {applications.map(a => (
            <Link key={a.id} href={`/applications/${a.id}`}>
              <div className="p-3 border border-slate-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition flex justify-between items-center">
                <div className="truncate">
                  <p className="font-semibold text-slate-900 truncate">{a.vacancy.title}</p>
                  <p className="text-sm text-slate-500">{a.vacancy.createdBy?.company || 'Компания'}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}