import Redis from 'ioredis';
import logger from './logger';

let client: Redis | null = null;
let available = false;

function getClient(): Redis | null {
  if (client) return client;
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return null;

  client = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: (times) => (times > 3 ? null : 500),
  });

  client.on('connect', () => {
    available = true;
    logger.info('redis_connected');
  });
  client.on('error', (err) => {
    available = false;
    logger.warn('redis_error', { message: err.message });
  });
  client.on('close', () => {
    available = false;
  });

  client.connect().catch(() => {
    available = false;
    logger.warn('redis_unavailable', { message: 'Redis not reachable, caching disabled' });
  });

  return client;
}

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const c = getClient();
    if (!c || !available) return null;
    return await c.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  try {
    const c = getClient();
    if (!c || !available) return;
    await c.set(key, value, 'EX', ttlSeconds);
  } catch {
    // graceful degradation
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    const c = getClient();
    if (!c || !available) return;
    await c.del(...keys);
  } catch {
    // graceful degradation
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const c = getClient();
    if (!c || !available) return;
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [nextCursor, batch] = await c.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== '0');
    if (keys.length > 0) await c.del(...keys);
  } catch {
    // graceful degradation
  }
}
