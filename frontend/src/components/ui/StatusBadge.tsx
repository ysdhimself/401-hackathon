import { clsx } from 'clsx';
import type { ApplicationStatus } from '@/types';

const statusColors: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-100 text-blue-800',
  phone_screen: 'bg-orange-100 text-orange-800',
  interview: 'bg-orange-100 text-orange-800',
  technical: 'bg-purple-100 text-purple-800',
  onsite: 'bg-pink-100 text-pink-800',
  offered: 'bg-green-100 text-green-800',
  accepted: 'bg-green-200 text-green-900',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

interface StatusBadgeProps {
  status: ApplicationStatus;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const displayLabel = label || status.replace('_', ' ');

  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize',
        statusColors[status]
      )}
    >
      {displayLabel}
    </span>
  );
}
