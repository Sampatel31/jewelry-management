import logger from './logger';

const TRANSIENT_CODES = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', '40001', '40P01'];

function isTransient(err: any): boolean {
  const code = err?.code || err?.routine || '';
  return TRANSIENT_CODES.some((c) => String(code).includes(c));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 200,
): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (!isTransient(err) || attempt === maxAttempts) throw err;
      const wait = delayMs * Math.pow(2, attempt - 1);
      logger.warn('db_retry', { attempt, error: err.message, waitMs: wait });
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}
