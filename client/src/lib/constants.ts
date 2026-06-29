export const ISSUE_CATEGORIES = [
  'Pothole',
  'Water Leakage',
  'Streetlight',
  'Waste Management',
  'Road Damage',
  'Public Safety',
  'Parks & Recreation',
  'Signage',
  'Other',
] as const;

export const ISSUE_STATUSES = [
  'reported',
  'verified',
  'in_progress',
  'resolved',
] as const;

export const STATUS_LABELS: Record<string, string> = {
  reported: 'Reported',
  verified: 'Verified',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export const STATUS_COLORS: Record<string, string> = {
  reported: 'bg-amber-100 text-amber-800',
  verified: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  resolved: 'bg-emerald-100 text-emerald-800',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const POINTS = {
  REPORT: 10,
  VERIFY: 5,
  RESOLVED_BONUS: 20,
} as const;

export const BADGES = {
  FIRST_REPORT: { id: 'first_report', label: 'First Report', minReports: 1 },
  COMMUNITY_HERO: { id: 'community_hero', label: 'Community Hero', minReports: 10 },
  VERIFIER: { id: 'verifier', label: 'Trusted Verifier', minVerifications: 5 },
  CHAMPION: { id: 'champion', label: 'Neighborhood Champion', minPoints: 100 },
} as const;
