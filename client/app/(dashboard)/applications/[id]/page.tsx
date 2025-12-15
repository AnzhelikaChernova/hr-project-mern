'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { APPLICATION_QUERY, USERS_QUERY } from '@/graphql/queries';
import { UPDATE_APPLICATION_MUTATION, SCHEDULE_INTERVIEW_MUTATION } from '@/graphql/mutations';
import { useAuthStore } from '@/lib/stores/auth';
import { useUIStore } from '@/lib/stores/ui';
import { Button, Select, Input, StatusBadge } from '@/components/ui';
import Link from 'next/link';

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'REVIEWING', label: 'Reviewing' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFERED', label: 'Offered' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ACCEPTED', label: 'Accepted' },
];

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const isHR = user?.role === 'HR';
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const { data, loading, refetch } = useQuery(APPLICATION_QUERY, {
    variables: { id: params.id },
  });

  const { data: hrUsersData } = useQuery(USERS_QUERY, {
    variables: { role: 'HR', limit: 50 },
    skip: !isHR,
  });

  const [updateApplication, { loading: updating }] = useMutation(UPDATE_APPLICATION_MUTATION, {
    onCompleted: () => {
      addNotification({ type: 'success', message: 'Application updated' });
      refetch();
    },
    onError: (error) => {
      addNotification({ type: 'error', message: error.message });
    },
  });

  const [scheduleInterview, { loading: scheduling }] = useMutation(SCHEDULE_INTERVIEW_MUTATION, {
    onCompleted: () => {
      addNotification({ type: 'success', message: 'Interview scheduled!' });
      setShowScheduleForm(false);
      refetch();
    },
    onError: (error) => {
      addNotification({ type: 'error', message: error.message });
    },
  });

  const application = data?.application;
  const hrUsers = hrUsersData?.users || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-20">
        <p className="text-secondary-500">Application not found</p>
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    updateApplication({
      variables: {
        id: application.id,
        input: { status: newStatus },
      },
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-secondary-900">
                {isHR ? application.candidate.fullName : application.vacancy.title}
              </h1>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-lg text-secondary-600">
              {isHR
                ? `Applied for ${application.vacancy.title}`
                : application.vacancy.createdBy?.company || 'Company'}
            </p>
          </div>
          {isHR && (
            <div className="flex items-center gap-3">
              <Select
                options={statusOptions}
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
              />
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900 mb-3">
              {isHR ? 'Candidate Info' : 'Job Details'}
            </h2>
            {isHR ? (
              <div className="space-y-2">
                <p><strong>Email:</strong> {application.candidate.email}</p>
                <p><strong>Phone:</strong> {application.candidate.phone || 'Not provided'}</p>
                <p><strong>Position:</strong> {application.candidate.position || 'Not specified'}</p>
                {application.candidate.skills?.length > 0 && (
                  <div>
                    <strong>Skills:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {application.candidate.skills.map((skill: string, i: number) => (
                        <span key={i} className="badge-primary">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p><strong>Location:</strong> {application.vacancy.location}</p>
                <p><strong>Type:</strong> {application.vacancy.type.replace('_', ' ')}</p>
                <Link href={`/vacancies/${application.vacancy.id}`} className="text-primary-600 hover:text-primary-700">
                  View full job details
                </Link>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-secondary-900 mb-3">Application</h2>
            <div className="space-y-2">
              <p><strong>Applied:</strong> {formatDate(application.appliedAt)}</p>
              <p>
                <strong>Resume:</strong>{' '}
                <a
                  href={application.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  View Resume
                </a>
              </p>
            </div>
          </div>
        </div>

        {application.coverLetter && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-3">Cover Letter</h2>
            <div className="p-4 bg-secondary-50 rounded-lg whitespace-pre-line">
              {application.coverLetter}
            </div>
          </div>
        )}
      </div>

      {isHR && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900">
              Interviews ({application.interviews?.length || 0})
            </h2>
            <Button size="sm" onClick={() => setShowScheduleForm(!showScheduleForm)}>
              Schedule Interview
            </Button>
          </div>

          {showScheduleForm && (
            <ScheduleInterviewForm
              applicationId={application.id}
              hrUsers={hrUsers}
              onSchedule={scheduleInterview}
              loading={scheduling}
              onCancel={() => setShowScheduleForm(false)}
            />
          )}

          {application.interviews?.length > 0 ? (
            <div className="space-y-3 mt-4">
              {application.interviews.map((interview: any) => (
                <div key={interview.id} className="p-3 border border-secondary-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{formatDate(interview.scheduledAt)}</p>
                      <p className="text-sm text-secondary-500">
                        {interview.type} • {interview.duration} min • {interview.location}
                      </p>
                    </div>
                    <StatusBadge status={interview.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-4">No interviews scheduled</p>
          )}
        </div>
      )}

      {!isHR && application.interviews?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Your Interviews
          </h2>
          <div className="space-y-3">
            {application.interviews.map((interview: any) => (
              <div key={interview.id} className="p-4 border border-secondary-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{formatDate(interview.scheduledAt)}</p>
                  <StatusBadge status={interview.status} />
                </div>
                <p className="text-secondary-600">
                  {interview.type} Interview • {interview.duration} minutes
                </p>
                <p className="text-sm text-secondary-500 mt-1">
                  Location: {interview.location}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleInterviewForm({
  applicationId,
  hrUsers,
  onSchedule,
  loading,
  onCancel,
}: {
  applicationId: string;
  hrUsers: any[];
  onSchedule: (options: any) => void;
  loading: boolean;
  onCancel: () => void;
}) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('60');
  const [type, setType] = useState('VIDEO');
  const [location, setLocation] = useState('');
  const [interviewerId, setInterviewerId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule({
      variables: {
        input: {
          applicationId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          duration: parseInt(duration),
          type,
          location,
          interviewerIds: [interviewerId],
        },
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-secondary-50 rounded-lg space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Date & Time"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
        />
        <Select
          label="Duration"
          options={[
            { value: '30', label: '30 minutes' },
            { value: '45', label: '45 minutes' },
            { value: '60', label: '1 hour' },
            { value: '90', label: '1.5 hours' },
            { value: '120', label: '2 hours' },
          ]}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Select
          label="Type"
          options={[
            { value: 'VIDEO', label: 'Video Call' },
            { value: 'PHONE', label: 'Phone Call' },
            { value: 'ONSITE', label: 'On-site' },
          ]}
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <Select
          label="Interviewer"
          options={[
            { value: '', label: 'Select interviewer' },
            ...hrUsers.map((u: any) => ({ value: u.id, label: u.fullName })),
          ]}
          value={interviewerId}
          onChange={(e) => setInterviewerId(e.target.value)}
          required
        />
      </div>
      <Input
        label="Location/Link"
        placeholder="https://meet.google.com/... or Office Address"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <div className="flex gap-2">
        <Button type="submit" loading={loading}>
          Schedule
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
