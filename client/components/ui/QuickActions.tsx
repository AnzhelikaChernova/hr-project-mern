import Link from "next/link";
import {  FileText, Calendar, Plus, Search, User, ArrowRight } from 'lucide-react';

export function QuickActions({ isHR }: { isHR: boolean }) {
  const actions = isHR
    ? [
        { href: '/vacancies/new', icon: Plus, label: 'Создать вакансию', desc: 'Новая вакансия' },
        { href: '/applications', icon: FileText, label: 'Отклики', desc: 'Просмотр кандидатов' },
        { href: '/interviews', icon: Calendar, label: 'Собеседования', desc: 'Управление графиком' },
      ]
    : [
        { href: '/vacancies', icon: Search, label: 'Поиск работы', desc: 'Просмотр вакансий' },
        { href: '/profile', icon: User, label: 'Профиль', desc: 'Редактирование данных' },
        { href: '/applications', icon: FileText, label: 'Мои отклики', desc: 'Отслеживание статуса' },
      ];

  return (
    <div className="p-5 bg-white/80 rounded-xl ">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Быстрые действия</h2>
      <div className="space-y-3">
        {actions.map(a => (
          <Link key={a.href} href={a.href}>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
              <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                <a.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{a.label}</p>
                <p className="text-xs text-slate-500">{a.desc}</p>
              </div>
              <ArrowRight className="ml-auto w-5 h-5 text-slate-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}