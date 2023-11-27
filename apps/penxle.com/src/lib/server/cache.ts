import Redis from 'ioredis';
import { env } from '$env/dynamic/private';

export const redis = new Redis(env.PRIVATE_REDIS_URL);

export const useCache = async <T>(key: string, fn: () => Promise<T>, ttl = 60 * 5) => {
  const r = await redis.get(key);
  if (r) {
    return JSON.parse(r);
  }

  const value = await fn();
  await redis.setex(key, ttl, JSON.stringify(value));

  return value;
};
