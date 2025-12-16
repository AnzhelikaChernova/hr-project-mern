'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { VACANCY_QUERY } from '@/graphql/queries';
import { UPDATE_VACANCY_MUTATION } from '@/graphql/mutations';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { Button, Input, Select } from '@/components/ui';
import Link from 'next/link';

const vacancySchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().min(10, 'Описание должно быть минимум 10 символов'),
  requirements: z.string().min(1, 'Добавьте хотя бы одно требование'),
  salaryMin: z.number().min(0, 'Минимальная зарплата должна быть положительной'),
  salaryMax: z.number().min(0, 'Максимальная зарплата должна быть положительной'),
  currency: z.string().default('USD'),
  location: z.string().min(1, 'Местоположение обязательно'),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE']),
  department: z.string().min(1, 'Отдел обязателен'),
  status: z.enum(['OPEN', 'CLOSED', 'DRAFT']),
});

type VacancyForm = z.infer<typeof vacancySchema>;

export default function EditVacancyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const isHR = user?.role === 'HR';

  const { data, loading: queryLoading } = useQuery(VACANCY_QUERY, {
    variables: { id: params.id },
  });

  const [updateVacancy, { loading: updating }] = useMutation(UPDATE_VACANCY_MUTATION, {
    onCompleted: (data) => {
      addNotification({ type: 'success', message: 'Вакансия успешно обновлена!' });
      router.push(`/vacancies/${data.updateVacancy.id}`);
    },
    onError: (error) => {
      addNotification({ type: 'error', message: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<VacancyForm>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      type: 'FULL_TIME',
      status: 'OPEN',
      currency: 'USD',
    },
  });

  const vacancy = data?.vacancy;

  // Заполнение формы при загрузке данных
  useEffect(() => {
    if (vacancy) {
      reset({
        title: vacancy.title,
        description: vacancy.description,
        requirements: vacancy.requirements.join('\n'),
        salaryMin: vacancy.salary?.min || 0,
        salaryMax: vacancy.salary?.max || 0,
        currency: vacancy.salary?.currency || 'USD',
        location: vacancy.location,
        type: vacancy.type,
        department: vacancy.department,
        status: vacancy.status,
      });
    }
  }, [vacancy, reset]);

  const isOwner = isHR && vacancy?.createdBy?.id === user?.id;

  if (queryLoading) {
    return (
      <div className="max-w-3xl mx-auto">
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
      <div className="max-w-3xl mx-auto">
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
              <Button>Вернуться к вакансиям</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card">
          <div className="empty-state">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Доступ запрещен</h3>
            <p className="text-slate-500 mb-6">У вас нет прав для редактирования этой вакансии.</p>
            <Link href={`/vacancies/${params.id}`}>
              <Button>Посмотреть вакансию</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = (data: VacancyForm) => {
    const requirements = data.requirements.split('\n').filter((r) => r.trim());

    updateVacancy({
      variables: {
        id: params.id,
        input: {
          title: data.title,
          description: data.description,
          requirements,
          salary: {
            min: data.salaryMin,
            max: data.salaryMax,
            currency: data.currency,
          },
          location: data.location,
          type: data.type,
          department: data.department,
          status: data.status,
        },
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/vacancies/${params.id}`} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Редактировать вакансию</h1>
          </div>
          <p className="text-slate-500 ml-11">Обновите информацию о вакансии</p>
        </div>
        {isDirty && (
          <span className="badge bg-amber-50 text-amber-700 ring-1 ring-amber-600/10">
            Есть несохранённые изменения
          </span>
        )}
      </div>

      {/* Form */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Детали вакансии</h3>
            <p className="text-sm text-slate-500">Редактируйте информацию ниже</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Название вакансии"
            placeholder="Например: Senior Frontend Developer"
            error={errors.title?.message}
            {...register('title')}
          />

          <div>
            <label className="label">Описание</label>
            <textarea
              className={`input min-h-40 resize-none ${errors.description ? 'input-error' : ''}`}
              placeholder="Опишите роль, обязанности и преимущества..."
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="label">Требования (по одному на строку)</label>
            <textarea
              className={`input min-h-32 resize-none ${errors.requirements ? 'input-error' : ''}`}
              placeholder="5+ лет опыта с React&#10;Знание TypeScript&#10;Опыт с GraphQL"
              {...register('requirements')}
            />
            {errors.requirements && (
              <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">Каждое требование с новой строки</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Мин. зарплата"
              type="number"
              placeholder="80000"
              error={errors.salaryMin?.message}
              {...register('salaryMin', { valueAsNumber: true })}
            />
            <Input
              label="Макс. зарплата"
              type="number"
              placeholder="120000"
              error={errors.salaryMax?.message}
              {...register('salaryMax', { valueAsNumber: true })}
            />
            <Select
              label="Валюта"
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'GBP', label: 'GBP' },
                { value: 'KZT', label: 'KZT' },
              ]}
              {...register('currency')}
            />
          </div>

          <Input
            label="Местоположение"
            placeholder="Например: Алматы или Remote"
            error={errors.location?.message}
            {...register('location')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Тип работы"
              options={[
                { value: 'FULL_TIME', label: 'Полный день' },
                { value: 'PART_TIME', label: 'Частичная занятость' },
                { value: 'CONTRACT', label: 'Контракт' },
                { value: 'REMOTE', label: 'Удаленно' },
              ]}
              error={errors.type?.message}
              {...register('type')}
            />

            <Input
              label="Отдел"
              placeholder="Например: Разработка"
              error={errors.department?.message}
              {...register('department')}
            />
          </div>

          <Select
            label="Статус"
            options={[
              { value: 'OPEN', label: 'Открыта (видна кандидатам)' },
              { value: 'CLOSED', label: 'Закрыта (прием заявок закрыт)' },
              { value: 'DRAFT', label: 'Черновик (не видна)' },
            ]}
            {...register('status')}
          />

          {/* Кнопки */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            {/* Левая кнопка */}
            <Link
              href={`/vacancies/${params.id}`}
              className="px-5 py-2 text-blue-600 rounded-xl border border-blue-600 text-sm font-medium
                         transform hover:scale-105 hover:bg-blue-100 transition duration-500"
            >
              Отмена
            </Link>

            {/* Правая градиентная кнопка */}
            <button
              type="submit"
              disabled={!isDirty || updating}
              className="relative px-5 py-2 rounded-xl text-sm font-medium text-white overflow-hidden
                         flex items-center justify-center transform hover:scale-105 transition-transform duration-500"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 z-0"></span>
              <span className="relative z-10">Сохранить изменения</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
