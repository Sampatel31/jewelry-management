import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Handle operational AppErrors
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  // Map known DB/Knex errors to friendly messages
  let friendlyMessage: string | null = null;
  let status = err.status || err.statusCode || 500;

  if (err.code === '23505' || (err.message && err.message.includes('unique constraint'))) {
    friendlyMessage = 'This record already exists.';
    status = 409;
  } else if (err.code === '23503' || (err.message && err.message.includes('foreign key constraint'))) {
    friendlyMessage = 'Referenced record does not exist.';
    status = 400;
  } else if (err.code === '23502' || (err.message && err.message.includes('not-null constraint'))) {
    friendlyMessage = 'A required field is missing.';
    status = 400;
  } else if (err.code === '23514' || (err.message && err.message.includes('check constraint'))) {
    friendlyMessage = 'Value violates a data constraint (e.g., stock cannot go negative).';
    status = 400;
  }

  const message = friendlyMessage || (isProduction ? 'Something went wrong. Please try again.' : (err.message || 'Internal Server Error'));

  logger.error('unhandled_error', {
    message: err.message,
    status,
    url: req.originalUrl,
    method: req.method,
    stack: isProduction ? undefined : err.stack,
  });

  res.status(status).json({
    success: false,
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
