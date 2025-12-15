'use client';

import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UPDATE_USER_MUTATION } from '@/graphql/mutations';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { Button, Input } from '@/components/ui';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
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
      addNotification({ type: 'success', message: 'Profile updated successfully!' });
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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account information and preferences</p>
      </div>

      {/* Profile Header Card */}
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative">
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
                {isHR ? 'HR Manager' : 'Candidate'}
              </span>
              <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
                <p className="text-sm text-slate-500">Update your personal details</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Last Name"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <Input
                label="Phone Number"
                placeholder="+1-555-0000"
                error={errors.phone?.message}
                {...register('phone')}
              />

              {isHR ? (
                <Input
                  label="Company"
                  placeholder="Your company name"
                  error={errors.company?.message}
                  {...register('company')}
                />
              ) : (
                <>
                  <Input
                    label="Current Position"
                    placeholder="e.g. Senior Developer"
                    error={errors.position?.message}
                    {...register('position')}
                  />
                  <div>
                    <label className="label">Skills</label>
                    <textarea
                      className="input min-h-24 resize-none"
                      placeholder="JavaScript, React, Node.js, TypeScript (comma separated)"
                      {...register('skills')}
                    />
                    <p className="mt-1 text-xs text-slate-500">Separate skills with commas</p>
                    {errors.skills && (
                      <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  {isDirty ? 'You have unsaved changes' : 'All changes saved'}
                </p>
                <Button type="submit" loading={loading} disabled={!isDirty}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Account Security</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Email</span>
                <span className="text-sm font-medium text-slate-900">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Role</span>
                <span className="text-sm font-medium text-slate-900">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Status</span>
                <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 text-xs">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              {isHR ? (
                <>
                  <a href="/vacancies/new" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Post New Vacancy</span>
                  </a>
                  <a href="/applications" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Review Applications</span>
                  </a>
                </>
              ) : (
                <>
                  <a href="/vacancies" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Browse Jobs</span>
                  </a>
                  <a href="/applications" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">My Applications</span>
                  </a>
                </>
              )}
              <a href="/interviews" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-700">My Interviews</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
