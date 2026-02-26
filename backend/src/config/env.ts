import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
  if (!process.env.JWT_SECRET) console.warn('WARNING: JWT_SECRET env var is not set. Using insecure default.');
  if (!process.env.JWT_REFRESH_SECRET) console.warn('WARNING: JWT_REFRESH_SECRET env var is not set. Using insecure default.');
}

export const config = {
  port: process.env.PORT || '5000',
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  nodeEnv,
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
