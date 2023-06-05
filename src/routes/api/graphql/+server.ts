import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = { runtime: 'nodejs18.x' };
export { handler as GET, handler as POST } from '$lib/server/graphql/handler';
