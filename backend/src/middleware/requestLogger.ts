import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const latency = Date.now() - start;
    const userId = (req as any).user?.id || 'anonymous';
    logger.info('request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      latencyMs: latency,
      userId,
      ip: req.ip,
    });
  });
  next();
};
