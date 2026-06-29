import { useEffect, useState } from 'react';
import { Trophy, Star, Award, Medal, Crown, Flame } from 'lucide-react';
import { getLeaderboard } from '../lib/issues';
import { useAuth } from '../context/AuthContext';
import { BADGES } from '../lib/constants';
import type { UserProfile } from '../types';

const BADGE_MAP: Record<string, { label: string; icon: typeof Trophy }> = {
  [BADGES.FIRST_REPORT.id]:   { label: BADGES.FIRST_REPORT.label,   icon: Star },
  [BADGES.COMMUNITY_HERO.id]: { label: BADGES.COMMUNITY_HERO.label, icon: Trophy },
  [BADGES.VERIFIER.id]:       { label: BADGES.VERIFIER.label,       icon: Award },
  [BADGES.CHAMPION.id]:       { label: BADGES.CHAMPION.label,       icon: Medal },
};

const PODIUM_CONFIG = [
  { rank: 2, h: 'h-20', bg: 'bg-slate-100',  label: 'text-slate-500',  crown: false },
  { rank: 1, h: 'h-28', bg: 'bg-yellow-400', label: 'text-yellow-600', crown: true  },
  { rank: 3, h: 'h-14', bg: 'bg-amber-100',  label: 'text-amber-600',  crown: false },
];

const RANK_LABELS: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };

const BADGE_GUIDE = [
  {
    id: BADGES.FIRST_REPORT.id,
    label: BADGES.FIRST_REPORT.label,
    icon: Star,
    bg: 'bg-amber-50',
    color: 'text-amber-600',
    requirement: 'Submit your very first report',
    how: 'Report any community issue to unlock this badge.',
    reward: '+10 pts',
  },
  {
    id: BADGES.COMMUNITY_HERO.id,
    label: BADGES.COMMUNITY_HERO.label,
    icon: Trophy,
    bg: 'bg-brand-50',
    color: 'text-brand-600',
    requirement: 'Report 10 issues',
    how: 'Keep reporting problems in your area to reach 10 total reports.',
    reward: '+100 pts total',
  },
  {
    id: BADGES.VERIFIER.id,
    label: BADGES.VERIFIER.label,
    icon: Award,
    bg: 'bg-blue-50',
    color: 'text-blue-600',
    requirement: 'Verify 5 issues',
    how: "Visit issue pages and click Verify to confirm others' reports.",
    reward: '+5 pts each',
  },
  {
    id: BADGES.CHAMPION.id,
    label: BADGES.CHAMPION.label,
    icon: Medal,
    bg: 'bg-violet-50',
    color: 'text-violet-600',
    requirement: 'Earn 100 points',
    how: 'Accumulate points by reporting, verifying, and resolving issues.',
    reward: 'Elite status',
  },
];

function Avatar({ name, size = 'md', isYou = false }: { name: string; size?: 'sm' | 'md' | 'lg'; isYou?: boolean }) {
  const sizeClass = size === 'lg' ? 'w-14 h-14 text-lg' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold shrink-0 ${isYou ? 'bg-brand-600 text-white ring-2 ring-brand-300' : 'bg-brand-100 text-brand-700'}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="skeleton w-8 h-5 rounded" />
      <div className="skeleton w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3.5 w-36" />
        <div className="skeleton h-2.5 w-24" />
      </div>
      <div className="skeleton h-5 w-14 rounded-full" />
    </div>
  );
}

export default function LeaderboardPage() {
  const { profile } = useAuth();
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(setLeaders).finally(() => setLoading(false));
  }, []);

  const top3 = leaders.slice(0, 3);
  const myRank = leaders.findIndex((l) => l.uid === profile?.uid) + 1;

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Leaderboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Top community heroes ranked by impact</p>
      </div>

      {profile && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-600 to-emerald-500 p-5 text-white shadow-lg shadow-brand-600/20 animate-fade-up">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={profile.displayName} size="lg" isYou />
              <div>
                <p className="font-bold text-lg leading-tight">{profile.displayName}</p>
                <p className="text-brand-100 text-xs mt-0.5">
                  {profile.reportsCount} reports · {profile.verificationsCount} verifications
                </p>
                {myRank > 0 && (
                  <p className="text-xs text-brand-100 mt-1">
                    Rank <span className="font-bold text-white">#{myRank}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-4xl font-extrabold">{profile.points}</p>
              <p className="text-brand-100 text-xs">points</p>
            </div>
          </div>
          {profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/20">
              {profile.badges.map((b) => {
                const badge = BADGE_MAP[b];
                if (!badge) return null;
                const Icon = badge.icon;
                return (
                  <span key={b} className="inline-flex items-center gap-1 bg-white/15 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    <Icon className="w-3 h-3" />
                    {badge.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!loading && top3.length >= 2 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-fade-up">
          <h2 className="text-center font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Top Heroes
          </h2>
          <div className="flex items-end justify-center gap-3">
            {PODIUM_CONFIG.map(({ rank, h, bg, label, crown: showCrown }) => {
              const hero = top3[rank - 1];
              if (!hero) return <div key={rank} className="w-24" />;
              const isYou = hero.uid === profile?.uid;
              return (
                <div key={rank} className="flex flex-col items-center gap-2 w-24">
                  {showCrown && <Crown className="w-5 h-5 text-yellow-500 animate-float" />}
                  <Avatar name={hero.displayName} size="lg" isYou={isYou} />
                  <p className="text-xs font-semibold text-slate-700 text-center truncate w-full">{hero.displayName}</p>
                  <p className={`text-xs font-bold ${label}`}>{hero.points} pts</p>
                  <div className={`w-full ${h} ${bg} rounded-t-xl flex items-center justify-center`}>
                    <span className="text-xl font-extrabold text-slate-600">{RANK_LABELS[rank] ?? `#${rank}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-fade-up">
        <div className="px-5 py-3.5 border-b border-slate-50 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-slate-800 text-sm">All Rankings</span>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            No heroes yet. Report an issue to appear here!
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {leaders.map((leader, index) => {
              const isMe = leader.uid === profile?.uid;
              const rankNum = index + 1;
              return (
                <div
                  key={leader.uid}
                  className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${isMe ? 'bg-brand-50' : 'hover:bg-slate-50'} stagger-${Math.min(index + 1, 6)} animate-slide-in`}
                >
                  <div className="w-8 text-center">
                    <span className="text-sm font-bold text-slate-400">#{rankNum}</span>
                  </div>
                  <Avatar name={leader.displayName} isYou={isMe} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate text-sm">
                      {leader.displayName}
                      {isMe && <span className="ml-1.5 text-xs text-brand-600 font-medium">(you)</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {leader.reportsCount} reports · {leader.verificationsCount} verifications
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-brand-600 text-sm">{leader.points}</p>
                    <p className="text-xs text-slate-400">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-slate-800 mb-3">How to Earn Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BADGE_GUIDE.map((b, i) => (
            <div key={b.id} className={`bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow stagger-${i + 1} animate-fade-up`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${b.bg}`}>
                <b.icon className={`w-6 h-6 ${b.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="font-semibold text-slate-800 text-sm">{b.label}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.bg} ${b.color}`}>{b.reward}</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">{b.how}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">{b.requirement}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
