import { building } from '$app/environment';
import { env } from '$env/dynamic/public';

export const stack = building ? '' : env.PUBLIC_PULUMI_STACK;
export const production = stack === 'prod';
