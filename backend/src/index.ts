import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import logger from './utils/logger';
import db from './config/db';
import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import categoriesRoutes from './routes/categories.routes';
import inventoryRoutes from './routes/inventory.routes';
import customersRoutes from './routes/customers.routes';
import suppliersRoutes from './routes/suppliers.routes';
import purchasesRoutes from './routes/purchases.routes';
import billingRoutes from './routes/billing.routes';
import posRoutes from './routes/pos.routes';
import productionRoutes from './routes/production.routes';
import repairsRoutes from './routes/repairs.routes';
import reportsRoutes from './routes/reports.routes';
import settingsRoutes from './routes/settings.routes';
import aiRoutes from './routes/ai.routes';
import creditNoteRoutes from './routes/creditNote.routes';
import debitNoteRoutes from './routes/debitNote.routes';
import auditLogRoutes from './routes/auditLog.routes';
import { collectDefaultMetrics, register } from 'prom-client';

collectDefaultMetrics();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || config.corsOrigin)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// HPP protection
app.use(hpp());

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
});

const posLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many POS requests, please try again later.' },
});

app.use(globalLimiter);
app.use(requestLogger);

// Routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/billing/invoices/:id/credit-note', creditNoteRoutes);
app.use('/api/billing/invoices/:id/debit-note', debitNoteRoutes);
app.use('/api/pos', posLimiter, posRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/repairs', repairsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Health check
app.get('/health', async (req, res) => {
  const start = Date.now();
  let dbStatus = 'ok';
  try {
    await db.raw('SELECT 1');
  } catch {
    dbStatus = 'degraded';
  }
  const latency = Date.now() - start;
  const status = dbStatus === 'ok' ? 'ok' : 'degraded';
  res.status(dbStatus === 'ok' ? 200 : 503).json({
    status,
    db: dbStatus,
    uptime: process.uptime(),
    dbLatencyMs: latency,
    timestamp: new Date().toISOString(),
  });
});

// API Health check (with version)
app.get('/api/health', async (req, res) => {
  const start = Date.now();
  let dbStatus = 'connected';
  try {
    await db.raw('SELECT 1');
  } catch {
    dbStatus = 'disconnected';
  }
  const latency = Date.now() - start;
  res.status(dbStatus === 'connected' ? 200 : 503).json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '1.0.0',
    dbLatencyMs: latency,
  });
});

// Prometheus metrics
app.get('/metrics', async (req, res) => {
  const token = process.env.METRICS_TOKEN;
  if (token && req.headers['x-metrics-token'] !== token) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('server_start', { port: PORT, env: process.env.NODE_ENV });
});

export default app;

