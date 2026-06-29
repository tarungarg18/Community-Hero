import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initFirebase } from './config/firebase';
import aiRoutes from './routes/ai';

dotenv.config();

initFirebase();

const app = express();
const PORT = process.env.PORT ?? 8080;

const allowedOrigins = (process.env.CLIENT_URL ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'community-hero-api' });
});

app.use('/api/ai', aiRoutes);

app.listen(PORT, () => {
  process.stdout.write(`Community Hero API running on port ${PORT}\n`);
});
