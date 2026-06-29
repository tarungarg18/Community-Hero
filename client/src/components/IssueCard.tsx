import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import type { Issue } from '../types';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../lib/constants';

interface IssueCardProps {
  issue: Issue;
}

const STATUS_DOT: Record<string, string> = {
  reported: 'bg-amber-400',
  verified: 'bg-blue-400',
  in_progress: 'bg-violet-400',
  resolved: 'bg-emerald-400',
};

export default function IssueCard({ issue }: IssueCardProps) {
  const statusClass = STATUS_COLORS[issue.status] ?? 'bg-slate-100 text-slate-700';
  const priorityClass = PRIORITY_COLORS[issue.priority] ?? 'bg-slate-100 text-slate-700';
  const dot = STATUS_DOT[issue.status] ?? 'bg-slate-400';

  return (
    <Link
      to={`/issues/${issue.id}`}
      className="block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 hover:border-brand-200 transition-all duration-200 group animate-fade-up"
    >
      {issue.imageUrls[0] ? (
        <div className="h-44 overflow-hidden bg-slate-100 relative">
          <img
            src={issue.imageUrls[0]}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dot} ring-2 ring-white`} />
            <span className="text-white text-xs font-medium">{STATUS_LABELS[issue.status]}</span>
          </div>
        </div>
      ) : (
        <div className="h-2 bg-gradient-to-r from-brand-400 to-emerald-400" />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-slate-900 line-clamp-1 text-sm group-hover:text-brand-700 transition-colors">
            {issue.title}
          </h3>
          <ArrowUpRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-brand-500 transition-colors" />
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{issue.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {!issue.imageUrls[0] && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass}`}>
              {STATUS_LABELS[issue.status]}
            </span>
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityClass}`}>
            {issue.priority}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {issue.category}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-50">
          <span className="flex items-center gap-1 truncate max-w-[55%]">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{issue.location.address || 'Location set'}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <CheckCircle className="w-3 h-3" />
            {issue.verificationCount} verified
          </span>
        </div>
      </div>
    </Link>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

export function StatCard({ label, value, icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow animate-fade-up">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 animate-count-up">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="skeleton h-44" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
        <div className="flex gap-2 mt-3">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StatusIcon({ status }: { status: string }) {
  if (status === 'resolved')   return <CheckCircle className="w-5 h-5 text-emerald-600" />;
  if (status === 'in_progress') return <Clock className="w-5 h-5 text-purple-600" />;
  if (status === 'verified')   return <CheckCircle className="w-5 h-5 text-blue-600" />;
  return <AlertTriangle className="w-5 h-5 text-amber-600" />;
}
