'use client';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  primary: 'bg-primary-100 text-primary-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  secondary: 'bg-secondary-100 text-secondary-800',
};

export function Badge({ variant = 'secondary', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    REVIEWING: { variant: 'primary', label: 'Reviewing' },
    INTERVIEW: { variant: 'primary', label: 'Interview' },
    OFFERED: { variant: 'success', label: 'Offered' },
    ACCEPTED: { variant: 'success', label: 'Accepted' },
    REJECTED: { variant: 'danger', label: 'Rejected' },
    OPEN: { variant: 'success', label: 'Open' },
    CLOSED: { variant: 'secondary', label: 'Closed' },
    DRAFT: { variant: 'secondary', label: 'Draft' },
    SCHEDULED: { variant: 'primary', label: 'Scheduled' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },
  };

  const config = statusConfig[status] || { variant: 'secondary', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
