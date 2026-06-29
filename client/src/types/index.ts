export type IssueStatus = 'reported' | 'verified' | 'in_progress' | 'resolved';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: IssueStatus;
  priority: IssuePriority;
  location: GeoLocation;
  imageUrls: string[];
  reporterId: string;
  reporterName: string;
  verifiedBy: string[];
  verificationCount: number;
  aiSummary?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  points: number;
  reportsCount: number;
  verificationsCount: number;
  badges: string[];
  createdAt: Date;
}

export interface AICategorization {
  category: string;
  priority: IssuePriority;
  summary: string;
  suggestedTitle: string;
  tags: string[];
}

export interface AIInsights {
  summary: string;
  hotspots: string[];
  trends: string[];
  recommendations: string[];
  predictedCategories: { category: string; likelihood: string }[];
}

export interface DashboardStats {
  total: number;
  reported: number;
  verified: number;
  inProgress: number;
  resolved: number;
  byCategory: Record<string, number>;
}
