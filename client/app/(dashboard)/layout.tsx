'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '@/graphql/queries';
import { useAuthStore } from '@/lib/stores/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { NotificationContainer } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, setAuth, logout, setLoading } = useAuthStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { data, loading, error } = useQuery(ME_QUERY, {
    skip: !token,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!loading) {
      if (error || !data?.me) {
        logout();
        router.push('/login');
      } else if (data?.me) {
        setAuth(data.me, token);
      }
      setLoading(false);
    }
  }, [token, loading, data, error, router, setAuth, logout, setLoading]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-400/5 to-purple-400/10">
    {/* HEADER — ВСЯ ШИРИНА */}
    <Header />

    {/* ОСНОВНАЯ СЕТКА */}
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>

    <NotificationContainer />
  </div>
);

}
