import Redis from 'ioredis';
import { PRIVATE_REDIS_URL } from '$env/static/private';

export const redis = new Redis(PRIVATE_REDIS_URL);
