import { useState } from 'react';
import { Brain, TrendingUp, MapPin, Lightbulb, BarChart3, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { fetchInsights } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { AIInsights } from '../types';

function SkeletonBlock({ h = 'h-4', w = 'w-full' }: { h?: string; w?: string }) {
  return <div className={`skeleton ${h} ${w} rounded-lg`} />;
}

function InsightsSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 space-y-3">
        <SkeletonBlock h="h-3" w="w-24" />
        <SkeletonBlock h="h-5" />
        <SkeletonBlock h="h-5" w="w-4/5" />
        <SkeletonBlock h="h-5" w="w-3/5" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <SkeletonBlock h="h-4" w="w-1/3" />
            <SkeletonBlock h="h-3" />
            <SkeletonBlock h="h-3" w="w-4/5" />
            <SkeletonBlock h="h-3" w="w-3/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

const SECTION_CONFIG = [
  { key: 'hotspots',        icon: MapPin,      title: 'Problem Hotspots',    color: 'from-orange-50 to-amber-50',   dot: 'bg-orange-400',  text: 'text-orange-700' },
  { key: 'trends',          icon: TrendingUp,  title: 'Emerging Trends',     color: 'from-blue-50 to-sky-50',       dot: 'bg-blue-400',    text: 'text-blue-700' },
  { key: 'recommendations', icon: Lightbulb,   title: 'Recommendations',     color: 'from-emerald-50 to-green-50',  dot: 'bg-emerald-400', text: 'text-emerald-700' },
] as const;

const LIKELIHOOD_STYLE: Record<string, string> = {
  high:   'bg-red-100 text-red-700 border border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  low:    'bg-slate-100 text-slate-600 border border-slate-200',
};

export default function InsightsPage() {
  const { getIdToken } = useAuth();
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    try {
      const token = await getIdToken();
      if (!token) return;
      const data = await fetchInsights(token);
      setInsights(data);
      setGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Analysis
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Predictive Insights</h1>
          <p className="text-slate-500 text-sm mt-0.5">AI-powered patterns from your community data</p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-violet-600/20"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          {generated ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {!generated && !loading && !error && (
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl shadow-violet-600/25">
          <div className="absolute top-4 left-8 w-20 h-20 rounded-full bg-white/5" />
          <div className="absolute bottom-4 right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-5 animate-float">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Unlock Community Intelligence</h2>
            <p className="text-violet-200 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              AI analyzes all reported issues to surface hotspots, predict upcoming problems, and recommend actions.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-6 py-3 rounded-2xl hover:bg-violet-50 transition-colors shadow-lg"
            >
              <Brain className="w-4 h-4" />
              Generate Insights
            </button>
          </div>
        </div>
      )}

      {loading && <InsightsSkeleton />}

      {error && !loading && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button type="button" onClick={handleGenerate} className="text-red-600 underline text-sm font-medium">
            Try again
          </button>
        </div>
      )}

      {insights && generated && !loading && (
        <div className="space-y-5 animate-fade-up">
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-violet-600/20">
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider mb-2">Executive Summary</p>
            <p className="text-base sm:text-lg leading-relaxed relative">{insights.summary}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {SECTION_CONFIG.map(({ key, icon: Icon, title, color, dot, text }, idx) => {
              const items = insights[key as keyof AIInsights] as string[];
              return (
                <div key={key} className={`bg-gradient-to-br ${color} rounded-2xl p-5 border border-white/60 stagger-${idx + 1} animate-fade-up`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
                      <Icon className={`w-4 h-4 ${text}`} />
                    </div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">Not enough data yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 shrink-0`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm stagger-4 animate-fade-up">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Predicted Issues</h3>
              </div>
              {insights.predictedCategories.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Report more issues for predictions</p>
              ) : (
                <div className="space-y-2.5">
                  {insights.predictedCategories.map((p) => (
                    <div key={p.category} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-700 font-medium truncate">{p.category}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${LIKELIHOOD_STYLE[p.likelihood] ?? LIKELIHOOD_STYLE.low}`}>
                        {p.likelihood}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
