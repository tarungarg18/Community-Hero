import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadToCloudinary } from './cloudinary';
import type { Issue, IssueStatus, UserProfile, DashboardStats } from '../types';
import { BADGES, POINTS } from './constants';

function toDate(value: Timestamp | Date | undefined): Date {
  if (!value) return new Date();
  if (value instanceof Timestamp) return value.toDate();
  return value;
}

function mapIssue(id: string, data: Record<string, unknown>): Issue {
  return {
    id,
    title: data.title as string,
    description: data.description as string,
    category: data.category as string,
    status: data.status as Issue['status'],
    priority: data.priority as Issue['priority'],
    location: data.location as Issue['location'],
    imageUrls: (data.imageUrls as string[]) ?? [],
    reporterId: data.reporterId as string,
    reporterName: data.reporterName as string,
    verifiedBy: (data.verifiedBy as string[]) ?? [],
    verificationCount: (data.verificationCount as number) ?? 0,
    aiSummary: data.aiSummary as string | undefined,
    tags: (data.tags as string[]) ?? [],
    createdAt: toDate(data.createdAt as Timestamp),
    updatedAt: toDate(data.updatedAt as Timestamp),
  };
}

export async function ensureUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string,
): Promise<UserProfile> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const d = snap.data();
    const storedName = d.displayName as string;
    if (displayName && displayName !== 'Citizen' && storedName !== displayName) {
      await updateDoc(userRef, { displayName });
    }
    return {
      uid,
      displayName: (displayName && displayName !== 'Citizen') ? displayName : storedName,
      email: d.email as string,
      photoURL: d.photoURL as string | undefined,
      points: d.points as number,
      reportsCount: d.reportsCount as number,
      verificationsCount: d.verificationsCount as number,
      badges: (d.badges as string[]) ?? [],
      createdAt: toDate(d.createdAt as Timestamp),
    };
  }

  const profile = {
    displayName,
    email,
    photoURL: photoURL ?? null,
    points: 0,
    reportsCount: 0,
    verificationsCount: 0,
    badges: [],
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, profile);

  return {
    uid,
    displayName,
    email,
    photoURL,
    points: 0,
    reportsCount: 0,
    verificationsCount: 0,
    badges: [],
    createdAt: new Date(),
  };
}

export async function uploadIssueImage(file: File): Promise<string> {
  return uploadToCloudinary(file);
}

export interface CreateIssueInput {
  title: string;
  description: string;
  category: string;
  priority: Issue['priority'];
  location: Issue['location'];
  imageUrls: string[];
  aiSummary?: string;
  tags: string[];
  reporterId: string;
  reporterName: string;
}

export async function createIssue(input: CreateIssueInput): Promise<string> {
  const docRef = await addDoc(collection(db, 'issues'), {
    ...input,
    status: 'reported',
    verifiedBy: [],
    verificationCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const userRef = doc(db, 'users', input.reporterId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const newReports = ((userData?.reportsCount as number) ?? 0) + 1;
  const newPoints = ((userData?.points as number) ?? 0) + POINTS.REPORT;
  const badges = [...((userData?.badges as string[]) ?? [])];

  if (newReports >= 1 && !badges.includes(BADGES.FIRST_REPORT.id)) {
    badges.push(BADGES.FIRST_REPORT.id);
  }
  if (newReports >= BADGES.COMMUNITY_HERO.minReports && !badges.includes(BADGES.COMMUNITY_HERO.id)) {
    badges.push(BADGES.COMMUNITY_HERO.id);
  }
  if (newPoints >= BADGES.CHAMPION.minPoints && !badges.includes(BADGES.CHAMPION.id)) {
    badges.push(BADGES.CHAMPION.id);
  }

  await updateDoc(userRef, {
    reportsCount: increment(1),
    points: increment(POINTS.REPORT),
    badges,
  });

  return docRef.id;
}

export function subscribeToIssues(callback: (issues: Issue[]) => void): () => void {
  const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const issues = snapshot.docs.map((d) => mapIssue(d.id, d.data()));
    callback(issues);
  });
}

export async function getIssue(id: string): Promise<Issue | null> {
  const snap = await getDoc(doc(db, 'issues', id));
  if (!snap.exists()) return null;
  return mapIssue(snap.id, snap.data());
}

export async function verifyIssue(
  issueId: string,
  userId: string,
): Promise<void> {
  const issueRef = doc(db, 'issues', issueId);
  const issueSnap = await getDoc(issueRef);
  if (!issueSnap.exists()) throw new Error('Issue not found');

  const data = issueSnap.data();
  const verifiedBy = (data.verifiedBy as string[]) ?? [];
  if (verifiedBy.includes(userId)) throw new Error('Already verified');

  const newCount = ((data.verificationCount as number) ?? 0) + 1;
  const updates: Record<string, unknown> = {
    verifiedBy: arrayUnion(userId),
    verificationCount: newCount,
    updatedAt: serverTimestamp(),
  };

  if (newCount >= 3 && data.status === 'reported') {
    updates.status = 'verified';
  }

  await updateDoc(issueRef, updates);

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const newVerifications = ((userData?.verificationsCount as number) ?? 0) + 1;
  const badges = [...((userData?.badges as string[]) ?? [])];

  if (newVerifications >= BADGES.VERIFIER.minVerifications && !badges.includes(BADGES.VERIFIER.id)) {
    badges.push(BADGES.VERIFIER.id);
  }

  await updateDoc(userRef, {
    verificationsCount: increment(1),
    points: increment(POINTS.VERIFY),
    badges,
  });
}

export async function updateIssueStatus(
  issueId: string,
  status: IssueStatus,
): Promise<void> {
  const issueRef = doc(db, 'issues', issueId);
  const issueSnap = await getDoc(issueRef);
  if (!issueSnap.exists()) throw new Error('Issue not found');

  await updateDoc(issueRef, {
    status,
    updatedAt: serverTimestamp(),
  });

  if (status === 'resolved') {
    const reporterId = issueSnap.data().reporterId as string;
    await updateDoc(doc(db, 'users', reporterId), {
      points: increment(POINTS.RESOLVED_BONUS),
    });
  }
}

export async function getLeaderboard(): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(20));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    uid: d.id,
    displayName: d.data().displayName as string,
    email: d.data().email as string,
    photoURL: d.data().photoURL as string | undefined,
    points: d.data().points as number,
    reportsCount: d.data().reportsCount as number,
    verificationsCount: d.data().verificationsCount as number,
    badges: (d.data().badges as string[]) ?? [],
    createdAt: toDate(d.data().createdAt as Timestamp),
  }));
}

export function computeStats(issues: Issue[]): DashboardStats {
  const byCategory: Record<string, number> = {};
  let reported = 0;
  let verified = 0;
  let inProgress = 0;
  let resolved = 0;

  for (const issue of issues) {
    byCategory[issue.category] = (byCategory[issue.category] ?? 0) + 1;
    if (issue.status === 'reported') reported++;
    else if (issue.status === 'verified') verified++;
    else if (issue.status === 'in_progress') inProgress++;
    else if (issue.status === 'resolved') resolved++;
  }

  return {
    total: issues.length,
    reported,
    verified,
    inProgress,
    resolved,
    byCategory,
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid,
    displayName: d.displayName as string,
    email: d.email as string,
    photoURL: d.photoURL as string | undefined,
    points: d.points as number,
    reportsCount: d.reportsCount as number,
    verificationsCount: d.verificationsCount as number,
    badges: (d.badges as string[]) ?? [],
    createdAt: toDate(d.createdAt as Timestamp),
  };
}

export async function getUserIssues(userId: string): Promise<Issue[]> {
  const q = query(
    collection(db, 'issues'),
    where('reporterId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapIssue(d.id, d.data()));
}
