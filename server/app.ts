import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initFirestoreData } from './store/state';

import authRoutes from './routes/auth';
import academicRoutes from './routes/academic';
import studentsRoutes from './routes/students';
import marksRoutes from './routes/marks';
import attendanceRoutes from './routes/attendance';
import auditRoutes from './routes/audit';

export function createExpressApp() {
  const app = express();

  // 1. Helmet Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for Vite HMR/inline React script/style tags
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. CORS Middleware for safe cross-origin request handling
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 3. Body parsers with safe request limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount API modules
  app.use('/api/auth', authRoutes);
  app.use('/api', authRoutes);
  app.use('/api', academicRoutes);
  app.use('/api/students', studentsRoutes);
  app.use('/api', marksRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api', auditRoutes);

  return app;
}

export async function startServer() {
  const PORT = 3000;
  const app = createExpressApp();

  // Load Firestore persistent records or seed defaults
  await initFirestoreData();

  // Vite Development or Static Production Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Academic Portal Server running on http://localhost:${PORT}`);
  });
}
