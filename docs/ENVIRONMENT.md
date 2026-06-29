# Environment variables

Reference for all configuration. Copy from `.env.example` files — never commit real values.

---

## Client (`client/.env`)

All client vars must start with `VITE_` to be exposed to the browser.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | From Firebase config (not used for uploads) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase web app config |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase web app config |
| `VITE_API_URL` | Yes | Backend URL. Local: `http://localhost:8080` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary dashboard cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Yes | Unsigned preset name (`community_hero`) |

**Where to get Firebase values:** Firebase Console → Project settings → General → Your apps → Web app config.

**Where to get Cloudinary values:** Cloudinary Console → Dashboard (cloud name) and Upload presets.

---

## Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | From [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | No | Default: `gemini-2.5-flash` |
| `FIREBASE_PROJECT_ID` | Yes | Service account `project_id` |
| `FIREBASE_CLIENT_EMAIL` | Yes | Service account `client_email` |
| `FIREBASE_PRIVATE_KEY` | Yes | Service account `private_key` in quotes with `\n` |
| `FIREBASE_STORAGE_BUCKET` | Yes | e.g. `project-id.firebasestorage.app` |
| `CLIENT_URL` | Yes | Frontend origin for CORS. Local: `http://localhost:5173` |
| `PORT` | No | Default: `8080` |

**Private key format example:**

```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

---

## Files that must NOT be committed

| Pattern | Reason |
|---------|--------|
| `.env` | Contains secrets |
| `*-firebase-adminsdk-*.json` | Full service account credentials |
| `node_modules/`, `dist/` | Generated / dependencies |

These are listed in the root `.gitignore`.

---

## Production overrides

When deploying:

1. Set `VITE_API_URL` to your Cloud Run URL before building the client.
2. Set `CLIENT_URL` on the server to your Firebase Hosting URL (e.g. `https://your-project.web.app`).
3. Add the Hosting domain to Firebase Auth **Authorized domains**.
