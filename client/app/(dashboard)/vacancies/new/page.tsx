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
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().min(1, 'At least one requirement is needed'),
  salaryMin: z.number().min(0, 'Minimum salary must be positive'),
  salaryMax: z.number().min(0, 'Maximum salary must be positive'),
  currency: z.string().default('USD'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE']),
  department: z.string().min(1, 'Department is required'),
  status: z.enum(['OPEN', 'DRAFT']),
});

type VacancyForm = z.infer<typeof vacancySchema>;

export default function NewVacancyPage() {
  const router = useRouter();
  const { addNotification } = useUIStore();

  const [createVacancy, { loading }] = useMutation(CREATE_VACANCY_MUTATION, {
    onCompleted: (data) => {
      addNotification({ type: 'success', message: 'Vacancy created successfully!' });
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
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link href="/vacancies" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Post New Vacancy</h1>
        </div>
        <p className="text-slate-500 ml-11">Create a new job posting to attract top talent</p>
      </div>

      {/* Form */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Job Details</h3>
            <p className="text-sm text-slate-500">Fill in the information below to create your job posting</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Job Title"
            placeholder="e.g. Senior Frontend Developer"
            error={errors.title?.message}
            {...register('title')}
          />

          <div>
            <label className="label">Description</label>
            <textarea
              className={`input min-h-40 resize-none ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe the role, responsibilities, and what makes it exciting..."
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="label">Requirements (one per line)</label>
            <textarea
              className={`input min-h-32 resize-none ${errors.requirements ? 'input-error' : ''}`}
              placeholder="5+ years of React experience&#10;Strong TypeScript skills&#10;Experience with GraphQL"
              {...register('requirements')}
            />
            {errors.requirements && (
              <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">Enter each requirement on a new line</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Min Salary"
              type="number"
              placeholder="80000"
              error={errors.salaryMin?.message}
              {...register('salaryMin', { valueAsNumber: true })}
            />
            <Input
              label="Max Salary"
              type="number"
              placeholder="120000"
              error={errors.salaryMax?.message}
              {...register('salaryMax', { valueAsNumber: true })}
            />
            <Select
              label="Currency"
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
            label="Location"
            placeholder="e.g. San Francisco, CA or Remote"
            error={errors.location?.message}
            {...register('location')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Job Type"
              options={[
                { value: 'FULL_TIME', label: 'Full Time' },
                { value: 'PART_TIME', label: 'Part Time' },
                { value: 'CONTRACT', label: 'Contract' },
                { value: 'REMOTE', label: 'Remote' },
              ]}
              error={errors.type?.message}
              {...register('type')}
            />

            <Input
              label="Department"
              placeholder="e.g. Engineering"
              error={errors.department?.message}
              {...register('department')}
            />
          </div>

          <Select
            label="Status"
            options={[
              { value: 'OPEN', label: 'Open (visible to candidates)' },
              { value: 'DRAFT', label: 'Draft (not visible)' },
            ]}
            {...register('status')}
          />

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <Link href="/vacancies">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Vacancy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
