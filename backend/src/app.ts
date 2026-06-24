import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Create Express app
const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost on any port during development, or configured FRONTEND_URL
      const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5174';
      if (!origin || origin.startsWith('http://localhost') || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed for: ' + origin));
      }
    },
    credentials: true,
  })
);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

import authRoutes from './routes/auth.routes';

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes by default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Routes
app.use('/api/v1/auth', authRoutes);
import csvRoutes from './routes/csv.routes';
app.use('/api/v1/csv', csvRoutes);
import queryRoutes from './routes/query.routes';
app.use('/api/v1/query', queryRoutes);
// The frontend might expect history at /api/v1/history according to PRD
app.use('/api/v1/history', queryRoutes);
import exportRoutes from './routes/export.routes';
app.use('/api/v1/export', exportRoutes);
import databaseRoutes from './routes/database.routes';
app.use('/api/v1/database', databaseRoutes);

// Basic Route for health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is healthy', data: null });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Resource not found', errors: [] });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: process.env.NODE_ENV === 'development' ? err.errors : undefined,
  });
});

export default app;
