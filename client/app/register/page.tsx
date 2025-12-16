'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { REGISTER_MUTATION } from '@/graphql/mutations';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { Input, Button } from '@/components/ui';
import { ArrowRight, Briefcase, Users, Zap, Clipboard } from 'lucide-react';
import React from 'react';

const registerSchema = z
  .object({
    email: z.string().email('Неверный email'),
    password: z.string().min(6, 'Пароль должен быть не меньше 6 символов'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'Имя обязательно'),
    lastName: z.string().min(1, 'Фамилия обязательна'),
    role: z.enum(['HR', 'CANDIDATE']),
    phone: z.string().optional(),
    company: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { addNotification } = useUIStore();
  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CANDIDATE' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { confirmPassword, ...input } = data;
      const result = await registerMutation({ variables: { input } });

      if (result.data?.register) {
        setAuth(result.data.register.user, result.data.register.token);
        addNotification({ type: 'success', message: 'Аккаунт создан!' });
        router.push('/dashboard');
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.message || 'Ошибка регистрации. Попробуйте снова.',
      });
    }
  };

  const features = [
    { text: 'Управление вакансиями', icon: <Briefcase /> },
    { text: 'Воронка кандидатов', icon: <Users /> },
    { text: 'Быстрый отклик', icon: <Zap /> },
    { text: 'История заявок', icon: <Clipboard /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-400/5 to-purple-400/10 text-slate-900">
      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl shadow-md">
        <div className="container mx-auto px-7 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/0 flex items-center justify-center">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <defs>
                  <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <path
                  stroke="url(#logo-gradient)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">HR Platform</span>
          </Link>

          <div className="flex space-x-3">
            <Link
              href="/login"
              className="px-5 py-2 text-blue-600 rounded-xl border border-blue-600 text-sm font-medium
                        transform hover:scale-105 hover:bg-blue-100 transition duration-500"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="relative px-5 py-2 rounded-xl text-sm font-medium text-white overflow-hidden
                        flex items-center justify-center transform hover:scale-105 transition-transform duration-500"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 z-0"></span>
              <span className="relative z-10">Sign up</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row justify-center items-start py-12 px-4 gap-12">
        {/* Left - Form */}
        <div className="w-full max-w-md mr-12 bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-md">
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">Создать аккаунт</h1>
            <p className="text-slate-600">Присоединяйтесь к нашей платформе</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedRole === 'CANDIDATE'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input type="radio" value="CANDIDATE" {...register('role')} className="sr-only" />
                <svg
                  className={`w-8 h-8 mb-2 ${selectedRole === 'CANDIDATE' ? 'text-blue-600' : 'text-slate-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="url(#icon-gradient)"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                <span className={`text-sm font-semibold ${selectedRole === 'CANDIDATE' ? 'text-blue-600' : 'text-slate-700'}`}>
                  Кандидат
                </span>
              </label>

              <label
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedRole === 'HR'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input type="radio" value="HR" {...register('role')} className="sr-only" />
                <svg
                  className={`w-8 h-8 mb-2 ${selectedRole === 'HR' ? 'text-blue-600' : 'text-slate-400'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="url(#icon-gradient)"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                  />
                </svg>
                <span className={`text-sm font-semibold ${selectedRole === 'HR' ? 'text-blue-600' : 'text-slate-700'}`}>
                  HR / Recruiter
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input id="firstName" label="Имя" placeholder="Иван" error={errors.firstName?.message} {...register('firstName')} />
              <Input id="lastName" label="Фамилия" placeholder="Иванов" error={errors.lastName?.message} {...register('lastName')} />
            </div>

            <Input id="email" type="email" label="Email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />

            {selectedRole === 'HR' && <Input id="company" label="Компания" placeholder="Ваша компания" error={errors.company?.message} {...register('company')} />}

            <Input id="phone" label="Телефон (необязательно)" placeholder="+7-777-0000" error={errors.phone?.message} {...register('phone')} />

            <Input id="password" type="password" label="Пароль" placeholder="Минимум 6 символов" error={errors.password?.message} {...register('password')} />

            <Input id="confirmPassword" type="password" label="Подтвердите пароль" placeholder="Повторите пароль" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            {/* Градиентная кнопка */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full px-5 py-2 rounded-xl text-sm font-medium text-white overflow-hidden flex items-center justify-center transform hover:scale-105 transition-transform duration-500"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 z-0"></span>
              <span className="relative z-10 flex items-center gap-2 justify-center">
                Создать аккаунт <ArrowRight size={16} />
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Войти
            </Link>
          </p>

          {/* Gradient defs for icons */}
          <svg style={{ height: 0 }}>
            <defs>
              <linearGradient id="icon-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Right - Features */}
        <div className="hidden lg:flex flex-col w-80 gap-6">
          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-3 rounded-xl shadow-sm">
                {React.cloneElement(f.icon, { className: 'w-6 h-6', stroke: 'url(#icon-gradient)', strokeWidth: 2 })}
                <span className="text-slate-800">{f.text}</span>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-white/50 backdrop-blur-md text-center">
              <p className="text-2xl font-bold text-slate-900">500+</p>
              <p className="text-sm text-slate-700">Вакансий</p>
            </div>
            <div className="p-4 rounded-xl bg-white/50 backdrop-blur-md text-center">
              <p className="text-2xl font-bold text-slate-900">10k+</p>
              <p className="text-sm text-slate-700">Кандидатов</p>
            </div>
            <div className="p-4 rounded-xl bg-white/50 backdrop-blur-md text-center">
              <p className="text-2xl font-bold text-slate-900">95%</p>
              <p className="text-sm text-slate-700">Успешных наймов</p>
            </div>
            <div className="p-4 rounded-xl bg-white/50 backdrop-blur-md text-center">
              <p className="text-2xl font-bold text-slate-900">24/7</p>
              <p className="text-sm text-slate-700">Поддержка</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        HR Recruitment Platform
      </footer>
    </div>
  );
}
