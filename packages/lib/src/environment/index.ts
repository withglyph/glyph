import { env } from '$env/dynamic/public';

export const stack = env.PUBLIC_PULUMI_STACK;
export const production = stack === 'prod';
