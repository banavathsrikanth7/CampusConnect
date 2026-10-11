import React from 'react';
import { ComplaintStatus } from '../types.ts';
import {
  Clock,
  Search,
  UserCheck,
  Wrench,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface Props {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Clock;

  switch (status) {
    case 'Submitted':
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = Clock;
      break;
    case 'Under Review':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = Search;
      break;
    case 'Assigned':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      Icon = UserCheck;
      break;
    case 'In Progress':
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = Wrench;
      break;
    case 'Resolved':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = CheckCircle2;
      break;
    case 'Rejected':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
};
