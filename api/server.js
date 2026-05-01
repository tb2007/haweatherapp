import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import weatherRoutes from './routes/weather.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

app.use(helmet());
app.use(cookieParser());
app.use(express.json());

// Strict rate limit on login to prevent brute force
app.use(
  '/api/auth/login',
  rateLimit({ windowMs: 15 * 60 * 1000, max: process.env.NODE_ENV === 'production' ? 10 : 100, standardHeaders: true, legacyHeaders: false })
);

// General API rate limit
app.use(
  '/api',
  rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false })
);

app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
