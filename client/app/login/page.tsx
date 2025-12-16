'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LOGIN_MUTATION } from '@/graphql/mutations';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { Input, Button } from '@/components/ui';
import { ArrowRight, Briefcase, Users, Zap, Clipboard } from 'lucide-react';
import React from 'react';

const loginSchema = z.object({
  email: z.string().email('Неверный email'),
  password: z.string().min(1, 'Пароль обязателен'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { addNotification } = useUIStore();
  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login({
        variables: { input: data },
      });

      if (result.data?.login) {
        setAuth(result.data.login.user, result.data.login.token);
        addNotification({
          type: 'success',
          message: 'Добро пожаловать!',
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.message || 'Ошибка входа. Попробуйте снова.',
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
      <div className="flex flex-col lg:flex-row justify-center items-start py-12 px-4 gap-24">
        {/* Left - Login Form */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-md">
          <div className="flex flex-col items-center mb-8 text-center">
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">С возвращением!</h1>
            <p className="text-slate-600">Введите ваши данные для входа в аккаунт</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Электронная почта"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              type="password"
              label="Пароль"
              placeholder="Введите пароль"
              error={errors.password?.message}
              {...register('password')}
            />

            

            {/* Градиентная кнопка */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full px-5 py-2 rounded-xl text-sm font-medium text-white overflow-hidden
                        flex items-center justify-center transform hover:scale-105 transition-transform duration-500"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 z-0"></span>
              <span className="relative z-10 flex items-center gap-2 justify-center">
                Войти <ArrowRight size={16} />
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Нет аккаунта?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
              Создать аккаунт
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Демо аккаунты</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">HR Менеджер:</span>
                <code className="px-2 py-1 rounded bg-white text-slate-700 text-xs">hr@company.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Кандидат:</span>
                <code className="px-2 py-1 rounded bg-white text-slate-700 text-xs">candidate@email.com</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Пароль:</span>
                <code className="px-2 py-1 rounded bg-white text-slate-700 text-xs">password123</code>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Platform Info */}
        <div className="hidden lg:flex flex-col w-80 gap-6">
          <ul className="space-y-4">
            {features.map((f) => (
              <li
                key={f.text}
                className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-3 rounded-xl shadow-sm"
              >
                {React.cloneElement(f.icon, {
                  className: 'w-6 h-6',
                  stroke: 'url(#icon-gradient)',
                  strokeWidth: 2,
                })}
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
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        HR Recruitment Platform
      </footer>
    </div>
  );
}
