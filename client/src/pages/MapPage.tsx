import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import IssuesMap from '../components/MapView';
import IssueCard from '../components/IssueCard';
import { subscribeToIssues } from '../lib/issues';
import type { Issue } from '../types';
import { STATUS_LABELS } from '../lib/constants';

const STATUS_COLORS: Record<string, string> = {
  all: 'bg-brand-600 text-white',
  reported: 'bg-amber-500 text-white',
  verified: 'bg-blue-500 text-white',
  in_progress: 'bg-violet-500 text-white',
  resolved: 'bg-green-500 text-white',
};

export default function MapPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    return subscribeToIssues(setIssues);
  }, []);

  const filtered = filter === 'all' ? issues : issues.filter((i) => i.status === filter);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Community Map</h1>
        <p className="text-slate-500 text-sm mt-0.5">Browse and filter reported issues in your area</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' ? STATUS_COLORS.all : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          All{issues.length > 0 ? ` (${issues.length})` : ''}
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => {
          const count = issues.filter((i) => i.status === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? STATUS_COLORS[key] ?? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {label}{count > 0 ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      <IssuesMap issues={filtered} height="420px" />

      {filtered.length > 0 ? (
        <div>
          <h2 className="font-semibold text-slate-700 text-sm mb-3">
            {filtered.length} issue{filtered.length !== 1 ? 's' : ''}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-14 text-slate-400">
          <p className="text-lg mb-1">No issues here yet</p>
          <Link to="/report" className="text-brand-600 hover:underline text-sm">
            Be the first to report one
          </Link>
        </div>
      )}
    </div>
  );
}
