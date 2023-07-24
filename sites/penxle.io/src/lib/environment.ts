import { PUBLIC_VERCEL_GIT_COMMIT_REF } from '$env/static/public';

export const production = PUBLIC_VERCEL_GIT_COMMIT_REF === 'main';
