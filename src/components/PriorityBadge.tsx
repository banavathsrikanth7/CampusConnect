import React from 'react';
import { ComplaintPriority, ComplaintCategory } from '../types.ts';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  Check,
  Zap,
  Droplets,
  Home,
  Sparkles,
  Wifi,
  Shield,
  HelpCircle,
  GraduationCap,
  Bus,
  Layers,
} from 'lucide-react';

export const PriorityBadge: React.FC<{ priority: ComplaintPriority; showIcon?: boolean }> = ({
  priority,
  showIcon = true,
}) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Info;

  switch (priority) {
    case 'Critical':
      badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300 font-semibold animate-pulse';
      Icon = AlertOctagon;
      break;
    case 'High':
      badgeStyle = 'bg-orange-100 text-orange-800 border-orange-300 font-medium';
      Icon = AlertTriangle;
      break;
    case 'Medium':
      badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
      Icon = Info;
      break;
    case 'Low':
      badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';
      Icon = Check;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${badgeStyle}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{priority}</span>
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: ComplaintCategory }> = ({ category }) => {
  let Icon = Layers;
  let color = 'text-slate-600 bg-slate-100 border-slate-200';

  switch (category) {
    case 'Electrical':
      Icon = Zap;
      color = 'text-amber-700 bg-amber-50 border-amber-200';
      break;
    case 'Plumbing':
      Icon = Droplets;
      color = 'text-cyan-700 bg-cyan-50 border-cyan-200';
      break;
    case 'Hostel':
      Icon = Home;
      color = 'text-indigo-700 bg-indigo-50 border-indigo-200';
      break;
    case 'Cleaning':
      Icon = Sparkles;
      color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      break;
    case 'Internet':
      Icon = Wifi;
      color = 'text-blue-700 bg-blue-50 border-blue-200';
      break;
    case 'Security':
      Icon = Shield;
      color = 'text-rose-700 bg-rose-50 border-rose-200';
      break;
    case 'Lost and Found':
      Icon = HelpCircle;
      color = 'text-violet-700 bg-violet-50 border-violet-200';
      break;
    case 'Academic':
      Icon = GraduationCap;
      color = 'text-teal-700 bg-teal-50 border-teal-200';
      break;
    case 'Transport':
      Icon = Bus;
      color = 'text-sky-700 bg-sky-50 border-sky-200';
      break;
    default:
      Icon = Layers;
      color = 'text-slate-700 bg-slate-100 border-slate-200';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{category}</span>
    </span>
  );
};
