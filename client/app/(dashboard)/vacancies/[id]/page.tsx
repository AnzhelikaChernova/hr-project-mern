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

  const { data, loading } = useQuery(VACANCY_QUERY, { variables: { id: params.id } });
  const { data: applicationsData } = useQuery(APPLICATIONS_QUERY, {
    variables: { filters: { vacancyId: params.id }, page: 1, limit: 50 },
    skip: !isHR,
  });

  const [applyToVacancy, { loading: applying }] = useMutation(APPLY_TO_VACANCY_MUTATION, {
    onCompleted: () => {
      addNotification({ type: 'success', message: 'Заявка успешно отправлена!' });
      setShowApplyForm(false);
      router.push('/applications');
    },
    onError: (error) => {
      addNotification({ type: 'error', message: error.message });
    },
  });

  const [deleteVacancy, { loading: deleting }] = useMutation(DELETE_VACANCY_MUTATION, {
    onCompleted: () => {
      addNotification({ type: 'success', message: 'Вакансия удалена' });
      router.push('/vacancies');
    },
    onError: (error) => {
      addNotification({ type: 'error', message: error.message });
    },
  });

  const vacancy = data?.vacancy;
  const applications = applicationsData?.applications?.applications || [];
  const isOwner = isHR && vacancy?.createdBy?.id === user?.id;

  const formatSalary = (salary: any) => {
    if (!salary) return 'Не указано';
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
            <p className="text-slate-500">Загрузка вакансии...</p>
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Вакансия не найдена</h3>
            <p className="text-slate-500 mb-6">Искомая вакансия не существует или была удалена.</p>
            <Link href="/vacancies">
              <Button>Назад к вакансиям</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Назад */}
      <div className="flex items-center gap-3">
        <Link href="/vacancies" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <span className="text-slate-500">Назад к вакансиям</span>
      </div>

      {/* Основной блок */}
      <div className="card overflow-hidden mb-12">

        {/* Компания и действия */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 -mt-18 mb-6 px-6">
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
                {vacancy.createdBy?.company || 'Компания'}
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

          {/* Кнопки редактирования и удаления */}
          {isOwner && (
            <div className="flex gap-2 sm:pt-4">
              <Link href={`/vacancies/${vacancy.id}/edit`}>
                <button
                  className="px-5 py-2 text-blue-600 rounded-xl border border-blue-600 text-sm font-medium
                             transform hover:scale-105 hover:bg-blue-100 transition duration-500"
                >
                  Редактировать
                </button>
              </Link>
              <button
                onClick={() => {
                  if (confirm('Вы уверены, что хотите удалить эту вакансию?')) {
                    deleteVacancy({ variables: { id: vacancy.id } });
                  }
                }}
                disabled={deleting}
                className="px-5 py-2 text-red-600 rounded-xl border border-red-600 text-sm font-medium
                           transform hover:scale-105 hover:bg-red-100 transition duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Удалить
              </button>
            </div>
          )}
        </div>

        {/* Карточки информации */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-medium">Зарплата</p>
            <p className="font-semibold text-slate-900">{formatSalary(vacancy.salary)}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-medium">Тип работы</p>
            <span className={`badge ring-1 ${getTypeColor(vacancy.type)}`}>
              {vacancy.type.replace('_', ' ')}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-medium">Отдел</p>
            <p className="font-semibold text-slate-900">{vacancy.department}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-medium">Заявки</p>
            <p className="font-semibold text-slate-900">{vacancy.applicationCount || 0}</p>
          </div>
        </div>

        {/* Описание вакансии */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Описание вакансии</h2>
          <div className="text-slate-700 whitespace-pre-line leading-relaxed">{vacancy.description}</div>
        </div>

        {/* Требования */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Требования</h2>
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

        {/* Раздел подачи заявки для кандидатов */}
        {!isHR && vacancy.status === 'OPEN' && (
          <div className="border-t border-slate-200 pt-6">
            {showApplyForm ? (
              <div className="space-y-4">
                <Input
                  label="Ссылка на резюме"
                  placeholder="https://example.com/ваше-резюме.pdf"
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                />
                <div>
                  <label className="label">Сопроводительное письмо (необязательно)</label>
                  <textarea
                    className="input min-h-32 resize-none"
                    placeholder="Расскажите, почему вы подходите на эту позицию..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleApply} loading={applying} disabled={!resume}>
                    Подать заявку
                  </Button>
                  <Button variant="outline" onClick={() => setShowApplyForm(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowApplyForm(true)}
                className="relative w-full px-5 py-2 rounded-xl text-sm font-medium text-white overflow-hidden
                          flex items-center justify-center transform hover:scale-105 transition-transform duration-500"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 z-0"></span>
                <span className="relative z-10">Подать заявку</span>
              </button>

            )}
          </div>
        )}

        {/* Раздел заявок для HR */}
        {isHR && applications.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Заявки ({applications.length})</h2>
            <div className="space-y-3">
              {applications.map((app: any) => (
                <Link key={app.id} href={`/applications/${app.id}`}>
                  <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white font-bold">
                      {app.candidate?.firstName?.[0]}{app.candidate?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{app.candidate.fullName}</p>
                      <p className="text-sm text-slate-500">{app.candidate.email}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
