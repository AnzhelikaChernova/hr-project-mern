'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { apolloClient } from '@/lib/apollo';
import { NOTIFICATIONS_QUERY, NOTIFICATION_COUNT_QUERY } from '@/graphql/queries';
import { MARK_NOTIFICATION_AS_READ_MUTATION, MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION } from '@/graphql/mutations';
import { NOTIFICATION_RECEIVED_SUBSCRIPTION } from '@/graphql/subscriptions';
import Link from 'next/link';
import {
  Bell,
  LogOut,
  User,
  LayoutDashboard,
} from 'lucide-react';
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedApplication?: { id: string };
  relatedVacancy?: { id: string; title: string };
  relatedInterview?: { id: string };
}

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { addNotification } = useUIStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications from server
  const { data: notificationsData, refetch: refetchNotifications } = useQuery(NOTIFICATIONS_QUERY, {
    variables: { limit: 10 },
    skip: !user,
  });

  const { data: countData, refetch: refetchCount } = useQuery(NOTIFICATION_COUNT_QUERY, {
    skip: !user,
  });

  // Subscribe to new notifications
  useSubscription(NOTIFICATION_RECEIVED_SUBSCRIPTION, {
    variables: { recipientId: user?.id },
    skip: !user?.id,
    onData: ({ data }) => {
      if (data?.data?.notificationReceived) {
        const newNotification = data.data.notificationReceived;
        addNotification({ type: 'info', message: newNotification.title });
        refetchNotifications();
        refetchCount();
      }
    },
  });

  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ_MUTATION);
  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION, {
    onCompleted: () => {
      refetchNotifications();
      refetchCount();
    },
  });

  const handleLogout = () => {
    logout();
    apolloClient.clearStore();
    router.push('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const recentNotifications: Notification[] = notificationsData?.notifications || [];
  const unreadCount = countData?.notificationCount?.unread || 0;

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead({ variables: { id: notification.id } });
      refetchNotifications();
      refetchCount();
    }
    setShowNotifications(false);

    // Navigate based on notification type
    if (notification.relatedApplication?.id) {
      router.push(`/applications/${notification.relatedApplication.id}`);
    } else if (notification.relatedVacancy?.id) {
      router.push(`/vacancies/${notification.relatedVacancy.id}`);
    } else if (notification.relatedInterview?.id) {
      router.push('/interviews');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPLICATION_RECEIVED':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        );
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_REMINDER':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
        );
      case 'APPLICATION_STATUS_UPDATED':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'FEEDBACK_RECEIVED':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
        );
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl  shadow-md">
      <div className="container mx-auto px-7 py-4 flex items-center justify-between">
        {/* Левая часть */}
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
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {getGreeting()}, {user?.firstName}!
          </h1>
          <p className="text-sm text-slate-600">
            {user?.role === 'HR'
              ? 'Управляйте процессом найма'
              : 'Найдите работу мечты'}
          </p>
        </div>

        
        {/* Правая часть */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowDropdown(false);
              }}
              className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-6 h-6 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-500 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      recentNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0 ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm ${!notification.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                                  {notification.title}
                                </p>
                                {!notification.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                              </div>
                              <p className="text-sm text-slate-500 truncate">{notification.message}</p>
                              <p className="text-xs text-slate-400 mt-1">{getTimeAgo(notification.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        router.push('/applications');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDropdown(!showDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 p-2 pr-4 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="avatar avatar-md bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="dropdown dropdown-visible">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        router.push('/profile');
                        setShowDropdown(false);
                      }}
                      className="dropdown-item w-full flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        router.push('/dashboard');
                        setShowDropdown(false);
                      }}
                      className="dropdown-item w-full flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="dropdown-item w-full text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>


      </div>
    </nav>
  );
}