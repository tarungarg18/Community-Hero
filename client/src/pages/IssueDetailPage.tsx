import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  CheckCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { StaticLocationMap } from '../components/MapView';
import { getIssue, verifyIssue, updateIssueStatus } from '../lib/issues';
import { useAuth } from '../context/AuthContext';
import type { Issue } from '../types';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../lib/constants';

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, refreshProfile } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadIssue = async () => {
    if (!id) return;
    const data = await getIssue(id);
    setIssue(data);
    setLoading(false);
  };

  useEffect(() => {
    loadIssue();
  }, [id]);

  const handleVerify = async () => {
    if (!id || !user) return;
    setActionLoading(true);
    setMessage('');
    try {
      await verifyIssue(id, user.uid);
      await refreshProfile();
      await loadIssue();
      setMessage('Issue verified! You earned 5 points.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (status: Issue['status']) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await updateIssueStatus(id, status);
      await loadIssue();
      setMessage(`Status updated to ${STATUS_LABELS[status]}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">Issue not found</p>
        <Link to="/dashboard" className="text-brand-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const alreadyVerified = user ? issue.verifiedBy.includes(user.uid) : false;
  const isReporter = user?.uid === issue.reporterId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      {message && (
        <div className="bg-brand-50 text-brand-800 text-sm px-4 py-3 rounded-lg">{message}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {issue.imageUrls.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-1 bg-slate-100">
            {issue.imageUrls.map((url) => (
              <img key={url} src={url} alt={issue.title} className="w-full h-56 object-cover" />
            ))}
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[issue.status]}`}>
                {STATUS_LABELS[issue.status]}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_COLORS[issue.priority]}`}>
                {issue.priority} priority
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {issue.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{issue.title}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Reported by {issue.reporterName} on {issue.createdAt.toLocaleDateString()}
            </p>
          </div>

          <p className="text-slate-600 leading-relaxed">{issue.description}</p>

          {issue.aiSummary && (
            <div className="bg-violet-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-violet-700 mb-1">AI Analysis</p>
              <p className="text-sm text-violet-900">{issue.aiSummary}</p>
            </div>
          )}

          {issue.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {issue.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              {issue.verificationCount} community verifications
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {issue.location.address}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {user && !alreadyVerified && !isReporter && (
              <button
                type="button"
                onClick={handleVerify}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Verify Issue (+5 pts)
              </button>
            )}
            {alreadyVerified && (
              <span className="inline-flex items-center gap-2 text-brand-700 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                You verified this issue
              </span>
            )}
          </div>

          {isReporter && issue.status !== 'resolved' && (
            <div className="border-t border-slate-100 pt-5">
              <p className="text-sm font-medium text-slate-700 mb-3">Update status</p>
              <div className="flex flex-wrap gap-2">
                {(['in_progress', 'resolved'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    disabled={actionLoading || issue.status === s}
                    className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    Mark {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-3">Location</h2>
        <StaticLocationMap location={issue.location} height="250px" />
      </div>
    </div>
  );
}
