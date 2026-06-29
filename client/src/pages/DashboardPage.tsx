import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, Clock, PlusCircle,
  TrendingUp, Zap, ArrowRight, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import IssueCard, { StatCard, SkeletonCard } from '../components/IssueCard';
import { subscribeToIssues, computeStats } from '../lib/issues';
import { useAuth } from '../context/AuthContext';
import type { Issue } from '../types';

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToIssues((data) => {
      setIssues(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const stats = computeStats(issues);
  const categoryData = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({
      name: name.length > 10 ? `${name.slice(0, 10)}…` : name,
      value,
    }));

  const statusData = [
    { name: 'Reported',    value: stats.reported },
    { name: 'Verified',    value: stats.verified },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Resolved',    value: stats.resolved },
  ].filter((d) => d.value > 0);

  const resolvedPct = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div className="space-y-6 pb-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-500 p-6 sm:p-8 text-white shadow-xl shadow-brand-600/20">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-4 right-20 w-16 h-16 rounded-full bg-white/10 animate-float" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-brand-100 text-sm font-medium mb-1">{getGreeting()},</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile?.displayName ?? 'Hero'}
            </h1>
            <p className="text-brand-100 text-sm mt-1.5">Your community impact at a glance</p>
            {profile && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="text-sm font-bold">{profile.points} pts</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                  <Activity className="w-3.5 h-3.5 text-brand-200" />
                  <span className="text-sm">{profile.reportsCount} reports</span>
                </div>
              </div>
            )}
          </div>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-5 py-2.5 rounded-2xl hover:bg-brand-50 transition-colors shadow-md shrink-0 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Report Issue
          </Link>
        </div>

        {stats.total > 0 && (
          <div className="relative mt-5 pt-5 border-t border-white/20">
            <div className="flex justify-between text-xs text-brand-100 mb-1.5">
              <span>Community resolution rate</span>
              <span className="font-bold text-white">{resolvedPct}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${resolvedPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Issues" value={stats.total}     icon={<TrendingUp className="w-5 h-5 text-brand-600" />}    color="bg-brand-50" />
        <StatCard label="Reported"    value={stats.reported}   icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}  color="bg-amber-50" />
        <StatCard label="In Progress" value={stats.inProgress} icon={<Clock className="w-5 h-5 text-violet-600" />}        color="bg-violet-50" />
        <StatCard label="Resolved"    value={stats.resolved}   icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} color="bg-emerald-50" />
      </div>

      {stats.total > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-brand-500 rounded-full inline-block" />
              Issues by Category
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-violet-500 rounded-full inline-block" />
              Status Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-1">
              {statusData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Recent Reports</h2>
          <Link to="/map" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-brand-400" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">No issues yet</p>
            <p className="text-slate-400 text-sm mb-5">Be the first hero in your community!</p>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Report the first issue
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.slice(0, 6).map((issue, i) => (
              <div key={issue.id} className={`stagger-${Math.min(i + 1, 6)} animate-fade-up`}>
                <IssueCard issue={issue} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
