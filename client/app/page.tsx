'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';
import {
  Briefcase,
  
  Search,
  Calendar,
  Layers,
  MessageCircle,
  Zap,
  Clipboard,
  Bell,
} from 'lucide-react';
import InfoCard from '@/components/ui/InfoCard';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  const hrFeatures = [
    { text: 'Создание вакансий', icon: <Briefcase /> },
    { text: 'Воронка кандидатов', icon: <Layers /> },
    { text: 'Интервью и встречи', icon: <Calendar /> },
    { text: 'Статусы и комментарии', icon: <MessageCircle /> },
  ];

  const candidateFeatures = [
    { text: 'Актуальные вакансии', icon: <Search /> },
    { text: 'Быстрый отклик', icon: <Zap /> },
    { text: 'История заявок', icon: <Clipboard /> },
    { text: 'Уведомления', icon: <Bell /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-400/5 to-purple-400/10 text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl shadow-md">
        <div className="container mx-auto px-7 py-4 flex items-center justify-between">
          {/* Логотип */}
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

          {/* Кнопки */}
          <div className="flex space-x-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="relative px-5 py-2 rounded-xl text-sm font-medium text-white overflow-hidden
                          flex items-center justify-center transform hover:scale-105 transition-transform duration-500"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 z-0"></span>
                <span className="relative z-10">Dashboard</span>
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>

        </div>
      </nav>

      {/* Hero */}
      <main className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center mb-24">
          <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-tight">
            Простой и понятный
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              процесс найма
            </span>
          </h1>
          <p className="text-lg text-slate-600">
            HR-платформа для работы с вакансиями, кандидатами и интервью —
            всё в одном аккуратном интерфейсе.
          </p>
        </div>

        {/* Карточки */}
        <div className="grid md:grid-cols-2 gap-10">
          <InfoCard
            title="Для HR-менеджеров"
            text="Контролируйте каждый этап найма в одном месте."
            features={hrFeatures}
            actionText="Разместить вакансию"
            href={'/dashboard'}
            accent="from-blue-600 to-purple-600"
          />

          <InfoCard
            title="Для кандидатов"
            text="Находите работу и отслеживайте статус откликов."
            features={candidateFeatures}
            actionText="Найти вакансии"
            href="/vacancies"
            accent="from-blue-600 to-purple-600"
          />
        </div>

      
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        HR Recruitment Platform
      </footer>
    </div>
  );
}
