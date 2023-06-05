import type { Config } from '@sveltejs/adapter-vercel';

export { handler as GET, handler as POST } from '$lib/server/graphql/handler';

export const config: Config = {
  runtime: 'nodejs18.x',
};
