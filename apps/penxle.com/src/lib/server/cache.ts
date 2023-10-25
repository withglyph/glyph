import Redis from 'ioredis';
import { PRIVATE_REDIS_URL } from '$env/static/private';

export const redis = new Redis(PRIVATE_REDIS_URL);

export const useCache = async <T>(key: string, fn: () => Promise<T>, ttl = 60 * 5) => {
  const r = await redis.get(key);
  if (r) {
    return JSON.parse(r);
  }

  const value = await fn();
  await redis.setex(key, ttl, JSON.stringify(value));

  return value;
};
