import React from 'react';
import { TimelineEvent } from '../types.ts';
import {
  Clock,
  Search,
  UserCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from 'lucide-react';

interface Props {
  events: TimelineEvent[];
}

export const TicketTimeline: React.FC<Props> = ({ events }) => {
  const getIcon = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Under Review':
        return <Search className="w-4 h-4 text-amber-600" />;
      case 'Assigned':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'In Progress':
        return <Wrench className="w-4 h-4 text-purple-600" />;
      case 'Resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'border-blue-500 bg-blue-50';
      case 'Under Review':
        return 'border-amber-500 bg-amber-50';
      case 'Assigned':
        return 'border-indigo-500 bg-indigo-50';
      case 'In Progress':
        return 'border-purple-500 bg-purple-50';
      case 'Resolved':
        return 'border-emerald-500 bg-emerald-50';
      case 'Rejected':
        return 'border-rose-500 bg-rose-50';
      default:
        return 'border-slate-300 bg-slate-50';
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((evt, idx) => {
        const dateStr = new Date(evt.timestamp).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });

        const isLatest = idx === events.length - 1;

        return (
          <div key={idx} className="relative group">
            {/* Dot marker */}
            <div
              className={`absolute -left-6 top-0 flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white ${getBorderColor(
                evt.status
              )} shadow-sm z-10 transition-transform ${isLatest ? 'scale-110 ring-2 ring-blue-100' : ''}`}
            >
              {getIcon(evt.status)}
            </div>

            {/* Event Content */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-900 text-sm">{evt.status}</span>
                <span className="text-xs text-slate-500 font-medium">{dateStr}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">{evt.note}</p>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                <span className="font-medium text-slate-700">Updated by:</span>
                <span>{evt.actor}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
