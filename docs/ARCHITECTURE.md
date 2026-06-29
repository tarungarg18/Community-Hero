# Architecture

How Community Hero is structured and how data flows.

## High-level diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                      │
│  Pages: Landing, Dashboard, Report, Map, Leaderboard, AI    │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
           │ Firebase SDK                 │ fetch() + Bearer token
           ▼                              ▼
┌──────────────────────┐       ┌──────────────────────────────┐
│      Firebase        │       │   Express API (port 8080)    │
│  Auth + Firestore    │       │   Gemini categorization      │
└──────────────────────┘       └──────────────────────────────┘
           │
           │ (photos NOT stored here)
           ▼
┌──────────────────────┐
│     Cloudinary       │  ← unsigned upload from browser
└──────────────────────┘
```

## Why two backends?

| Service | Used for | Why |
|---------|----------|-----|
| **Firestore** | Users, issues, points, real-time updates | Free tier, real-time listeners, easy auth rules |
| **Express + Gemini** | AI categorize & insights only | Keeps Gemini API key on server, never exposed to browser |

Photos upload **directly from the browser to Cloudinary** (unsigned preset). Firebase Storage is not used.

Maps use **OpenStreetMap tiles** via Leaflet — no Google Maps billing.

---

## Frontend (`client/`)

### Routing (`App.tsx`)

| Route | Page | Auth |
|-------|------|------|
| `/` | Landing | Public |
| `/login`, `/register` | Auth | Public |
| `/verify-email` | Email verification gate | Public |
| `/admin` | Admin issue panel | Public (no auth) |
| `/dashboard` | Stats + recent issues | Protected |
| `/report` | Create issue | Protected |
| `/map` | All issues on map | Protected |
| `/issues/:id` | Issue detail + verify | Protected |
| `/leaderboard` | Rankings + badge guide | Protected |
| `/insights` | AI analytics | Protected |

### Key modules

| File | Role |
|------|------|
| `context/AuthContext.tsx` | Firebase auth state, login/register/logout |
| `lib/firebase.ts` | Firebase app init (Auth + Firestore only) |
| `lib/issues.ts` | Firestore CRUD, subscriptions, gamification |
| `lib/cloudinary.ts` | Image upload to Cloudinary |
| `lib/api.ts` | Calls Express `/api/ai/*` with Firebase ID token |
| `components/MapView.tsx` | Leaflet maps (picker, static, all issues) |

### Real-time updates

`subscribeToIssues()` uses Firestore `onSnapshot` — dashboard and map update without refresh when new issues are added.

---

## Backend (`server/`)

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| POST | `/api/ai/categorize` | Classify issue (text and/or image) |
| POST | `/api/ai/insights` | Generate community analytics |

All `/api/ai/*` routes require `Authorization: Bearer <Firebase ID token>`.

### Gemini usage (minimal calls)

- Report page: AI auto-triggers on description change (debounced 800ms, min 15 chars) and on photo upload.
- Insights page: user clicks **Generate Insights** (manual trigger).
- 1-retry mechanism on API failures (`retriesLeft` param in `apiFetch`).

Model name from `GEMINI_MODEL` env var (default `gemini-2.5-flash`).

---

## Data model (Firestore)

### Collection: `users/{uid}`

```typescript
{
  displayName: string
  email: string
  photoURL: string | null
  points: number
  reportsCount: number
  verificationsCount: number
  badges: string[]
  createdAt: timestamp
}
```

### Collection: `issues/{id}`

```typescript
{
  title: string
  description: string
  category: string
  status: 'reported' | 'verified' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'critical'
  location: { lat, lng, address }
  imageUrls: string[]        // Cloudinary URLs
  reporterId: string
  reporterName: string
  verifiedBy: string[]
  verificationCount: number
  aiSummary?: string
  tags: string[]
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## Issue lifecycle

```
reported  →  (3+ verifications)  →  verified  →  in_progress  →  resolved
                auto-promote
```

- Reporter can mark **in progress** or **resolved**.
- Resolving gives the reporter a +20 point bonus.

---

## Gamification

| Action | Points | Badge trigger |
|--------|--------|---------------|
| Report issue | +10 | First Report, Community Hero (10 reports) |
| Verify issue | +5 | Trusted Verifier (5 verifications) |
| Issue resolved | +20 to reporter | Neighborhood Champion (100 pts) |

---

## Security model

- **Client → Firestore:** secured by `firestore.rules`. Issues collection allows `update: if true` (public admin panel). All other writes require auth.
- **Client → Express:** Firebase ID token verified server-side via Admin SDK.
- **Client → Cloudinary:** unsigned preset only (no secret in frontend).
- **Gemini key:** server-only in `server/.env`.
- **Email verification:** required for email/password sign-ups. Google OAuth users bypass this (Google verifies email itself). Non-verified users are redirected to `/verify-email`.

See `firestore.rules` for field-level update restrictions on user documents.

---

## Deploy targets

| Component | Target |
|-----------|--------|
| React build (`client/dist`) | Firebase Hosting |
| Express API | Google Cloud Run |
| Firestore rules/indexes | `firebase deploy --only firestore` |
