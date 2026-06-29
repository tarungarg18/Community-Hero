# Community Hero

Hyperlocal civic issue reporting platform for Google Cloud hackathons. Citizens report potholes, leaks, broken lights, and other neighborhood problems; the community verifies them; Gemini AI helps categorize reports and generate insights.

## Quick links

| Document | Purpose |
|----------|---------|
| [Local setup](docs/LOCAL_SETUP.md) | Install, configure env, run on your machine |
| [Architecture](docs/ARCHITECTURE.md) | How frontend, backend, Firebase, Cloudinary, and Gemini fit together |
| [Environment variables](docs/ENVIRONMENT.md) | Every env var explained |

## Tech stack (free tier)

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express, TypeScript |
| Auth & database | Firebase Auth + Cloud Firestore |
| Image storage | Cloudinary (unsigned upload preset) |
| AI | Google Gemini via backend API |
| Maps | OpenStreetMap + Leaflet (no API key) |
| Deploy (optional) | Firebase Hosting + Cloud Run |

## Features

- Report issues with photos and map pin
- Optional Gemini analysis (manual button — not automatic)
- Community verification and status tracking
- Real-time dashboard with charts
- Leaderboard, points, and badges
- AI insights page (manual generate)

## Project structure

```
Community-Hero/
├── client/                 React frontend
│   ├── src/
│   │   ├── pages/          Route pages (dashboard, report, map, etc.)
│   │   ├── components/     UI + map components
│   │   ├── context/        Auth state
│   │   └── lib/            Firebase, Cloudinary, API helpers
│   └── .env.example
├── server/                 Express API (Gemini + auth verification)
│   ├── src/
│   │   ├── routes/         /api/ai endpoints
│   │   ├── services/       Gemini integration
│   │   └── middleware/     Firebase token verification
│   └── .env.example
├── docs/                   Detailed documentation
├── firestore.rules         Firestore security rules
├── firestore.indexes.json  Required composite indexes
└── firebase.json           Firebase Hosting + Firestore config
```

## Run locally (short version)

1. Copy `client/.env.example` → `client/.env` and fill in Firebase + Cloudinary values.
2. Copy `server/.env.example` → `server/.env` and fill in Gemini + Firebase service account values.
3. Install dependencies and start both apps:

```bash
npm run install:all

# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client
```

4. Open **http://localhost:5173**

Full step-by-step instructions: [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md)

## Security

**Never commit secrets.** The root `.gitignore` blocks:

- All `.env` files (except `.env.example`)
- Firebase service account JSON files (`*-firebase-adminsdk-*.json`)

If you downloaded a service account JSON, copy values into `server/.env` and keep the JSON file **outside** the repo or delete it after setup.

## Deploy (optional)

See [docs/LOCAL_SETUP.md#deploy-optional](docs/LOCAL_SETUP.md) for Firebase Hosting and Cloud Run notes.

## License

MIT
