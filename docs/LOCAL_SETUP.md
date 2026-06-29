# Local setup guide

Complete instructions to run Community Hero on your machine.

## Prerequisites

- **Node.js 20+** and npm
- A **Firebase** project (Spark/free plan)
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)
- A **Cloudinary** account (free tier) for issue photo uploads

---

## Step 1: Firebase project

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** → Email/Password and Google sign-in.
3. Enable **Cloud Firestore** (start in test mode for local dev; deploy rules before production).
4. Register a **Web app** and copy the config object.

You do **not** need Firebase Storage — photos go to Cloudinary.

---

## Step 2: Cloudinary upload preset

1. Sign up at [cloudinary.com](https://cloudinary.com/).
2. Dashboard → **Settings** → **Upload** → **Upload presets**.
3. Add preset:
   - **Name:** `community_hero`
   - **Signing mode:** **Unsigned**
   - Save

Note your **Cloud name** from the dashboard.

---

## Step 3: Firebase service account (backend only)

1. Firebase Console → Project settings → **Service accounts**.
2. **Generate new private key** (downloads a JSON file).
3. Copy these fields into `server/.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep quotes and `\n`)

**Important:** Do not commit the JSON file. It is listed in `.gitignore`. Delete it after copying values to `.env`, or store it outside this folder.

---

## Step 4: Environment files

### Client — `client/.env`

```bash
cd client
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Fill in:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_API_URL=http://localhost:8080

VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=community_hero
```

### Server — `server/.env`

```bash
cd server
copy .env.example .env
```

Fill in:

```env
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=...

CLIENT_URL=http://localhost:5173
PORT=8080
```

Use `gemini-2.5-flash` unless you know a newer model name works with your API key.

---

## Step 5: Install dependencies

From the project root:

```bash
npm run install:all
```

Or separately:

```bash
cd server && npm install
cd ../client && npm install
```

---

## Step 6: Run the app

Use **two terminals**.

**Terminal 1 — API (port 8080):**

```bash
npm run dev:server
```

You should see: `Community Hero API running on port 8080`

**Terminal 2 — Frontend (port 5173):**

```bash
npm run dev:client
```

Open **http://localhost:5173**

---

## Step 7: First-time Firebase checks

If sign-in or Firestore fails:

1. **Authorized domains** (Authentication → Settings): ensure `localhost` is listed.
2. **Firestore rules**: for production, deploy from project root:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
3. **Cloudinary**: if photo upload fails, confirm preset name is `community_hero` and mode is **Unsigned**.

---

## Verify everything works

| Check | How |
|-------|-----|
| Auth | Register or sign in with Google |
| Report | Upload photo, pin location, submit |
| AI | Click **Analyze with Gemini AI** on report page (optional) |
| Map | Open Map page — pins appear |
| Verify | Open an issue as another user → Verify |
| Insights | AI Insights → **Generate Insights** (uses Gemini once) |

---

## Common issues

### `Cloudinary is not configured`

Set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in `client/.env`, then restart the client dev server.

### `GEMINI_API_KEY is not configured`

Set the key in `server/.env` and restart the server.

### `Invalid or expired token` on AI calls

Sign out and sign in again. The backend verifies Firebase ID tokens.

### Firestore permission denied

Deploy rules: `firebase deploy --only firestore:rules`

Or use test mode temporarily in Firebase Console (not for production).

### CORS errors

Ensure `CLIENT_URL=http://localhost:5173` in `server/.env` and `VITE_API_URL=http://localhost:8080` in `client/.env`.

---

## Deploy (optional)

### Backend → Cloud Run

```bash
cd server
gcloud run deploy community-hero-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=...,FIREBASE_PROJECT_ID=...,..."
```

Update `VITE_API_URL` in client to the Cloud Run URL before building the frontend.

### Frontend → Firebase Hosting

```bash
cd client && npm run build
cd .. && firebase deploy --only hosting,firestore
```

Add your Hosting domain to Firebase Auth authorized domains.

---

## Production checklist

- [ ] `.env` files never committed
- [ ] Service account JSON removed from project folder
- [ ] Firestore rules deployed
- [ ] Cloudinary preset is unsigned only (no API secret in frontend)
- [ ] Auth authorized domains include production URL
