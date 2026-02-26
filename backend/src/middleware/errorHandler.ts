import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const isProduction = process.env.NODE_ENV === 'production';

  logger.error('unhandled_error', {
    message,
    status,
    url: req.originalUrl,
    method: req.method,
    stack: isProduction ? undefined : err.stack,
  });

  res.status(status).json({
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
