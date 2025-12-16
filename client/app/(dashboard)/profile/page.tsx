'use client';

import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UPDATE_USER_MUTATION } from '@/graphql/mutations';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { Input } from '@/components/ui';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  skills: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { addNotification } = useUIStore();
  const isHR = user?.role === 'HR';

  const [updateUserMutation, { loading }] = useMutation(UPDATE_USER_MUTATION, {
    onCompleted: (data) => {
      updateUser(data.updateUser);
      addNotification({ type: 'success', message: 'Профиль успешно обновлен!' });
    },
    onError: (error) => {
      addNotification({ type: 'error', message: error.message });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      company: user?.company || '',
      position: user?.position || '',
      skills: user?.skills?.join(', ') || '',
    },
  });

  const onSubmit = (data: ProfileForm) => {
    const input: Record<string, any> = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    };

    if (isHR) {
      input.company = data.company;
    } else {
      input.position = data.position;
      input.skills = data.skills?.split(',').map((s) => s.trim()).filter(Boolean);
    }

    updateUserMutation({ variables: { input } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Заголовок страницы */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Настройки профиля</h1>
        <p className="text-slate-500 mt-1">Управляйте информацией о вашем аккаунте</p>
      </div>

      {/* Карточка профиля */}
      <div className="card overflow-hidden">
        <div className="h-16 relative">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="profile-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#profile-pattern)" />
            </svg>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white shadow-xl">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 pt-4 sm:pt-0 sm:pb-2">
              <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
              <p className="text-slate-500">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${isHR ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/10' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10'}`}>
                {isHR ? 'HR Менеджер' : 'Кандидат'}
              </span>
              <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Активен
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Форма редактирования */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Личная информация</h3>
            <p className="text-sm text-slate-500">Обновите данные профиля</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Имя"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Фамилия"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <Input
            label="Телефон"
            placeholder="+7-777-000-00-00"
            error={errors.phone?.message}
            {...register('phone')}
          />

          {isHR ? (
            <Input
              label="Компания"
              placeholder="Название вашей компании"
              error={errors.company?.message}
              {...register('company')}
            />
          ) : (
            <>
              <Input
                label="Должность"
                placeholder="Например: Старший разработчик"
                error={errors.position?.message}
                {...register('position')}
              />
              <div>
                <label className="label">Навыки</label>
                <textarea
                  className="input min-h-24 resize-none"
                  placeholder="JavaScript, React, Node.js, TypeScript (через запятую)"
                  {...register('skills')}
                />
                <p className="mt-1 text-xs text-slate-500">Разделяйте навыки запятой</p>
                {errors.skills && (
                  <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
                )}
              </div>
            </>
          )}

          <div className="flex items-center justify-end pt-4 border-t border-slate-200">
            {/* Градиентная кнопка сохранения */}
            <button
              type="submit"
              disabled={!isDirty || loading}
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
