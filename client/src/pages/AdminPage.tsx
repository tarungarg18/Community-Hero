import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Search, Filter, ExternalLink, MapPin, Calendar, User,
} from 'lucide-react';
import { subscribeToIssues, updateIssueStatus } from '../lib/issues';
import type { Issue, IssueStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, ISSUE_CATEGORIES } from '../lib/constants';

const STATUS_OPTIONS: IssueStatus[] = ['reported', 'verified', 'in_progress', 'resolved'];

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${color}`}>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5,6].map((i) => (
        <td key={i} className="px-4 py-3"><div className="skeleton h-4 rounded w-full" /></td>
      ))}
    </tr>
  );
}

export default function AdminPage() {
  const [issues, setIssues]       = useState<Issue[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<string>('all');
  const [catFilter, setCat]       = useState<string>('all');
  const [updating, setUpdating]   = useState<string | null>(null);

  useEffect(() => {
    return subscribeToIssues((data) => { setIssues(data); setLoading(false); });
  }, []);

  const filtered = issues.filter((i) => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.location.address?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchCat    = catFilter === 'all' || i.category === catFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const counts = {
    total:      issues.length,
    reported:   issues.filter((i) => i.status === 'reported').length,
    inProgress: issues.filter((i) => i.status === 'in_progress').length,
    resolved:   issues.filter((i) => i.status === 'resolved').length,
  };

  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    setUpdating(issueId);
    try {
      await updateIssueStatus(issueId, newStatus);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Admin Panel</span>
            <span className="text-slate-300 text-sm">|</span>
            <span className="text-slate-500 text-sm">Community Hero</span>
          </div>
          <Link to="/dashboard" className="text-sm text-slate-500 hover:text-brand-600 transition-colors">
            Back to App
          </Link>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill label="Total Issues"  value={counts.total}      color="bg-white border border-slate-100 text-slate-800" />
          <StatPill label="Needs Action"  value={counts.reported}   color="bg-amber-50 text-amber-800" />
          <StatPill label="In Progress"   value={counts.inProgress} color="bg-violet-50 text-violet-800" />
          <StatPill label="Resolved"      value={counts.resolved}   color="bg-emerald-50 text-emerald-800" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or location..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-slate-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <select
            value={catFilter}
            onChange={(e) => setCat(e.target.value)}
            className="border border-slate-200 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="all">All Categories</option>
            {ISSUE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <span className="text-xs text-slate-400 ml-auto shrink-0">
            {filtered.length} of {issues.length} issues
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Issue</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Priority</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Reporter</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-14 text-slate-400">
                      No issues match your filters
                    </td>
                  </tr>
                ) : (
                  filtered.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate">{issue.title}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {issue.location.address || 'No address'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {issue.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[issue.priority]}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-xs text-slate-600">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          {issue.reporterName}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {issue.verificationCount} verification{issue.verificationCount !== 1 ? 's' : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          {issue.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <select
                            value={issue.status}
                            disabled={updating === issue.id}
                            onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                            className={`text-xs font-semibold pl-2 pr-6 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none ${STATUS_COLORS[issue.status]} ${updating === issue.id ? 'opacity-50' : ''}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/issues/${issue.id}`}
                          className="text-brand-600 hover:text-brand-700 p-1.5 rounded-lg hover:bg-brand-50 transition-colors inline-flex"
                          title="View issue"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
