import type { Config } from '@sveltejs/adapter-vercel';

export { handler as GET, handler as POST } from '$lib/server/internal/handler';

export const config: Config = {
  runtime: 'nodejs18.x',
  regions: ['hnd1'],
};
