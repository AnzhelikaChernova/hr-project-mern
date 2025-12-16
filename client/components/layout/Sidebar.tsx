'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  User,
  Search,
} from 'lucide-react';

const hrNavItems = [
  { href: '/dashboard', label: 'Панель', icon: LayoutDashboard },
  { href: '/vacancies', label: 'Вакансии', icon: Briefcase },
  { href: '/applications', label: 'Отклики', icon: FileText },
  { href: '/interviews', label: 'Собеседования', icon: Calendar },
  { href: '/profile', label: 'Профиль', icon: User },
];

const candidateNavItems = [
  { href: '/dashboard', label: 'Панель', icon: LayoutDashboard },
  { href: '/vacancies', label: 'Поиск вакансий', icon: Search },
  { href: '/applications', label: 'Мои отклики', icon: FileText },
  { href: '/interviews', label: 'Мои собеседования', icon: Calendar },
  { href: '/profile', label: 'Профиль', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = user?.role === 'HR' ? hrNavItems : candidateNavItems;

  return (
    <aside className="sidebar">
      

      <nav className="sidebar-nav">
        <div className="mb-2 px-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</span>
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
          <div className="avatar avatar-md bg-gradient-to-r from-blue-600 to-purple-600">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500 truncate">
              {user?.role === 'HR' ? 'HR Менеджер' : 'Кандидат'}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
        </div>
      </div>
    </aside>
  );
}

