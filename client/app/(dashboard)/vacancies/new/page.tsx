'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { CREATE_VACANCY_MUTATION } from '@/graphql/mutations';
import { useUIStore } from '@/lib/stores/ui';
import { Button, Input, Select } from '@/components/ui';

const vacancySchema = z.object({
  title: z.string().min(1, 'Название вакансии обязательно'),
  description: z.string().min(10, 'Описание должно быть не менее 10 символов'),
  requirements: z.string().min(1, 'Необходимо указать хотя бы одно требование'),
  salaryMin: z.number().min(0, 'Минимальная зарплата должна быть положительной'),
  salaryMax: z.number().min(0, 'Максимальная зарплата должна быть положительной'),
  currency: z.string().default('USD'),
  location: z.string().min(1, 'Местоположение обязательно'),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE']),
  department: z.string().min(1, 'Отдел обязателен'),
  status: z.enum(['OPEN', 'DRAFT']),
});

type VacancyForm = z.infer<typeof vacancySchema>;

export default function NewVacancyPage() {
  const router = useRouter();
  const { addNotification } = useUIStore();

  const [createVacancy, { loading }] = useMutation(CREATE_VACANCY_MUTATION, {
    onCompleted: (data) => {
      addNotification({ type: 'success', message: 'Вакансия успешно создана!' });
      router.push(`/vacancies/${data.createVacancy.id}`);
    },
    onError: (error) => {
      addNotification({ type: 'error', message: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VacancyForm>({
    resolver: zodResolver(vacancySchema),
    defaultValues: {
      type: 'FULL_TIME',
      status: 'OPEN',
      currency: 'USD',
    },
  });

  const onSubmit = (data: VacancyForm) => {
    const requirements = data.requirements.split('\n').filter((r) => r.trim());

    createVacancy({
      variables: {
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
      {/* Заголовок */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link href="/vacancies" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Опубликовать новую вакансию</h1>
        </div>
        <p className="text-slate-500 ml-11">Создайте новую вакансию для подбора персонала</p>
      </div>

      {/* Форма */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Детали вакансии</h3>
            <p className="text-sm text-slate-500">Заполните информацию перед публикацией вакансии</p>
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
              placeholder="Опишите роль, обязанности и что делает её интересной..."
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="label">Требования (каждое с новой строки)</label>
            <textarea
              className={`input min-h-32 resize-none ${errors.requirements ? 'input-error' : ''}`}
              placeholder="5+ лет опыта с React&#10;Хорошее знание TypeScript&#10;Опыт с GraphQL"
              {...register('requirements')}
            />
            {errors.requirements && (
              <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">Введите каждое требование с новой строки</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Минимальная зарплата"
              type="number"
              placeholder="80000"
              error={errors.salaryMin?.message}
              {...register('salaryMin', { valueAsNumber: true })}
            />
            <Input
              label="Максимальная зарплата"
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
            placeholder="Например: Сан-Франциско, CA или Remote"
            error={errors.location?.message}
            {...register('location')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Тип вакансии"
              options={[
                { value: 'FULL_TIME', label: 'Полная занятость' },
                { value: 'PART_TIME', label: 'Частичная занятость' },
                { value: 'CONTRACT', label: 'Контракт' },
                { value: 'REMOTE', label: 'Удалённая' },
              ]}
              error={errors.type?.message}
              {...register('type')}
            />

            <Input
              label="Отдел"
              placeholder="Например: Engineering"
              error={errors.department?.message}
              {...register('department')}
            />
          </div>

          <Select
            label="Статус вакансии"
            options={[
              { value: 'OPEN', label: 'Открыта (видно кандидатам)' },
              { value: 'DRAFT', label: 'Черновик (не видна)' },
            ]}
            {...register('status')}
          />

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <Link href="/vacancies" className="px-5 py-2 text-blue-600 rounded-xl border border-blue-600 text-sm font-medium
                            transform hover:scale-105 hover:bg-blue-100 transition duration-500">
              
                Отмена
              
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="relative px-5 py-2 rounded-xl text-sm font-medium text-white overflow-hidden
                        flex items-center justify-center transform hover:scale-105 transition-transform duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Градиентный фон */}
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 z-0"></span>

              {/* Содержимое кнопки поверх градиента */}
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Создать вакансию
              </span>
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
